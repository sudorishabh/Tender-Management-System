import { db } from "@/server/db";
import {
  usersTable,
  vendorProfileTable,
  businessTable,
  adminInvitesTable,
} from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { hashPassword } from "@/lib/server/utils";
import { ApiError, BadRequestError, ConflictError } from "@/lib/server/errors";
import { sendMail } from "@/lib/server/email";
import {
  adminInviteEmail,
  vendorRegistrationEmail,
  adminVendorRegistrationNotification,
} from "@/lib/server/email-templates/auth.templates";
import type {
  AcceptAdminInviteInput,
  SendAdminInviteInput,
  VendorRegistrationType,
} from "./auth.schema";
import crypto from "crypto";
import { assertUploadsNotInUse } from "../s3/s3.service";

// MUTATION
//////////////////////////////////////////////////////////////////

// REGISTER VENDOR
export async function registerVendorService(data: VendorRegistrationType) {
  const {
    user: userData,
    vendor: vendorData,
    business: businessData,
    vendor_source,
  } = data;

  await assertUploadsNotInUse([
    vendorData.vendor_pan_doc_key,
    vendorData.vendor_adhar_doc_key,
    businessData.biz_reg_doc_key,
    businessData.biz_gst_doc_key,
    businessData.biz_bank_doc_key,
    businessData.biz_msme_cert_doc_key,
  ]);

  const hashedPassword = await hashPassword(userData.password);

  try {
    await db.transaction(async (tx) => {
      // Create user
      const [user] = await tx
        .insert(usersTable)
        .values({
          ...userData,
          password: hashedPassword,
        })
        .$returningId();

      // Create vendor profile
      const [vendor] = await tx
        .insert(vendorProfileTable)
        .values({
          ...vendorData,
          user_id: user.user_id,
          vendor_code: "VENDOR-" + user.user_id,
          vendor_source: vendor_source as "direct" | "invite",
        })
        .$returningId();

      // Create business
      await tx.insert(businessTable).values({
        ...businessData,
        vendor_id: vendor.vendor_id,
      });

      // Send confirmation email to vendor
      const vendorEmailTemplate = vendorRegistrationEmail({
        vendorName: userData.full_name || "Vendor",
        vendorEmail: userData.email,
        businessName:
          businessData.biz_legal_name ||
          businessData.biz_trade_name ||
          "Your Business",
      });

      await sendMail({
        to: userData.email,
        subject: vendorEmailTemplate.subject,
        text: vendorEmailTemplate.text,
        html: vendorEmailTemplate.html,
      });

      // Send notification email to admin
      const adminEmailTemplate = adminVendorRegistrationNotification({
        vendorName: userData.full_name || "Vendor",
        vendorEmail: userData.email,
        businessName:
          businessData.biz_legal_name || businessData.biz_trade_name || "N/A",
        vendorContact: vendorData.vendor_contact || "N/A",
        vendorSource: vendor_source,
      });

      const adminEmail = process.env.EMAIL_FROM || process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await sendMail({
          to: adminEmail,
          subject: adminEmailTemplate.subject,
          text: adminEmailTemplate.text,
          html: adminEmailTemplate.html,
        });
      }
    });

    return { success: true };
  } catch (error: unknown) {
    // Handle duplicate entry error
    if (
      error &&
      typeof error === "object" &&
      ("errno" in error || "code" in error)
    ) {
      const dbError = error as { errno?: number; code?: string };
      if (dbError.errno === 1062 || dbError.code === "ER_DUP_ENTRY") {
        throw new ConflictError(
          "Vendor already exists, please login to continue",
          "VENDOR_ALREADY_EXISTS",
        );
      }
    }
    throw new BadRequestError(
      "Failed to register vendor, please try again",
      "FAILED_TO_REGISTER_VENDOR",
    );
  }
}

export const acceptAdminInvite = async (data: AcceptAdminInviteInput) => {
  const { token, password, full_name } = data;

  // Get invite
  const invite = await db
    .select()
    .from(adminInvitesTable)
    .where(eq(adminInvitesTable.invite_token, token))
    .limit(1);

  if (invite.length === 0) {
    throw new ApiError("Invalid invite token, please try again", 400);
  }

  const inviteData = invite[0];

  // Check if already used
  if (inviteData.invite_is_used) {
    throw new ApiError(
      "This invite has already been used, please request a new invite",
      400,
    );
  }

  // Check if expired
  const now = new Date();
  if (new Date(inviteData.invite_expires_at) < now) {
    throw new ApiError(
      "This invite has expired, please request a new invite",
      400,
    );
  }

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, inviteData.invite_email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new ApiError("User already exists, please login to continue", 400);
  }

  // Hash password

  const hashedPW = await hashPassword(password);

  // Create user and admin profile in transaction
  try {
    await db.transaction(async (tx) => {
      await tx.insert(usersTable).values({
        email: inviteData.invite_email,
        password: hashedPW,
        role: "admin",
        full_name: full_name.trim(),
      });

      await tx
        .update(adminInvitesTable)
        .set({
          invite_is_used: true,
          invite_used_at: now,
        })
        .where(eq(adminInvitesTable.invite_id, inviteData.invite_id));
    });

    return { success: true, message: "Admin account created successfully" };
  } catch (error: any) {
    if (error.errno === 1062) {
      throw new ApiError("User already exists, please login to continue", 400);
    }
    throw new ApiError(
      "Failed to create admin account, please try again later",
      500,
    );
  }
};

export const sendAdminInvite = async (
  data: SendAdminInviteInput,
  invitedBy: number,
) => {
  const { email, full_name } = data;

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new ApiError("User already exists, please login to continue", 400);
  }

  // Check for existing pending invite
  const existingInvite = await db
    .select()
    .from(adminInvitesTable)
    .where(
      and(
        eq(adminInvitesTable.invite_email, email),
        eq(adminInvitesTable.invite_is_used, false),
      ),
    )
    .limit(1);

  if (existingInvite.length > 0) {
    const now = new Date();
    if (new Date(existingInvite[0].invite_expires_at) > now) {
      throw new ApiError(
        "An invite is already pending for this email, please check your email for the invite.",
        400,
      );
    }
  }

  // Generate token and expiry
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Insert invite
  await db.insert(adminInvitesTable).values({
    invite_email: email,
    invite_token: token,
    invite_expires_at: expiresAt,
    invited_by: invitedBy,
  });

  // Send email
  const inviteLink = `${
    process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
  }/accept-invite?token=${token}`;

  const { subject, text, html } = adminInviteEmail({
    url: inviteLink,
    adminName: full_name,
    expirationTime: "10 minutes",
  });

  try {
    await sendMail({
      to: email,
      subject,
      text,
      html,
    });
    return { success: true, message: "Admin invite sent successfully" };
  } catch (error) {
    // Rollback invite if email fails
    await db
      .delete(adminInvitesTable)
      .where(eq(adminInvitesTable.invite_email, email));
    throw new ApiError("Failed to send email, please try again later", 500);
  }
};

// QUERY
//////////////////////////////////////////////////////////////////

export const getInviteDetails = async (token: string) => {
  const invite = await db
    .select({
      email: adminInvitesTable.invite_email,
      expires_at: adminInvitesTable.invite_expires_at,
      is_used: adminInvitesTable.invite_is_used,
    })
    .from(adminInvitesTable)
    .where(eq(adminInvitesTable.invite_token, token))
    .limit(1);

  if (invite.length === 0) {
    throw new ApiError("Invalid invite token, please try again", 400);
  }

  const inviteData = invite[0];

  if (inviteData.is_used) {
    throw new ApiError(
      "This invite has already been used, please request a new invite",
      400,
    );
  }

  const now = new Date();
  if (new Date(inviteData.expires_at) < now) {
    throw new ApiError(
      "This invite has expired, please request a new invite",
      400,
    );
  }

  return inviteData;
};
