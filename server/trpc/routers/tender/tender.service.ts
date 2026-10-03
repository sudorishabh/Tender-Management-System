import { db } from "@/server/db";
import {
  ApiError,
  ValidationError,
  ConflictError,
  NotFoundError,
  InternalServerError,
} from "@/lib/server/errors";
import { TENDER_STATUS } from "@/lib/server/constants";
import { CreateTenderType } from "./tender.schema";
import {
  getTenderInfoObj,
  insertBidderDocuments,
  insertEmailInvitations,
  cleanupEmailInvitations,
} from "./tender.service.helper";

import { and, asc, count, desc, eq, like, max, or, sql, SQL } from "drizzle-orm";
import {
  tenderTable,
  usersTable,
  vendorProfileTable,
  vendorDocRequirementTable,
  tenderEmailInvitesTable,
  departmentTable,
} from "@/server/db/schema";
import {
  HomeLatestTendersType,
  AdminLiveTendersType,
  SavedTendersType,
  TenderSearchResultsType,
  DeleteSavedTenderType,
  UpdateTenderStatusType,
} from "./tender.schema";
import {
  isTenderLive,
  getCurrentTimeFormatted,
  getTenderTimelineStatus,
} from "@/lib/server/tenderStateHelpers";

// MUTATION SERVICES
///////////////////////////////////////////////////////////////

// Create Tender Service
export const createTender = async (data: CreateTenderType, userId: number) => {
  try {
    const { step1, step2, step3 } = data;

    // VALIDATION: Check required fields before processing
    const missingFields: string[] = [];

    if (!step1.tender_title?.trim()) missingFields.push("Tender Title");
    if (!step1.tender_number?.trim()) missingFields.push("Tender Number");
    if (!step1.tender_department?.trim()) missingFields.push("Department");
    if (!step1.tender_type) missingFields.push("Tender Type");
    if (!step1.tender_scope) missingFields.push("Tender Scope");
    if (!step1.tender_description?.trim()) missingFields.push("Description");
    if (!step1.tender_location?.trim()) missingFields.push("Location");

    const docFee = Number(step1.tender_doc_fee);
    if (!step1.tender_doc_fee || isNaN(docFee) || docFee <= 0) {
      missingFields.push("Document Fee (must be greater than 0)");
    }

    const emd = Number(step1.tender_emd);
    if (!step1.tender_emd || isNaN(emd) || emd <= 0) {
      missingFields.push("EMD (must be greater than 0)");
    }

    // Check all key dates are set
    if (!step3.tender_release_date) missingFields.push("Release Date");
    if (!step3.tender_query_deadline) missingFields.push("Query Deadline");
    if (!step3.tender_query_response_date)
      missingFields.push("Query Response Date");
    if (!step3.tender_bid_submission_deadline)
      missingFields.push("Bid Submission Deadline");
    if (!step3.tender_technical_bid_opening)
      missingFields.push("Technical Bid Opening");
    if (!step3.tender_financial_bid_opening)
      missingFields.push("Financial Bid Opening");

    if (missingFields.length > 0) {
      throw new ValidationError(
        `Cannot submit tender. Missing required fields: ${missingFields.join(
          ", ",
        )}`,
        "MISSING_REQUIRED_FIELDS",
      );
    }

    const savedTenderId = step1.tender_id ? Number(step1.tender_id) : null;

    // Auto-generate tender_number if not provided

    const vendor_doc_requirement = (step2 || []).map((doc) => ({
      vdr_name: doc.vdr_name ?? "",
    }));
    const invited_emails = step1.invited_emails || [];

    const tenderInfo = getTenderInfoObj({
      step1,
      step3,
      createdBy: userId,
      isFromSaveAsDraft: false,
    });

    return await db.transaction(async (tx) => {
      let tenderTableData;

      try {
        if (savedTenderId) {
          // Update existing saved tender
          const updateResult = await tx
            .update(tenderTable)
            .set(tenderInfo)
            .where(eq(tenderTable.tender_id, savedTenderId));

          if (updateResult[0].affectedRows === 0) {
            throw new NotFoundError(
              "Saved tender not found or already published",
              "TENDER_NOT_FOUND",
            );
          }

          const [updatedTender] = await tx
            .select()
            .from(tenderTable)
            .where(eq(tenderTable.tender_id, savedTenderId))
            .limit(1);

          tenderTableData = updatedTender!;

          // Cleanup existing relations
          await Promise.all([
            tx
              .delete(vendorDocRequirementTable)
              .where(eq(vendorDocRequirementTable.tender_id, savedTenderId)),
            cleanupEmailInvitations(tx, savedTenderId),
          ]);
        } else {
          // Create new tender
          const result = await tx.insert(tenderTable).values(tenderInfo);
          const insertId = result[0].insertId;

          const [newTender] = await tx
            .select()
            .from(tenderTable)
            .where(eq(tenderTable.tender_id, insertId))
            .limit(1);

          tenderTableData = newTender!;
        }

        // Insert related data
        await insertBidderDocuments(
          tx,
          tenderTableData.tender_id,
          vendor_doc_requirement,
        );

        // Handle email invitations for Limited tenders
        if (invited_emails.length > 0) {
          await insertEmailInvitations(
            tx,
            tenderTableData.tender_id,
            invited_emails,
          );
        }

        return { success: true, tenderId: tenderTableData.tender_id };
      } catch (txError) {
        // Transaction-specific errors
        if (txError instanceof ApiError) throw txError;

        throw new InternalServerError(
          `Database transaction failed: ${
            txError instanceof Error ? txError.message : "Unknown error"
          }`,
          "TRANSACTION_FAILED",
        );
      }
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;

    // Handle unexpected errors
    throw new InternalServerError(
      error instanceof Error ? error.message : "Failed to create tender",
      "FAILED_TO_CREATE_TENDER",
    );
  }
};

// Save Tender as Draft Service
export const saveTender = async (data: CreateTenderType, userId: number) => {
  try {
    const { step1, step2, step3 } = data;

    // VALIDATION: Minimal validation for drafts (only title required)
    if (!step1.tender_title?.trim()) {
      throw new ValidationError(
        "Title is required for saving",
        "MISSING_BASIC_FIELDS",
      );
    }

    // // Ensure only draft status can be used for save-as-draft
    // if (step1.tender_status && step1.tender_status !== TENDER_STATUS.DRAFT) {
    //   throw new ValidationError(
    //     "Cannot save tender with status other than DRAFT",
    //     "INVALID_TENDER_STATUS_FOR_SAVE"
    //   );
    // }

    const savedTenderId = step1.tender_id ? Number(step1.tender_id) : null;
    const invited_emails = step1.invited_emails || [];

    // Keep tender_number as NULL for drafts (will be generated on submit)

    const tenderInfo = getTenderInfoObj({
      step1,
      step3,
      createdBy: userId,
      isFromSaveAsDraft: true,
    });

    const vendor_doc_requirement = (step2 || []).map((doc) => ({
      vdr_name: doc.vdr_name ?? "",
    }));

    return await db.transaction(async (tx) => {
      let tenderTableData;

      try {
        if (savedTenderId) {
          // Verify existing tender exists and is a draft before updating
          const [existingTender] = await tx
            .select({ tender_status: tenderTable.tender_status })
            .from(tenderTable)
            .where(eq(tenderTable.tender_id, savedTenderId))
            .limit(1);

          if (!existingTender) {
            throw new NotFoundError(
              "Saved tender not found",
              "TENDER_NOT_FOUND",
            );
          }

          if (existingTender.tender_status !== TENDER_STATUS.DRAFT) {
            throw new ValidationError(
              "Only draft tenders can be saved/updated",
              "CANNOT_SAVE_NON_DRAFT_TENDER",
            );
          }

          // Update existing saved tender
          const updateResult = await tx
            .update(tenderTable)
            .set(tenderInfo)
            .where(eq(tenderTable.tender_id, savedTenderId));

          if (updateResult[0].affectedRows === 0) {
            throw new NotFoundError(
              "Saved tender not found",
              "TENDER_NOT_FOUND",
            );
          }

          const [updatedTender] = await tx
            .select()
            .from(tenderTable)
            .where(eq(tenderTable.tender_id, savedTenderId))
            .limit(1);

          tenderTableData = updatedTender!;

          // Cleanup existing relations
          await Promise.all([
            tx
              .delete(vendorDocRequirementTable)
              .where(eq(vendorDocRequirementTable.tender_id, savedTenderId)),
            cleanupEmailInvitations(tx, savedTenderId),
          ]);
        } else {
          // Create new draft tender
          const result = await tx.insert(tenderTable).values(tenderInfo);
          const insertId = result[0].insertId;

          const [newTender] = await tx
            .select()
            .from(tenderTable)
            .where(eq(tenderTable.tender_id, insertId))
            .limit(1);

          tenderTableData = newTender!;
        }

        // Insert related data
        await insertBidderDocuments(
          tx,
          tenderTableData.tender_id,
          vendor_doc_requirement,
        );

        // Handle email invitations for Limited tenders
        if (invited_emails.length > 0) {
          await insertEmailInvitations(
            tx,
            tenderTableData.tender_id,
            invited_emails,
          );
        }

        return { success: true, tenderId: tenderTableData.tender_id };
      } catch (txError) {
        if (txError instanceof ApiError) throw txError;

        throw new InternalServerError(
          `Database transaction failed: ${
            txError instanceof Error ? txError.message : "Unknown error"
          }`,
          "TRANSACTION_FAILED",
        );
      }
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new InternalServerError(
      error instanceof Error ? error.message : "Failed to save tender",
      "FAILED_TO_SAVE_TENDER",
    );
  }
};

// Delete Saved Tender Service
export const deleteSavedTender = async (data: DeleteSavedTenderType) => {
  const { id } = data;

  // Check if tender exists and is a draft
  const [tender] = await db
    .select()
    .from(tenderTable)
    .where(eq(tenderTable.tender_id, id))
    .limit(1);

  if (!tender) {
    throw new ApiError("Tender not found", 404, "TENDER_NOT_FOUND");
  }

  if (tender.tender_status !== TENDER_STATUS.DRAFT) {
    throw new ApiError(
      "Only draft tenders can be deleted",
      400,
      "CANNOT_DELETE_PUBLISHED_TENDER",
    );
  }

  await db.transaction(async (tx) => {
    // Delete all related data
    await Promise.all([
      tx
        .delete(vendorDocRequirementTable)
        .where(eq(vendorDocRequirementTable.tender_id, id)),
    ]);

    // Delete tender
    await tx.delete(tenderTable).where(eq(tenderTable.tender_id, id));
  });

  return { success: true };
};

// QUERY
////////////////////////////////////////////////////////

// Create search condition helper
export const createSearchCondition = (
  query: string | undefined,
  statusFilter?: string,
) => {
  if (query) {
    const searchTerm = `%${query}%`;
    const searchCondition = or(
      like(tenderTable.tender_title, searchTerm),
      like(tenderTable.tender_department, searchTerm),
      like(tenderTable.tender_type, searchTerm),
      like(tenderTable.tender_scope, searchTerm),
      like(tenderTable.tender_location, searchTerm),
      like(tenderTable.tender_description, searchTerm),
    );

    if (statusFilter) {
      return and(
        searchCondition,
        eq(
          tenderTable.tender_status,
          statusFilter as typeof TENDER_STATUS.PUBLISHED,
        ),
      );
    }

    return searchCondition;
  }

  if (statusFilter) {
    return eq(
      tenderTable.tender_status,
      statusFilter as typeof TENDER_STATUS.PUBLISHED,
      // `tender_value` field removed
    );
  }

  return or(
    eq(tenderTable.tender_status, TENDER_STATUS.PUBLISHED),
    eq(tenderTable.tender_status, TENDER_STATUS.DRAFT),
  );
};

// Get tender with related data
export const getTenderWithRelatedData = async ({
  tenderId,
  isFromGetSavedTender,
}: {
  tenderId: number;
  isFromGetSavedTender: boolean;
}) => {
  const whereCondition = isFromGetSavedTender
    ? and(
        eq(tenderTable.tender_id, tenderId),
        or(
          eq(tenderTable.tender_status, TENDER_STATUS.DRAFT),
          eq(tenderTable.tender_status, TENDER_STATUS.RESCHEDULED),
        ),
      )
    : eq(tenderTable.tender_id, tenderId);

  const selectFields = {
    tender_id: tenderTable.tender_id,
    tender_number: tenderTable.tender_number,
    tender_department: tenderTable.tender_department,
    tender_remark: tenderTable.tender_remark,
    tender_type: tenderTable.tender_type,
    tender_scope: tenderTable.tender_scope,
    tender_title: tenderTable.tender_title,
    tender_description: tenderTable.tender_description,
    tender_contract_document: tenderTable.tender_contract_document,
    tender_doc_fee: tenderTable.tender_doc_fee,
    tender_emd: tenderTable.tender_emd,
    tender_location: tenderTable.tender_location,
    // New timeline fields
    tender_release_date: tenderTable.tender_release_date,
    tender_query_deadline: tenderTable.tender_query_deadline,
    tender_query_response_date: tenderTable.tender_query_response_date,
    tender_bid_submission_deadline: tenderTable.tender_bid_submission_deadline,
    tender_technical_bid_opening: tenderTable.tender_technical_bid_opening,
    tender_financial_bid_opening: tenderTable.tender_financial_bid_opening,
    tender_opening_venue: tenderTable.tender_opening_venue,
    tender_project_duration: tenderTable.tender_project_duration,
    tender_is_technical_doc: tenderTable.tender_is_technical_doc,
    tender_is_financial_doc: tenderTable.tender_is_financial_doc,
    tender_status: tenderTable.tender_status,
    ...(isFromGetSavedTender
      ? {}
      : {
          tender_created_by_id: tenderTable.tender_created_by_id,
          // The tender page only server-renders approved tenders
          tender_is_active: tenderTable.tender_is_active,
        }),
    created_at: tenderTable.created_at,
    updated_at: tenderTable.updated_at,
  };

  const [tender] = await db
    .select(selectFields)
    .from(tenderTable)
    .where(whereCondition)
    .limit(1);

  if (!tender) {
    throw new ApiError("Tender not found", 404, "TENDER_NOT_FOUND");
  }

  const bidderDocuments = await db
    .select()
    .from(vendorDocRequirementTable)
    .where(eq(vendorDocRequirementTable.tender_id, tenderId));

  return {
    tender,
    bidderDocuments,
  };
};

/**
 * Combined cost of a tender (document fee + EMD) as a number.
 *
 * Both columns are varchar, so they are cast rather than compared as text -
 * without this, "9" would sort above "50000". Empty strings and NULLs count
 * as zero.
 */
const tenderCostExpr = sql`(
  CAST(COALESCE(NULLIF(${tenderTable.tender_doc_fee}, ''), '0') AS DECIMAL(20, 2))
  + CAST(COALESCE(NULLIF(${tenderTable.tender_emd}, ''), '0') AS DECIMAL(20, 2))
)`;

// Budget bands, matching the labels offered in the home filter UI
const BUDGET_BANDS: Record<string, { min?: number; max?: number }> = {
  low: { max: 1_000_000 }, // under 10 lakhs
  mid: { min: 1_000_000, max: 5_000_000 }, // 10 - 50 lakhs
  high: { min: 5_000_000 }, // above 50 lakhs
};

// Tender pages for the sitemap - the same rule as the home listing: approved
// and past the release date, whether still open or closed
export const sitemapTenders = async () => {
  const nowFormatted = getCurrentTimeFormatted(new Date());

  return db
    .select({
      tender_id: tenderTable.tender_id,
      updated_at: tenderTable.updated_at,
    })
    .from(tenderTable)
    .where(
      and(
        eq(tenderTable.tender_is_active, true),
        sql`${tenderTable.tender_release_date} IS NOT NULL AND ${tenderTable.tender_release_date} <= ${nowFormatted}`,
      ),
    )
    .orderBy(desc(tenderTable.tender_release_date));
};

// Home latest tenders
export const homeLatestTenders = async (data: HomeLatestTendersType) => {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const {
    page = 1,
    limit = 6,
    search,
    department,
    location,
    budgetRange,
    publishDate: _publishDate,
    status,
    sortBy,
    availability = "all",
  } = data;
  /* eslint-enable @typescript-eslint/no-unused-vars */
  const offset = (Number(page) - 1) * Number(limit);

  // Format current time for SQL comparison using centralized helper
  const now = new Date();
  const nowFormatted = getCurrentTimeFormatted(now);

  // Mirrors isTenderLive: a tender is closed once its bid deadline has passed
  const deadline = tenderTable.tender_bid_submission_deadline;
  const isClosedExpr = sql`(${deadline} IS NOT NULL AND ${deadline} <= ${nowFormatted})`;

  let conditions: SQL<unknown> | undefined;

  // Base status filter - only show published tenders
  conditions = and(conditions, eq(tenderTable.tender_is_active, true));

  // Timeline filter: Only show tenders where tender_release_date has passed
  conditions = and(
    conditions,
    sql`${tenderTable.tender_release_date} IS NOT NULL AND ${tenderTable.tender_release_date} <= ${nowFormatted}`,
  );

  // Department filter
  if (department) {
    conditions = and(conditions, eq(tenderTable.tender_department, department));
  }

  // Location filter
  if (location) {
    conditions = and(
      conditions,
      like(tenderTable.tender_location, `%${location}%`),
    );
  }

  // Status filter (overrides base status if provided)
  if (status) {
    conditions = and(
      conditions,
      eq(tenderTable.tender_status, status as TENDER_STATUS),
    );
  }

  // Keyword search across title, department, type, scope, location, description
  if (search) {
    conditions = and(conditions, createSearchCondition(search));
  }

  // Budget filter on combined document fee + EMD
  const band = budgetRange ? BUDGET_BANDS[budgetRange] : undefined;
  if (band) {
    if (band.min !== undefined) {
      conditions = and(conditions, sql`${tenderCostExpr} >= ${band.min}`);
    }
    if (band.max !== undefined) {
      conditions = and(conditions, sql`${tenderCostExpr} < ${band.max}`);
    }
  }

  // Publish date filter handled in query

  // Every filter except open / closed - the tab counts are taken over this
  const filterConditions = conditions;

  // Open / closed filter
  if (availability === "open") {
    conditions = and(conditions, sql`NOT ${isClosedExpr}`);
  } else if (availability === "closed") {
    conditions = and(conditions, isClosedExpr);
  }

  // Query tenders with computed status based on timeline
  const baseQuery = db
    .select({
      tender_id: tenderTable.tender_id,
      tender_title: tenderTable.tender_title,
      tender_number: tenderTable.tender_number,
      tender_description: tenderTable.tender_description,
      tender_bid_end_date: tenderTable.tender_bid_submission_deadline,
      tender_doc_fee: tenderTable.tender_doc_fee,
      tender_emd: tenderTable.tender_emd,
      tender_department: tenderTable.tender_department,
      tender_type: tenderTable.tender_type,
      tender_scope: tenderTable.tender_scope,
      tender_location: tenderTable.tender_location,
      tender_status: tenderTable.tender_status,
      tender_release_date: tenderTable.tender_release_date,
      tender_bid_submission_deadline:
        tenderTable.tender_bid_submission_deadline,
      tender_is_active: tenderTable.tender_is_active,
    })
    .from(tenderTable)
    .where(conditions);

  // Sorting - must match the options offered in HomeSortSection
  const orderBy = (() => {
    switch (sortBy) {
      case "oldest":
        return [asc(tenderTable.created_at)];
      case "deadline-soon":
        // Open tenders by nearest deadline, then ones without a deadline,
        // then closed tenders with the most recently closed first
        return [
          isClosedExpr,
          sql`${deadline} IS NULL`,
          sql`CASE WHEN ${isClosedExpr} THEN NULL ELSE ${deadline} END`,
          desc(deadline),
        ];
      case "budget-high":
        return [desc(tenderCostExpr)];
      case "budget-low":
        return [asc(tenderCostExpr)];
      case "latest":
      default:
        return [desc(tenderTable.created_at)];
    }
  })();

  const rawTenders = await baseQuery
    .orderBy(...orderBy)
    .limit(Number(limit))
    .offset(offset);

  // Compute display status using centralized helper
  const tenders = rawTenders.map((tender) => {
    // Use centralized helper to determine if tender is live
    const isLive = isTenderLive(tender, now);

    return {
      tender_id: tender.tender_id,
      tender_title: tender.tender_title,
      tender_number: tender.tender_number,
      tender_description: tender.tender_description,
      tender_bid_end_date: tender.tender_bid_end_date,
      tender_doc_fee: tender.tender_doc_fee,
      tender_emd: tender.tender_emd,
      tender_department: tender.tender_department,
      tender_type: tender.tender_type,
      tender_scope: tender.tender_scope,
      tender_location: tender.tender_location,
      isLive,
    };
  });

  // Counts for each open / closed tab under the other filters, in one pass
  const [tabCounts] = await db
    .select({
      all: count(),
      closed: sql<number>`COALESCE(SUM(CASE WHEN ${isClosedExpr} THEN 1 ELSE 0 END), 0)`,
    })
    .from(tenderTable)
    .where(filterConditions);

  const availabilityCounts = {
    all: Number(tabCounts.all),
    open: Number(tabCounts.all) - Number(tabCounts.closed),
    closed: Number(tabCounts.closed),
  };

  const totalCount = availabilityCounts[availability];
  const totalPages = Math.ceil(totalCount / Number(limit));

  return {
    tenders,
    page: Number(page),
    totalPages,
    totalCount,
    availabilityCounts,
  };
};

// Distinct locations of published tenders, offered as filter suggestions
export const homeTenderLocations = async () => {
  const nowFormatted = getCurrentTimeFormatted(new Date());

  const rows = await db
    .selectDistinct({ location: tenderTable.tender_location })
    .from(tenderTable)
    .where(
      and(
        eq(tenderTable.tender_is_active, true),
        sql`${tenderTable.tender_release_date} IS NOT NULL AND ${tenderTable.tender_release_date} <= ${nowFormatted}`,
        sql`TRIM(${tenderTable.tender_location}) <> ''`,
      ),
    )
    .orderBy(asc(tenderTable.tender_location))
    .limit(50);

  // Trimmed values still match, since the filter is a substring search
  const locations = rows.flatMap((row) => row.location?.trim() || []);
  return { locations: [...new Set(locations)] };
};

/**
 * Headline counts for the public home banner.
 *
 * "Open" uses the same visibility rules as homeLatestTenders (active, already
 * released) plus a deadline still in the future, so the number cannot exceed
 * what a visitor is able to browse.
 */
export const homeTenderStats = async () => {
  const now = new Date();
  const nowFormatted = getCurrentTimeFormatted(now);

  const inSevenDays = new Date(now.getTime() + 7 * 86_400_000);
  const weekFormatted = getCurrentTimeFormatted(inSevenDays);

  const visible = and(
    eq(tenderTable.tender_is_active, true),
    sql`${tenderTable.tender_release_date} IS NOT NULL AND ${tenderTable.tender_release_date} <= ${nowFormatted}`,
  );

  const stillOpen = sql`${tenderTable.tender_bid_submission_deadline} IS NOT NULL AND ${tenderTable.tender_bid_submission_deadline} > ${nowFormatted}`;

  const [openTenders, closingThisWeek, departments] = await Promise.all([
    db
      .select({ count: count() })
      .from(tenderTable)
      .where(and(visible, stillOpen)),
    db
      .select({ count: count() })
      .from(tenderTable)
      .where(
        and(
          visible,
          stillOpen,
          sql`${tenderTable.tender_bid_submission_deadline} <= ${weekFormatted}`,
        ),
      ),
    db
      .select({
        count: sql<number>`COUNT(DISTINCT ${tenderTable.tender_department})`,
      })
      .from(tenderTable)
      .where(and(visible, stillOpen)),
  ]);

  return {
    openTenders: Number(openTenders[0]?.count ?? 0),
    closingThisWeek: Number(closingThisWeek[0]?.count ?? 0),
    departments: Number(departments[0]?.count ?? 0),
  };
};

// Admin live tenders
export const adminLiveTenders = async (data: AdminLiveTendersType) => {
  const { limit = 5, page = 1, department, query, tab = "active" } = data;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const offset = (pageNumber - 1) * limitNumber;

  // Format current time for SQL comparison using centralized helper
  const now = new Date();
  const nowFormatted = getCurrentTimeFormatted(now);

  let conditions: SQL<unknown> | undefined = eq(
    tenderTable.tender_is_active,
    true,
  );

  if (query) {
    conditions = and(conditions, createSearchCondition(query as string));
  }

  if (department) {
    conditions = and(
      conditions,
      eq(tenderTable.tender_department, department as string),
    );
  }

  // Tab-based filtering:
  // "upcoming" = tender_release_date is in the future (not yet released to vendors)
  // "active" = tender_release_date has passed AND bid submission deadline has passed (tenders ready for bid review)
  // "pending" = tender_release_date has passed AND bid submission deadline has NOT passed (still accepting bids)
  if (tab === "upcoming") {
    // Show tenders where release date is in the future
    conditions = and(
      conditions,
      sql`${tenderTable.tender_release_date} IS NOT NULL AND ${tenderTable.tender_release_date} > ${nowFormatted}`,
    );
  } else if (tab === "active") {
    // Ready for review - release date has passed AND deadline has passed
    conditions = and(
      conditions,
      sql`${tenderTable.tender_release_date} IS NOT NULL AND ${tenderTable.tender_release_date} <= ${nowFormatted}`,
      sql`${tenderTable.tender_bid_submission_deadline} IS NOT NULL AND ${tenderTable.tender_bid_submission_deadline} < ${nowFormatted}`,
    );
  } else if (tab === "pending") {
    // Still accepting bids - release date has passed AND deadline is in the future
    conditions = and(
      conditions,
      sql`${tenderTable.tender_release_date} IS NOT NULL AND ${tenderTable.tender_release_date} <= ${nowFormatted}`,
      sql`${tenderTable.tender_bid_submission_deadline} IS NOT NULL AND ${tenderTable.tender_bid_submission_deadline} > ${nowFormatted}`,
    );
  }

  const rawTenders = await db
    .select({
      tender_id: tenderTable.tender_id,
      tender_title: tenderTable.tender_title,
      tender_number: tenderTable.tender_number,
      tender_bid_end_date: tenderTable.tender_bid_submission_deadline,
      tender_doc_fee: tenderTable.tender_doc_fee,
      tender_emd: tenderTable.tender_emd,
      tender_description: tenderTable.tender_description,
      tender_department: departmentTable.division_name,
      tender_remark: tenderTable.tender_remark,
      tender_type: tenderTable.tender_type,
      tender_status: tenderTable.tender_status,
      tender_scope: tenderTable.tender_scope,
      tender_location: tenderTable.tender_location,
      tender_bid_submission_deadline:
        tenderTable.tender_bid_submission_deadline,
      tender_technical_bid_opening: tenderTable.tender_technical_bid_opening,
      tender_financial_bid_opening: tenderTable.tender_financial_bid_opening,
      tender_is_active: tenderTable.tender_is_active,
    })
    .from(tenderTable)
    .leftJoin(
      departmentTable,
      eq(tenderTable.tender_department, departmentTable.division_name),
    )
    .where(
      and(conditions, eq(tenderTable.tender_status, TENDER_STATUS.PUBLISHED)),
    )
    .orderBy(desc(tenderTable.created_at))
    .limit(limitNumber)
    .offset(offset);

  // Compute display status using centralized helper
  const tenders = rawTenders.map((tender) => {
    // Use centralized helper to determine if tender is live
    const isLive = isTenderLive(tender, now);

    return {
      ...tender,
      isLive,
    };
  });

  const [totalTenders] = await db
    .select({ count: count() })
    .from(tenderTable)
    .where(
      and(conditions, eq(tenderTable.tender_status, TENDER_STATUS.PUBLISHED)),
    );

  const totalCount = totalTenders.count;
  const totalPages = Math.ceil(totalCount / Number(limit));

  return { tenders, page: pageNumber, totalCount, totalPages, tab };
};

// Review tenders
export const reviewTenders = async () => {
  const tenders = await db
    .select({
      tender_id: tenderTable.tender_id,
      tender_number: tenderTable.tender_number,
      tender_department: tenderTable.tender_department,
      tender_remark: tenderTable.tender_remark,
      tender_type: tenderTable.tender_type,
      tender_scope: tenderTable.tender_scope,
      tender_title: tenderTable.tender_title,
      tender_description: tenderTable.tender_description,
      tender_contract_document: tenderTable.tender_contract_document,
      tender_doc_fee: tenderTable.tender_doc_fee,
      tender_emd: tenderTable.tender_emd,
      tender_location: tenderTable.tender_location,
      tender_release_date: tenderTable.tender_release_date,
      tender_query_deadline: tenderTable.tender_query_deadline,
      tender_query_response_date: tenderTable.tender_query_response_date,
      tender_bid_submission_deadline:
        tenderTable.tender_bid_submission_deadline,
      tender_technical_bid_opening: tenderTable.tender_technical_bid_opening,
      tender_financial_bid_opening: tenderTable.tender_financial_bid_opening,
      tender_opening_venue: tenderTable.tender_opening_venue,
      tender_project_duration: tenderTable.tender_project_duration,
      tender_status: tenderTable.tender_status,
      tender_created_by_id: tenderTable.tender_created_by_id,
      created_at: tenderTable.created_at,
      updated_at: tenderTable.updated_at,
    })
    .from(tenderTable)
    .where(eq(tenderTable.tender_status, TENDER_STATUS.REVIEW))
    .orderBy(desc(tenderTable.created_at));

  // Fetch related data for each tender
  const tendersWithRelatedData = await Promise.all(
    tenders.map(async (tender) => {
      const bidderDocumentsReq = await db
        .select()
        .from(vendorDocRequirementTable)
        .where(eq(vendorDocRequirementTable.tender_id, tender.tender_id));

      // `tenderVendorSelectionTable` removed — return empty vendor selection.
      return {
        ...tender,
        bidderDocumentsReq,
        vendorSelection: [],
      };
    }),
  );

  const [totalTenders] = await db.select({ count: count() }).from(tenderTable);

  const totalCount = totalTenders.count;

  return { tenders: tendersWithRelatedData, totalCount };
};

// Reviewed (rescheduled) tenders - lightweight list for admin view (no pagination)
export const reviewedTenders = async () => {
  const tenders = await db
    .select({
      tender_id: tenderTable.tender_id,
      tender_title: tenderTable.tender_title,
      tender_number: tenderTable.tender_number,
      tender_department: tenderTable.tender_department,
      tender_status: tenderTable.tender_status,
      tender_remark: tenderTable.tender_remark,
      created_at: tenderTable.created_at,
      updated_at: tenderTable.updated_at,
    })
    .from(tenderTable)
    .where(eq(tenderTable.tender_status, TENDER_STATUS.RESCHEDULED))
    .orderBy(desc(tenderTable.created_at));

  const totalCount = tenders.length;

  return { tenders, totalCount };
};

// Tender details
export const tenderDetails = async (id: number) => {
  const { bidderDocuments, tender } = await getTenderWithRelatedData({
    tenderId: Number(id),
    isFromGetSavedTender: false,
  });

  // Vendor selection now handled via email invitations
  const vendorSelection: never[] = [];

  // Fetch email invitations
  const emailInvites = await db
    .select()
    .from(tenderEmailInvitesTable)
    .where(eq(tenderEmailInvitesTable.tender_id, Number(id)));

  // Get timeline status using centralized helper
  const timelineStatus = getTenderTimelineStatus(tender);
  const isLive = timelineStatus.isBidSubmissionOpen;
  const isReleased = timelineStatus.isReleased;

  return {
    tender,
    bidderDocuments,
    vendorSelection,
    emailInvites,
    isLive,
    isReleased,
  };
};

// Saved tenders (no pagination)
export const savedTenders = async () => {
  const savedTenders = await db
    .select({
      tender_id: tenderTable.tender_id,
      tender_title: tenderTable.tender_title,
      tender_number: tenderTable.tender_number,
      created_at: tenderTable.created_at,
      updated_at: tenderTable.updated_at,
    })
    .from(tenderTable)
    .where(eq(tenderTable.tender_status, TENDER_STATUS.DRAFT))
    .orderBy(desc(tenderTable.created_at));

  const totalCount = savedTenders.length;

  return { savedTenders, totalCount };
};

// Saved tender (single draft)
export const savedTender = async (id: number) => {
  const { tender, bidderDocuments } = await getTenderWithRelatedData({
    tenderId: id,
    isFromGetSavedTender: true,
  });

  // Fetch invited emails
  const emailInvites = await db
    .select()
    .from(tenderEmailInvitesTable)
    .where(eq(tenderEmailInvitesTable.tender_id, Number(id)));

  const step1 = {
    tender_id: tender.tender_id.toString(),
    tender_department: tender.tender_department ?? "",
    tender_number: tender.tender_number ?? "",
    tender_type: tender.tender_type ?? undefined,
    tender_scope: tender.tender_scope ?? undefined,
    tender_title: tender.tender_title ?? "",
    tender_description: tender.tender_description ?? "",
    tender_contract_document: tender.tender_contract_document ?? "",
    tender_location: tender.tender_location ?? "",
    // `tender_value` field removed
    tender_opening_venue: tender.tender_opening_venue ?? "",
    tender_project_duration: tender.tender_project_duration ?? "",
    tender_doc_fee: tender.tender_doc_fee ?? "",
    tender_emd: tender.tender_emd ?? "",
    tender_is_technical_doc: tender.tender_is_technical_doc ?? false,
    tender_is_financial_doc: tender.tender_is_financial_doc ?? false,
    invited_emails: emailInvites.map((invite) => invite.email),
  };

  const step2 = bidderDocuments.map((doc) => {
    return {
      vdr_name: doc.vdr_name ?? "",
    };
  });

  const step3 = {
    tender_release_date: tender.tender_release_date,
    tender_query_deadline: tender.tender_query_deadline,
    tender_query_response_date: tender.tender_query_response_date,
    tender_bid_submission_deadline: tender.tender_bid_submission_deadline,
    tender_technical_bid_opening: tender.tender_technical_bid_opening,
    tender_financial_bid_opening: tender.tender_financial_bid_opening,
  };

  return {
    step1,
    step2,
    step3,
  };
};

// Tender search results
export const tenderSearchResults = async (data: TenderSearchResultsType) => {
  const conditions = createSearchCondition(data.query as string, "live");

  const tenders = await db
    .select({
      tender_id: tenderTable.tender_id,
      tender_title: tenderTable.tender_title,
      tender_department: tenderTable.tender_department,
      tender_type: tenderTable.tender_type,
      tender_scope: tenderTable.tender_scope,
      tender_location: tenderTable.tender_location,
    })
    .from(tenderTable)
    .where(conditions)
    .orderBy(desc(tenderTable.created_at))
    .limit(5);

  return { tenders };
};
