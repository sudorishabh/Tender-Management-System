import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import {
  tenderTable,
  vendorDocRequirementTable,
  tenderEmailInvitesTable,
} from "@/server/db/schema";
import { ApiError } from "@/lib/server/errors";
import { TENDER_STATUS } from "@/lib/server/constants";
import { CreateTenderType, UpdateLiveTenderType } from "./tender.schema";
import { sendMail } from "@/lib/server/email";
import { tenderInvitationEmail } from "@/lib/server/templates/tender.templates";

// The key dates every tender needs before it can go live
const TENDER_DATE_FIELDS = [
  "tender_release_date",
  "tender_query_deadline",
  "tender_query_response_date",
  "tender_bid_submission_deadline",
  "tender_technical_bid_opening",
  "tender_financial_bid_opening",
] as const;

// Helper: Insert bidder documents
export const insertBidderDocuments = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
  tenderId: number,
  vendorDocRequirement: { vdr_name: string }[],
) => {
  if (vendorDocRequirement.length > 0) {
    await Promise.all(
      vendorDocRequirement.map((doc) =>
        tx.insert(vendorDocRequirementTable).values({
          tender_id: tenderId,
          vdr_name: doc.vdr_name,
        }),
      ),
    );
  }
};

// Helper: Get isSelectAll
export const getIsSelectAll = ({
  selected_vendors,
}: {
  selected_vendors: number[];
}) => {
  if (selected_vendors.length > 0) {
    return false;
  } else {
    return true;
  }
};

interface GetTenderInfoObjParams {
  step1: CreateTenderType["step1"];
  step3: CreateTenderType["step3"];
  createdBy?: number;
  isFromSaveAsDraft: boolean;
}

// Helper: Get tender info object
// IMPORTANT: step3 dates are passed as strings (YYYY-MM-DD HH:mm:ss) directly to MySQL
// We use sql`` template to pass raw values, avoiding Drizzle's Date object conversion
export const getTenderInfoObj = ({
  step1,
  step3,
  createdBy,
  isFromSaveAsDraft,
}: GetTenderInfoObjParams) => {
  // Helper to wrap datetime string in sql template or return null
  const toSqlDatetime = (value: string | null | undefined) => {
    if (!value) return null;
    return sql`${value}`;
  };

  const obj: any = {
    tender_status: isFromSaveAsDraft
      ? TENDER_STATUS.DRAFT
      : TENDER_STATUS.REVIEW,
    tender_created_by_id: createdBy,
    ...step1,
    tender_remark: null,
    // Use sql template to pass datetime strings directly to MySQL
    tender_release_date: toSqlDatetime(step3.tender_release_date),
    tender_query_deadline: toSqlDatetime(step3.tender_query_deadline),
    tender_query_response_date: toSqlDatetime(step3.tender_query_response_date),
    tender_bid_submission_deadline: toSqlDatetime(
      step3.tender_bid_submission_deadline,
    ),
    tender_technical_bid_opening: toSqlDatetime(
      step3.tender_technical_bid_opening,
    ),
    tender_financial_bid_opening: toSqlDatetime(
      step3.tender_financial_bid_opening,
    ),
  };

  return obj;
};

// Helper: Insert email invitations
export const insertEmailInvitations = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
  tenderId: number,
  invitedEmails: string[],
) => {
  if (invitedEmails && invitedEmails.length > 0) {
    await Promise.all(
      invitedEmails.map((email) =>
        tx.insert(tenderEmailInvitesTable).values({
          tender_id: tenderId,
          email: email,
        }),
      ),
    );
  }
};

// Helper: Clean up existing email invitations
export const cleanupEmailInvitations = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
  tenderId: number,
) => {
  await tx
    .delete(tenderEmailInvitesTable)
    .where(eq(tenderEmailInvitesTable.tender_id, tenderId));
};

// Send tender invitation emails
export const sendTenderInvitationEmails = async (tenderId: number) => {
  try {
    // Fetch tender details
    const [tender] = await db
      .select({
        tender_id: tenderTable.tender_id,
        tender_number: tenderTable.tender_number,
        tender_title: tenderTable.tender_title,
        tender_description: tenderTable.tender_description,
        tender_release_date: tenderTable.tender_release_date,
        tender_bid_submission_deadline:
          tenderTable.tender_bid_submission_deadline,
      })
      .from(tenderTable)
      .where(eq(tenderTable.tender_id, tenderId))
      .limit(1);

    if (!tender) {
      throw new ApiError("Tender not found", 404, "TENDER_NOT_FOUND");
    }

    // Fetch email invites that haven't been sent yet
    const emailInvites = await db
      .select()
      .from(tenderEmailInvitesTable)
      .where(eq(tenderEmailInvitesTable.tender_id, tenderId));

    if (emailInvites.length === 0) {
      return { success: true, emailsSent: 0 };
    }

    // Send emails to each recipient
    const emailPromises = emailInvites.map(async (invite) => {
      const emailContent = tenderInvitationEmail({
        tenderNumber: tender.tender_number ?? "",
        tenderTitle: tender.tender_title ?? "",
        tenderDescription: tender.tender_description ?? "",
        tenderId: tender.tender_id,
        tenderReleaseDate: tender.tender_release_date,
        tenderBidSubmissionDeadline: tender.tender_bid_submission_deadline,
      });

      try {
        await sendMail({
          to: invite.email,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
        });

        // Update sent_at timestamp
        await db
          .update(tenderEmailInvitesTable)
          .set({ sent_at: new Date() })
          .where(eq(tenderEmailInvitesTable.invite_id, invite.invite_id));

        return { success: true, email: invite.email };
      } catch (error) {
        return { success: false, email: invite.email, error };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return {
      success: true,
      emailsSent: successCount,
      emailsFailed: failCount,
      results,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Failed to send tender invitation emails",
      500,
      "FAILED_TO_SEND_EMAILS",
    );
  }
};

// Update Tender Status Service
export const updateTenderStatusService = async (data: {
  tender_id: number;
  tender_status: TENDER_STATUS;
  tender_remark?: string;
}) => {
  const { tender_id, tender_status, tender_remark } = data;

  if (
    tender_status !== TENDER_STATUS.PUBLISHED &&
    tender_status !== TENDER_STATUS.RESCHEDULED
  ) {
    throw new ApiError("Invalid tender status", 400, "INVALID_TENDER_STATUS");
  }

  const [tender] = await db
    .select({
      tender_status: tenderTable.tender_status,
      tender_release_date: tenderTable.tender_release_date,
      tender_query_deadline: tenderTable.tender_query_deadline,
      tender_query_response_date: tenderTable.tender_query_response_date,
      tender_bid_submission_deadline: tenderTable.tender_bid_submission_deadline,
      tender_technical_bid_opening: tenderTable.tender_technical_bid_opening,
      tender_financial_bid_opening: tenderTable.tender_financial_bid_opening,
    })
    .from(tenderTable)
    .where(eq(tenderTable.tender_id, tender_id))
    .limit(1);

  if (!tender) {
    throw new ApiError("Tender not found", 404, "TENDER_NOT_FOUND");
  }

  // Only the review step decides a tender's fate; live, draft or already
  // rescheduled tenders can't be pushed around from here
  if (tender.tender_status !== TENDER_STATUS.REVIEW) {
    throw new ApiError(
      "Only tenders in review can be published or rescheduled",
      409,
      "TENDER_NOT_IN_REVIEW",
    );
  }

  // A tender without a deadline would stay open, and its bids sealed, forever
  if (
    tender_status === TENDER_STATUS.PUBLISHED &&
    TENDER_DATE_FIELDS.some((field) => !tender[field])
  ) {
    throw new ApiError(
      "All tender dates must be set before publishing",
      400,
      "TENDER_DATES_MISSING",
    );
  }

  try {
    if (tender_status === TENDER_STATUS.PUBLISHED) {
      await db.transaction(async (tx) => {
        // REMOVED: Auto-generation of tender number as it is now manually entered by the user
        // const [result] = await tx
        //   .select({
        //     tender_number: tenderTable.tender_number,
        //   })
        //   .from(tenderTable)
        //   .where(eq(tenderTable.tender_status, TENDER_STATUS.PUBLISHED))
        //   .orderBy(desc(tenderTable.tender_id))
        //   .limit(1);

        // let nextId: number;
        // if (!result || !result.tender_number) {
        //   nextId = 1;
        // } else {
        //   nextId = Number(result.tender_number.split("/")[3]) + 1;
        // }

        // const currentYear = `${new Date().getFullYear() - 1}-${new Date()
        //   .getFullYear()
        //   .toString()
        //   .slice(-2)}`;
        // const newTenderNumber = `TERI/MAT/${currentYear}/${String(nextId)}`;

        await tx
          .update(tenderTable)
          .set({
            tender_status,
            // tender_number: newTenderNumber, // Logic moved to creation/input
            tender_is_active: true,
            tender_remark: null,
          })
          .where(eq(tenderTable.tender_id, tender_id));
      });

      try {
        await sendTenderInvitationEmails(tender_id);
      } catch (emailError) {}
    } else {
      await db
        .update(tenderTable)
        .set({
          tender_status,
          tender_remark,
          tender_is_active: false,
        })
        .where(eq(tenderTable.tender_id, tender_id));
    }
  } catch (error) {
    throw new ApiError(
      `Failed to update tender status: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      400,
      "FAILED_TO_UPDATE_TENDER_STATUS",
    );
  }

  return { success: true };
};

// Fetch a published tender with all fields needed for the edit form
export const getLiveTenderForEdit = async (tenderId: number) => {
  const [tender] = await db
    .select()
    .from(tenderTable)
    .where(eq(tenderTable.tender_id, tenderId))
    .limit(1);

  if (!tender) {
    throw new ApiError("Tender not found", 404, "TENDER_NOT_FOUND");
  }

  if (tender.tender_status !== TENDER_STATUS.PUBLISHED) {
    throw new ApiError(
      "Only published tenders can be edited from this endpoint",
      400,
      "INVALID_TENDER_STATUS",
    );
  }

  const docRequirements = await db
    .select()
    .from(vendorDocRequirementTable)
    .where(eq(vendorDocRequirementTable.tender_id, tenderId));

  const emailInvites = await db
    .select()
    .from(tenderEmailInvitesTable)
    .where(eq(tenderEmailInvitesTable.tender_id, tenderId));

  return { tender, docRequirements, emailInvites };
};

// Update a published (live) tender in place
export const updateLiveTenderService = async (
  data: UpdateLiveTenderType,
) => {
  const { tender_id, step1, step3 } = data;

  const [existing] = await db
    .select({ tender_status: tenderTable.tender_status })
    .from(tenderTable)
    .where(eq(tenderTable.tender_id, tender_id))
    .limit(1);

  if (!existing) {
    throw new ApiError("Tender not found", 404, "TENDER_NOT_FOUND");
  }

  if (existing.tender_status !== TENDER_STATUS.PUBLISHED) {
    throw new ApiError(
      "Only published tenders can be edited from this endpoint",
      400,
      "INVALID_TENDER_STATUS",
    );
  }

  const toSqlDatetime = (value: string | null | undefined) => {
    if (!value) return null;
    return sql`${value}`;
  };

  // Live edits are restricted to a fixed subset of fields; vendor docs, invites,
  // and all other tender columns are left unchanged (see product rules).

  await db.transaction(async (tx) => {
    await tx
      .update(tenderTable)
      .set({
        tender_description: step1.tender_description,
        tender_contract_document: step1.tender_contract_document || null,
        tender_project_duration: step1.tender_project_duration || null,
        tender_query_deadline: toSqlDatetime(step3.tender_query_deadline) as unknown as Date,
        tender_query_response_date: toSqlDatetime(
          step3.tender_query_response_date,
        ) as unknown as Date,
        tender_bid_submission_deadline: toSqlDatetime(
          step3.tender_bid_submission_deadline,
        ) as unknown as Date,
        tender_technical_bid_opening: toSqlDatetime(
          step3.tender_technical_bid_opening,
        ) as unknown as Date,
        tender_financial_bid_opening: toSqlDatetime(
          step3.tender_financial_bid_opening,
        ) as unknown as Date,
      })
      .where(eq(tenderTable.tender_id, tender_id));
  });

  return { success: true };
};
