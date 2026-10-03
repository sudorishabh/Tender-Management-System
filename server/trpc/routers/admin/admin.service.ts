import { count, desc, eq, inArray, sum, and, sql } from "drizzle-orm";
import { db } from "@/server/db";
import {
  adminInvitesTable,
  bidsTable,
  businessTable,
  tenderTable,
  usersTable,
  vendorProfileTable,
} from "@/server/db/schema";
import {
  ApiError,
  NotFoundError,
  InternalServerError,
} from "@/lib/server/errors";
import { ROLES, TENDER_STATUS } from "@/lib/server/constants";
import { getCurrentTimeFormatted } from "@/lib/server/tenderStateHelpers";

// MUTATION
//////////////////////////////////////////////////////////////////

export const deleteAdmin = async (adminId: number) => {
  try {
    // Get admin
    const admin = await db
      .select({
        user_id: usersTable.user_id,
        email: usersTable.email,
        role: usersTable.role,
      })
      .from(usersTable)
      .where(and(eq(usersTable.user_id, adminId), eq(usersTable.role, "admin")))
      .limit(1);

    if (admin.length === 0) {
      throw new NotFoundError(
        "Admin not found, please try again",
        "ADMIN_NOT_FOUND"
      );
    }

    // Delete admin and related data in transaction
    await db.transaction(async (tx) => {
      await tx.delete(usersTable).where(eq(usersTable.user_id, adminId));
      await tx
        .delete(adminInvitesTable)
        .where(eq(adminInvitesTable.invite_email, admin[0].email));
    });

    return { success: true, message: "Admin deleted successfully" };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new InternalServerError(
      "Failed to delete admin",
      "DELETE_ADMIN_ERROR"
    );
  }
};

// QUERY
//////////////////////////////////////////////////////////////////

export const getAllAdmins = async () => {
  try {
    const admins = await db
      .select({
        user_id: usersTable.user_id,
        email: usersTable.email,
        full_name: usersTable.full_name,
        created_at: usersTable.created_at,
        updated_at: usersTable.updated_at,
      })
      .from(usersTable)
      .where(eq(usersTable.role, ROLES.ADMIN))
      .orderBy(usersTable.created_at);

    return admins;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new InternalServerError(
      "Failed to fetch admins",
      "FETCH_ADMINS_ERROR"
    );
  }
};

// Admin Dashboard Service
export const adminDashboard = async () => {
  try {
    const now = new Date();
    const nowFormatted = getCurrentTimeFormatted(now);
    const closedTenderCondition = sql`${tenderTable.tender_bid_submission_deadline} IS NOT NULL AND ${tenderTable.tender_bid_submission_deadline} < ${nowFormatted}`;
    const openTenderCondition = sql`${tenderTable.tender_bid_submission_deadline} IS NOT NULL AND ${tenderTable.tender_bid_submission_deadline} > ${nowFormatted}`;
    // Same base filter as the tabs of the admin live tenders page
    const releasedTenderCondition = and(
      eq(tenderTable.tender_is_active, true),
      eq(tenderTable.tender_status, TENDER_STATUS.PUBLISHED),
      sql`${tenderTable.tender_release_date} IS NOT NULL AND ${tenderTable.tender_release_date} <= ${nowFormatted}`,
    );

    const [
      totalTender,
      totalBids,
      totalVendors,
      totalDraftTender,
      tendersAcceptingBids,
      tendersReadyForReview,
      bidStatusCounts,
      vendorStatusCounts,
      recentTender,
      recentBids,
    ] = await Promise.all([
      db.$count(tenderTable),
      db
        .select({ count: count() })
        .from(bidsTable)
        .leftJoin(tenderTable, eq(bidsTable.tender_id, tenderTable.tender_id))
        .where(closedTenderCondition)
        .then((res) => res[0].count),
      db.$count(vendorProfileTable),
      db.$count(tenderTable, eq(tenderTable.tender_status, TENDER_STATUS.DRAFT)),
      db.$count(tenderTable, and(releasedTenderCondition, openTenderCondition)),
      db.$count(
        tenderTable,
        and(releasedTenderCondition, closedTenderCondition),
      ),
      db
        .select({
          status: bidsTable.bid_status,
          count: count(),
        })
        .from(bidsTable)
        .where(eq(bidsTable.bid_status, "approved"))
        .groupBy(bidsTable.bid_status),
      db
        .select({
          status: vendorProfileTable.vendor_status,
          count: count(),
        })
        .from(vendorProfileTable)
        .where(inArray(vendorProfileTable.vendor_status, ["approved", "pending"]))
        .groupBy(vendorProfileTable.vendor_status),
      db
        .select({
          tender_id: tenderTable.tender_id,
          tender_title: tenderTable.tender_title,
          tender_number: tenderTable.tender_number,
          created_at: tenderTable.created_at,
          tender_status: tenderTable.tender_status,
        })
        .from(tenderTable)
        .limit(4)
        .orderBy(desc(tenderTable.created_at)),
      db
        .select({
          bid_id: bidsTable.bid_id,
          tender_id: bidsTable.tender_id,
          biz_name: businessTable.biz_legal_name,
          tender_title: tenderTable.tender_title,
          created_at: bidsTable.created_at,
          bid_status: bidsTable.bid_status,
        })
        .from(bidsTable)
        .leftJoin(tenderTable, eq(bidsTable.tender_id, tenderTable.tender_id))
        .leftJoin(
          businessTable,
          eq(bidsTable.vendor_id, businessTable.vendor_id)
        )
        .where(closedTenderCondition)
        .limit(4)
        .orderBy(desc(bidsTable.created_at)),
    ]);

    // Extract counts from grouped results
    const totalApprovedBids =
      bidStatusCounts.find((b) => b.status === "approved")?.count || 0;
    const totalApprovedVendors =
      vendorStatusCounts.find((v) => v.status === "approved")?.count || 0;
    const totalPendingVendors =
      vendorStatusCounts.find((v) => v.status === "pending")?.count || 0;

    // Get bid counts for recent tenders
    const recentTenderIds = recentTender.map((t) => t.tender_id);

    const bidsCountResults = await db
      .select({
        tenderId: bidsTable.tender_id,
        count: count(),
      })
      .from(bidsTable)
      .where(inArray(bidsTable.tender_id, recentTenderIds))
      .groupBy(bidsTable.tender_id);

    const totalBidsOnTenders = recentTenderIds.map((id) => {
      const found = bidsCountResults.find((r) => r.tenderId === id);
      return found ? found.count : 0;
    });

    return {
      totalTender,
      totalBids,
      totalVendors,
      totalDraftTender,
      tendersAcceptingBids,
      tendersReadyForReview,
      totalApprovedBids,
      totalApprovedVendors,
      totalPendingVendors,
      recentTender,
      recentBids,
      totalBidsOnTenders,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new InternalServerError(
      "Failed to fetch dashboard data",
      "FETCH_DASHBOARD_ERROR"
    );
  }
};
