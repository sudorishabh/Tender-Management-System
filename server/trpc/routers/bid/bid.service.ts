import { db } from "@/server/db";
import {
  bidsTable,
  tenderTable,
  vendorProfileTable,
  businessTable,
  bidVendorDocsTable,
} from "@/server/db/schema";
import {
  ApiError,
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from "@/lib/server/errors";
import { eq, and, desc, ne, or, sql } from "drizzle-orm";
import { getDownloadUrl } from "@/lib/server/s3";
import { sendMail } from "@/lib/server/email";
import { bidSubmissionNotificationEmail } from "@/lib/server/templates/bid.templates";
import {
  getTenderTimelineStatus,
  canSubmitBid,
  getCurrentTimeFormatted,
} from "@/lib/server/tenderStateHelpers";
import {
  notifyUsers,
  type NewNotification,
} from "../notification/notification.service";

// Type for vendor document upload
interface VendorDocUpload {
  vdr_id: number;
  vdr_name: string;
  doc_s3_key: string;
}

// MUTATION
////////////////////////////////////////////////////////////////////

// Create a new bid
export async function createBid(
  userId: string,
  data: {
    optionalInfo?: string;
    tenderId: string;
    bid_fee_doc_key: string;
    technical_doc_key?: string;
    financial_doc_key?: string;
    vendorDocuments?: VendorDocUpload[];
  }
) {
  const user_id = Number(userId);
  const tenderId = Number(data.tenderId);

  // Get vendor profile ID from user ID
  const vendorProfile = await db
    .select()
    .from(vendorProfileTable)
    .where(eq(vendorProfileTable.user_id, user_id))
    .limit(1);

  if (vendorProfile.length === 0) {
    throw new ApiError(
      "Vendor profile not found",
      404,
      "VENDOR_PROFILE_NOT_FOUND"
    );
  }

  const vendorId = vendorProfile[0].vendor_id;

  if (vendorProfile[0].vendor_status !== "approved") {
    throw new ApiError("Vendor is not approved", 400, "VENDOR_NOT_APPROVED");
  }

  // Check if bid already exists
  const existingBid = await db
    .select()
    .from(bidsTable)
    .where(
      and(eq(bidsTable.tender_id, tenderId), eq(bidsTable.vendor_id, vendorId))
    )
    .limit(1);

  if (existingBid.length > 0) {
    throw new ApiError(
      "You have already submitted a bid for this tender",
      400,
      "BID_ALREADY_EXISTS"
    );
  }

  // Get tender
  const tender = await db
    .select()
    .from(tenderTable)
    .where(eq(tenderTable.tender_id, tenderId))
    .limit(1);

  if (tender.length === 0) {
    throw new ApiError("Tender not found", 404, "TENDER_NOT_FOUND");
  }

  // Check if tender is active (approved)
  if (!tender[0].tender_is_active) {
    throw new BadRequestError("This tender is not active", "TENDER_NOT_ACTIVE");
  }

  // Check if bid submission is allowed using centralized helper
  if (!canSubmitBid(tender[0])) {
    throw new BadRequestError(
      "Bid submission deadline has passed. You can no longer submit bids for this tender.",
      "BID_DEADLINE_PASSED"
    );
  }

  // Create bid in transaction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await db.transaction(async (tx: any) => {
    // Insert bid
    const [newBid] = await tx
      .insert(bidsTable)
      .values({
        bid_optional_info: data.optionalInfo || null,
        bid_fee_doc_key: data.bid_fee_doc_key,
        technical_doc_key: data.technical_doc_key || null,
        financial_doc_key: data.financial_doc_key || null,
        tender_id: tenderId,
        vendor_id: vendorId,
        bid_status: "under_review",
      })
      .$returningId();

    // Insert vendor documents if provided
    if (data.vendorDocuments && data.vendorDocuments.length > 0) {
      const vendorDocsToInsert = data.vendorDocuments.map((doc) => ({
        bid_id: newBid.bid_id,
        vdr_id: doc.vdr_id,
        bvd_doc_key: doc.doc_s3_key,
        bvd_doc_name: doc.vdr_name,
      }));

      await tx.insert(bidVendorDocsTable).values(vendorDocsToInsert);
    }

    return { bidId: newBid.bid_id };
  });

  // Send email notification to admin (don't block on failure)
  try {
    const adminEmail = process.env.EMAIL_FROM || process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const { subject, text, html } = bidSubmissionNotificationEmail({
        tenderTitle: tender[0].tender_title || "Untitled Tender",
        tenderNumber: tender[0].tender_number || "N/A",
        tenderId: tender[0].tender_id,
      });

      await sendMail({
        to: adminEmail,
        subject,
        text,
        html,
      });
    }
  } catch (emailError) {
    // Log error but don't fail the bid creation
    console.error("Failed to send bid notification email:", emailError);
  }

  return result;
}

// In-app notices for an approval: the winning vendor plus every vendor whose
// bid on the tender is about to be rejected. Must run before the update so
// already-rejected bids are skipped. Errors are only logged so the approval
// itself is never affected.
async function bidDecisionNotifications(
  tenderId: number,
  approvedBidId: number
): Promise<NewNotification[]> {
  try {
    const recipients = await db
      .select({
        bid_id: bidsTable.bid_id,
        user_id: vendorProfileTable.user_id,
        tender_title: tenderTable.tender_title,
      })
      .from(bidsTable)
      .innerJoin(
        vendorProfileTable,
        eq(bidsTable.vendor_id, vendorProfileTable.vendor_id)
      )
      .innerJoin(tenderTable, eq(bidsTable.tender_id, tenderTable.tender_id))
      .where(
        and(
          eq(bidsTable.tender_id, tenderId),
          or(
            eq(bidsTable.bid_id, approvedBidId),
            ne(bidsTable.bid_status, "rejected")
          )
        )
      );

    return recipients.map(({ bid_id, user_id, tender_title }) => {
      const tenderName = tender_title ? `"${tender_title}"` : "this tender";

      return bid_id === approvedBidId
        ? {
            user_id,
            notif_type: "bid_status",
            notif_title: "Bid approved",
            notif_message: `Your bid for ${tenderName} has been approved.`,
            notif_link: "/vendor/awarded",
          }
        : {
            user_id,
            notif_type: "bid_status",
            notif_title: "Bid not selected",
            notif_message: `Another bid has been approved for ${tenderName}.`,
            notif_link: "/vendor/purchased",
          };
    });
  } catch (error) {
    console.error("Failed to prepare bid decision notifications:", error);
    return [];
  }
}

// Approve a bid and reject all other bids for the same tender
export async function approveBid(bidId: string) {
  const bid_id = Number(bidId);

  // Get the bid to find tender_id
  const [bid] = await db
    .select({
      bid_id: bidsTable.bid_id,
      tender_id: bidsTable.tender_id,
      bid_status: bidsTable.bid_status,
    })
    .from(bidsTable)
    .where(eq(bidsTable.bid_id, bid_id))
    .limit(1);

  if (!bid) {
    throw new ApiError("Bid not found", 404, "BID_NOT_FOUND");
  }

  if (bid.bid_status === "approved") {
    throw new ApiError("Bid is already approved", 400, "BID_ALREADY_APPROVED");
  }

  const notifications = await bidDecisionNotifications(bid.tender_id, bid_id);

  // Use transaction to ensure atomicity
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.transaction(async (tx: any) => {
    // Approve the selected bid
    await tx
      .update(bidsTable)
      .set({ bid_status: "approved" })
      .where(eq(bidsTable.bid_id, bid_id));

    // Reject all other bids for the same tender
    await tx
      .update(bidsTable)
      .set({
        bid_status: "rejected",
        bid_rejection_msg: "Another bid has been approved for this tender",
      })
      .where(
        and(
          eq(bidsTable.tender_id, bid.tender_id),
          sql`${bidsTable.bid_id} != ${bid_id}`
        )
      );
  });

  await notifyUsers(notifications);

  return { success: true, bidId: bid_id, tenderId: bid.tender_id };
}

// QUERY
////////////////////////////////////////////////////////////////////

// Get bids for a tender with score filtering
export async function tenderBids(tenderId: string) {
  const tender_id = Number(tenderId);
  const now = new Date();

  // First, check if the tender's bid submission deadline has passed
  const [tender] = await db
    .select({
      tender_id: tenderTable.tender_id,
      tender_bid_submission_deadline:
        tenderTable.tender_bid_submission_deadline,
      tender_technical_bid_opening: tenderTable.tender_technical_bid_opening,
      tender_financial_bid_opening: tenderTable.tender_financial_bid_opening,
    })
    .from(tenderTable)
    .where(eq(tenderTable.tender_id, tender_id))
    .limit(1);

  if (!tender) {
    throw new ApiError("Tender not found", 404, "TENDER_NOT_FOUND");
  }

  // Use centralized helper to get timeline status
  const timelineStatus = getTenderTimelineStatus(tender);

  // If bid submission deadline has not passed, return count only (bids hidden)
  if (!timelineStatus.isBidSubmissionClosed) {
    // Get bid count even though bids are hidden
    const [bidCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bidsTable)
      .where(eq(bidsTable.tender_id, tender_id));

    const bidCount = bidCountResult?.count || 0;

    return {
      bids: [],
      bidCount, // Include count for admin visibility
      tenderTimeline: {
        isLive: true, // Tender is still live (accepting bids)
        isBidSubmissionClosed: false,
        bidSubmissionDeadline: tender.tender_bid_submission_deadline,
        technicalBidOpening: tender.tender_technical_bid_opening,
        financialBidOpening: tender.tender_financial_bid_opening,
      },
      message: "Bids will be visible after the submission deadline has passed.",
    };
  }

  // Get all bids with their scores
  const bids = await db
    .select({
      bid: bidsTable,
      vendor: {
        vendor_id: vendorProfileTable.vendor_id,
      },
      business: {
        biz_trade_name: businessTable.biz_trade_name,
        biz_legal_name: businessTable.biz_legal_name,
        biz_state: businessTable.biz_state,
        biz_city: businessTable.biz_city,
        biz_country: businessTable.biz_country,
      },
    })
    .from(bidsTable)
    .leftJoin(
      vendorProfileTable,
      eq(bidsTable.vendor_id, vendorProfileTable.vendor_id)
    )
    .leftJoin(
      businessTable,
      eq(vendorProfileTable.vendor_id, businessTable.vendor_id)
    )
    .where(eq(bidsTable.tender_id, tender_id))
    .orderBy(desc(bidsTable.created_at));

  // Use document visibility from timeline status
  const canShowTechnicalDoc = timelineStatus.canShowTechnicalDoc;
  const canShowFinancialDoc = timelineStatus.canShowFinancialDoc;

  // Map bids to hide documents based on timeline
  const visibleBids = bids.map((bidData) => ({
    ...bidData,
    bid: {
      ...bidData.bid,
      // Mask documents based on timeline
      technical_doc_key: canShowTechnicalDoc
        ? bidData.bid.technical_doc_key
        : null,
      financial_doc_key: canShowFinancialDoc
        ? bidData.bid.financial_doc_key
        : null,
    },
  }));

  return {
    bids: visibleBids,
    tenderTimeline: {
      isBidSubmissionClosed: true,
      canShowTechnicalDoc,
      canShowFinancialDoc,
      bidSubmissionDeadline: tender.tender_bid_submission_deadline,
      technicalBidOpening: timelineStatus.technicalOpeningDate,
      financialBidOpening: timelineStatus.financialOpeningDate,
    },
  };
}

// Get bid by ID
export async function bidById(bidId: string) {
  const bid_id = Number(bidId);
  const now = new Date();

  const result = await db
    .select({
      bid: bidsTable,
      tender: tenderTable,
      vendor: vendorProfileTable,
      business: businessTable,
    })
    .from(bidsTable)
    .leftJoin(tenderTable, eq(bidsTable.tender_id, tenderTable.tender_id))
    .leftJoin(
      vendorProfileTable,
      eq(bidsTable.vendor_id, vendorProfileTable.vendor_id)
    )
    .leftJoin(
      businessTable,
      eq(vendorProfileTable.vendor_id, businessTable.vendor_id)
    )
    .where(eq(bidsTable.bid_id, bid_id))
    .limit(1);

  if (result.length === 0) {
    throw new ApiError("Bid not found", 404, "BID_NOT_FOUND");
  }

  const bidData = result[0];
  const tender = bidData.tender;
  const bid = bidData.bid;

  // Use centralized helper to get timeline status
  const timelineStatus = tender ? getTenderTimelineStatus(tender) : null;

  // Determine document visibility based on timeline
  const isBidSubmissionClosed = timelineStatus?.isBidSubmissionClosed ?? false;
  const canShowTechnicalDoc = timelineStatus?.canShowTechnicalDoc ?? false;
  const canShowFinancialDoc = timelineStatus?.canShowFinancialDoc ?? false;

  // Create modified bid object with timeline-based visibility
  const visibleBid = {
    ...bid,
    // Mask documents based on timeline
    technical_doc_key:
      isBidSubmissionClosed && canShowTechnicalDoc
        ? bid.technical_doc_key
        : null,
    financial_doc_key:
      isBidSubmissionClosed && canShowFinancialDoc
        ? bid.financial_doc_key
        : null,
  };

  // Get vendor documents for this bid
  const vendorDocs = await db
    .select()
    .from(bidVendorDocsTable)
    .where(eq(bidVendorDocsTable.bid_id, bid_id));

  // Get S3 URLs for vendor documents
  const vendorDocsWithUrls = await Promise.all(
    vendorDocs.map(async (doc) => {
      const s3_url = doc.bvd_doc_key
        ? await getDownloadUrl(doc.bvd_doc_key)
        : null;
      return { ...doc, s3_url };
    })
  );

  // Include document visibility flags for frontend display
  return {
    ...bidData,
    bid: visibleBid,
    vendorDocuments: vendorDocsWithUrls,
    // Document visibility metadata for frontend
    documentVisibility: {
      isBidSubmissionClosed,
      canShowTechnicalDoc,
      canShowFinancialDoc,
      technicalBidOpeningDate: timelineStatus?.technicalOpeningDate,
      financialBidOpeningDate: timelineStatus?.financialOpeningDate,
    },
  };
}

// Get all bids (admin)
export async function allBids(page: number = 1, limit: number = 10) {
  try {
    const offset = (page - 1) * limit;

    const now = new Date();
    const nowFormatted = getCurrentTimeFormatted(now);

    const closedTenderCondition = sql`${tenderTable.tender_bid_submission_deadline} IS NOT NULL AND ${tenderTable.tender_bid_submission_deadline} < ${nowFormatted}`;

    const [bids, countResult] = await Promise.all([
      db
        .select({
          bid_id: bidsTable.bid_id,
          tender_id: bidsTable.tender_id,
          vendor_id: bidsTable.vendor_id,
          created_at: bidsTable.created_at,
          bid_status: bidsTable.bid_status,
          bid_rejection_msg: bidsTable.bid_rejection_msg,
          biz_legal_name: businessTable.biz_legal_name,
          biz_classification: businessTable.biz_classification,
          tender_title: tenderTable.tender_title,
          tender_number: tenderTable.tender_number,
        })
        .from(bidsTable)
        .leftJoin(tenderTable, eq(bidsTable.tender_id, tenderTable.tender_id))
        .leftJoin(
          vendorProfileTable,
          eq(bidsTable.vendor_id, vendorProfileTable.vendor_id)
        )
        .leftJoin(
          businessTable,
          eq(vendorProfileTable.vendor_id, businessTable.vendor_id)
        )
        .where(closedTenderCondition)
        .orderBy(desc(bidsTable.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(bidsTable)
        .leftJoin(tenderTable, eq(bidsTable.tender_id, tenderTable.tender_id))
        .where(closedTenderCondition)
        .then((res) => res[0].count),
    ]);

    return {
      data: bids,
      pagination: {
        total: countResult,
        page,
        limit,
        totalPages: Math.ceil(countResult / limit),
      },
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new InternalServerError("Failed to fetch bids", "FETCH_BIDS_ERROR");
  }
}

// Get vendor's purchased bids (not approved)
export async function vendorPurchasedBids(vendorId: string) {
  try {
    const userId = Number(vendorId);

    const realVendorId = await db
      .select({ vendor_id: vendorProfileTable.vendor_id })
      .from(vendorProfileTable)
      .where(eq(vendorProfileTable.user_id, userId));

    if (!realVendorId || realVendorId.length === 0) {
      throw new NotFoundError(
        "Vendor profile not found",
        "VENDOR_PROFILE_NOT_FOUND"
      );
    }

    const bids = await db
      .select({
        bid: bidsTable,
        tender: tenderTable,
      })
      .from(bidsTable)
      .leftJoin(tenderTable, eq(bidsTable.tender_id, tenderTable.tender_id))
      .where(eq(bidsTable.vendor_id, realVendorId[0].vendor_id))
      .orderBy(desc(bidsTable.created_at));

    return bids;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new InternalServerError(
      "Failed to fetch vendor purchased bids",
      "FETCH_VENDOR_BIDS_ERROR"
    );
  }
}

// Get vendor's approved bids — accepts userId from session, resolves vendorId internally
export async function vendorApprovedBids(
  userId: string,
  page: number = 1,
  limit: number = 10
) {
  try {
    const offset = (page - 1) * limit;
    const user_id = Number(userId);

    if (isNaN(user_id)) {
      throw new BadRequestError("Invalid user ID", "INVALID_USER_ID");
    }

    // Resolve vendorId from userId so callers never pass an arbitrary vendorId
    const [vendorProfile] = await db
      .select({ vendor_id: vendorProfileTable.vendor_id })
      .from(vendorProfileTable)
      .where(eq(vendorProfileTable.user_id, user_id))
      .limit(1);

    if (!vendorProfile) {
      throw new NotFoundError("Vendor profile not found", "VENDOR_PROFILE_NOT_FOUND");
    }

    const vendor_id = vendorProfile.vendor_id;

    const [bids, countResult] = await Promise.all([
      db
        .select({
          bid: bidsTable,
          tender: tenderTable,
        })
        .from(bidsTable)
        .leftJoin(tenderTable, eq(bidsTable.tender_id, tenderTable.tender_id))
        .where(
          and(
            eq(bidsTable.vendor_id, vendor_id),
            eq(bidsTable.bid_status, "approved")
          )
        )
        .orderBy(desc(bidsTable.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(bidsTable)
        .where(
          and(
            eq(bidsTable.vendor_id, vendor_id),
            eq(bidsTable.bid_status, "approved")
          )
        )
        .then((res) => res[0].count),
    ]);

    return {
      data: bids,
      pagination: {
        total: countResult,
        page,
        limit,
        totalPages: Math.ceil(countResult / limit),
      },
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new InternalServerError(
      "Failed to fetch vendor approved bids",
      "FETCH_APPROVED_BIDS_ERROR"
    );
  }
}

// Get all approved bids (admin)
export async function approvedBids(page: number = 1, limit: number = 10) {
  try {
    const offset = (page - 1) * limit;

    const [bids, countResult] = await Promise.all([
      db
        .select({
          bid_id: bidsTable.bid_id,
          tender_id: bidsTable.tender_id,
          created_at: bidsTable.created_at,
          bid_status: bidsTable.bid_status,
          bid_rejection_msg: bidsTable.bid_rejection_msg,
          bid_total_score: sql<number>`0`,
          biz_legal_name: businessTable.biz_legal_name,
          biz_classification: businessTable.biz_classification,
          tender_title: tenderTable.tender_title,
          tender_number: tenderTable.tender_number,
        })
        .from(bidsTable)
        .leftJoin(tenderTable, eq(bidsTable.tender_id, tenderTable.tender_id))
        .leftJoin(
          vendorProfileTable,
          eq(bidsTable.vendor_id, vendorProfileTable.vendor_id)
        )
        .leftJoin(
          businessTable,
          eq(vendorProfileTable.vendor_id, businessTable.vendor_id)
        )
        .where(eq(bidsTable.bid_status, "approved"))
        .orderBy(desc(bidsTable.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(bidsTable)
        .where(eq(bidsTable.bid_status, "approved"))
        .then((res) => res[0].count),
    ]);

    return {
      bids,
      totalApprovedBids: countResult,
      hasMore: offset + bids.length < countResult,
      pagination: {
        total: countResult,
        page,
        limit,
        totalPages: Math.ceil(countResult / limit),
      },
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new InternalServerError(
      "Failed to fetch approved bids",
      "FETCH_APPROVED_BIDS_ERROR"
    );
  }
}

// Check if vendor has submitted bid for tender
export async function isBidSubmitted(tenderId: string, userId: string) {
  try {
    const tender_id = Number(tenderId);
    const user_id = Number(userId);

    if (isNaN(tender_id) || isNaN(user_id)) {
      throw new BadRequestError("Invalid tender or user ID", "INVALID_ID");
    }

    const [vendorId] = await db
      .select({ id: vendorProfileTable.vendor_id })
      .from(vendorProfileTable)
      .where(eq(vendorProfileTable.user_id, user_id));

    if (!vendorId) {
      // If no vendor profile, they haven't submitted a bid
      return {
        isSubmitted: false,
        bid: null,
      };
    }

    const result = await db
      .select()
      .from(bidsTable)
      .where(
        and(
          eq(bidsTable.tender_id, tender_id),
          eq(bidsTable.vendor_id, vendorId.id)
        )
      )
      .limit(1);

    return {
      isSubmitted: result.length > 0,
      bid: result[0] || null,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new InternalServerError(
      "Failed to check bid submission status",
      "CHECK_BID_ERROR"
    );
  }
}
