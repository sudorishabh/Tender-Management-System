import { and, asc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "@/server/db";
import {
  businessTable,
  tenderClarificationsTable,
  tenderTable,
  vendorProfileTable,
} from "@/server/db/schema";
import {
  ApiError,
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from "@/lib/server/errors";
import { ROLES } from "@/lib/server/constants";
import { normalizeDbDate } from "@/utils/normalizeDbDate";
import { notifyUsers } from "../notification/notification.service";
import type {
  AnswerClarificationInput,
  AskClarificationInput,
} from "./clarification.schema";

// Stops one vendor flooding a tender with unanswered questions
const MAX_PENDING_PER_VENDOR = 5;

interface Viewer {
  userId: number;
  role: string;
}

const findTender = async (tenderId: number) => {
  const [tender] = await db
    .select({
      tender_id: tenderTable.tender_id,
      tender_title: tenderTable.tender_title,
      tender_number: tenderTable.tender_number,
      tender_is_active: tenderTable.tender_is_active,
      tender_release_date: tenderTable.tender_release_date,
      tender_query_deadline: tenderTable.tender_query_deadline,
      tender_bid_submission_deadline:
        tenderTable.tender_bid_submission_deadline,
      tender_created_by_id: tenderTable.tender_created_by_id,
    })
    .from(tenderTable)
    .where(eq(tenderTable.tender_id, tenderId))
    .limit(1);

  if (!tender) {
    throw new NotFoundError("Tender not found", "TENDER_NOT_FOUND");
  }

  return tender;
};

type TenderForClarification = Awaited<ReturnType<typeof findTender>>;

// Questions close at the query deadline, or the bid deadline when the tender
// has no separate query deadline
const getQuestionDeadline = (tender: TenderForClarification) =>
  tender.tender_query_deadline ?? tender.tender_bid_submission_deadline;

const isQuestionWindowOpen = (tender: TenderForClarification) => {
  const now = new Date();
  const releaseDate = normalizeDbDate(tender.tender_release_date);
  const closesAt = normalizeDbDate(getQuestionDeadline(tender));

  return (
    tender.tender_is_active &&
    !!releaseDate &&
    releaseDate <= now &&
    !!closesAt &&
    closesAt > now
  );
};

const findVendorByUserId = async (userId: number) => {
  const [vendor] = await db
    .select({
      vendor_id: vendorProfileTable.vendor_id,
      vendor_status: vendorProfileTable.vendor_status,
    })
    .from(vendorProfileTable)
    .where(eq(vendorProfileTable.user_id, userId))
    .limit(1);

  return vendor;
};

// MUTATION
////////////////////////////////////////////////////////////////////

/**
 * Vendor asks a clarification question about a tender
 */
export const askClarification = async (
  userId: number,
  { tenderId, question }: AskClarificationInput
) => {
  try {
    const vendor = await findVendorByUserId(userId);
    if (!vendor || vendor.vendor_status !== "approved") {
      throw new ForbiddenError(
        "Only approved vendors can ask clarification questions",
        "VENDOR_NOT_APPROVED"
      );
    }

    const tender = await findTender(tenderId);
    if (!isQuestionWindowOpen(tender)) {
      throw new BadRequestError(
        "The clarification period for this tender has closed",
        "CLARIFICATION_PERIOD_CLOSED"
      );
    }

    const pendingCount = await db.$count(
      tenderClarificationsTable,
      and(
        eq(tenderClarificationsTable.tender_id, tenderId),
        eq(tenderClarificationsTable.vendor_id, vendor.vendor_id),
        isNull(tenderClarificationsTable.clar_answer)
      )
    );
    if (pendingCount >= MAX_PENDING_PER_VENDOR) {
      throw new BadRequestError(
        `You can have up to ${MAX_PENDING_PER_VENDOR} unanswered questions per tender`,
        "TOO_MANY_PENDING_CLARIFICATIONS"
      );
    }

    const [created] = await db
      .insert(tenderClarificationsTable)
      .values({
        tender_id: tenderId,
        vendor_id: vendor.vendor_id,
        clar_question: question,
      })
      .$returningId();

    if (tender.tender_created_by_id) {
      await notifyUsers([
        {
          user_id: tender.tender_created_by_id,
          notif_type: "clarification",
          notif_title: "New clarification question",
          notif_message: `A vendor asked a question about "${
            tender.tender_title || "your tender"
          }".`,
          notif_link: `/admin/live/${tenderId}/clarifications`,
        },
      ]);
    }

    return { success: true, clarificationId: created.clar_id };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new InternalServerError(
      "Failed to submit clarification question",
      "ASK_CLARIFICATION_ERROR"
    );
  }
};

/**
 * Admin answers, or edits the answer to, a clarification question
 */
export const answerClarification = async (
  adminUserId: number,
  { clarificationId, answer }: AnswerClarificationInput
) => {
  try {
    const [clarification] = await db
      .select({
        tender_id: tenderClarificationsTable.tender_id,
        clar_answer: tenderClarificationsTable.clar_answer,
        tender_title: tenderTable.tender_title,
        vendor_user_id: vendorProfileTable.user_id,
      })
      .from(tenderClarificationsTable)
      .innerJoin(
        tenderTable,
        eq(tenderClarificationsTable.tender_id, tenderTable.tender_id)
      )
      .innerJoin(
        vendorProfileTable,
        eq(tenderClarificationsTable.vendor_id, vendorProfileTable.vendor_id)
      )
      .where(eq(tenderClarificationsTable.clar_id, clarificationId))
      .limit(1);

    if (!clarification) {
      throw new NotFoundError(
        "Clarification not found",
        "CLARIFICATION_NOT_FOUND"
      );
    }

    await db
      .update(tenderClarificationsTable)
      .set({
        clar_answer: answer,
        clar_answered_by: adminUserId,
        // DB clock, matching how created_at is stored
        clar_answered_at: sql`now()`,
      })
      .where(eq(tenderClarificationsTable.clar_id, clarificationId));

    const isFirstAnswer = clarification.clar_answer === null;
    const tenderName = clarification.tender_title
      ? `"${clarification.tender_title}"`
      : "a tender";

    await notifyUsers([
      {
        user_id: clarification.vendor_user_id,
        notif_type: "clarification",
        notif_title: isFirstAnswer
          ? "Your question was answered"
          : "Clarification answer updated",
        notif_message: `See the response to your question about ${tenderName}.`,
        notif_link: `/tender/${clarification.tender_id}#clarifications`,
      },
    ]);

    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new InternalServerError(
      "Failed to save clarification answer",
      "ANSWER_CLARIFICATION_ERROR"
    );
  }
};

// QUERY
////////////////////////////////////////////////////////////////////

/**
 * Answered questions for a tender (asker hidden), plus the signed-in vendor's
 * own unanswered questions and whether they can ask a new one
 */
export const tenderClarifications = async (
  tenderId: number,
  viewer?: Viewer
) => {
  try {
    const tender = await findTender(tenderId);

    const answered = await db
      .select({
        clar_id: tenderClarificationsTable.clar_id,
        clar_question: tenderClarificationsTable.clar_question,
        clar_answer: tenderClarificationsTable.clar_answer,
        clar_answered_at: tenderClarificationsTable.clar_answered_at,
      })
      .from(tenderClarificationsTable)
      .where(
        and(
          eq(tenderClarificationsTable.tender_id, tenderId),
          isNotNull(tenderClarificationsTable.clar_answer)
        )
      )
      .orderBy(asc(tenderClarificationsTable.created_at));

    const vendor =
      viewer?.role === ROLES.VENDOR
        ? await findVendorByUserId(viewer.userId)
        : undefined;

    const myPending = vendor
      ? await db
          .select({
            clar_id: tenderClarificationsTable.clar_id,
            clar_question: tenderClarificationsTable.clar_question,
            created_at: tenderClarificationsTable.created_at,
          })
          .from(tenderClarificationsTable)
          .where(
            and(
              eq(tenderClarificationsTable.tender_id, tenderId),
              eq(tenderClarificationsTable.vendor_id, vendor.vendor_id),
              isNull(tenderClarificationsTable.clar_answer)
            )
          )
          .orderBy(asc(tenderClarificationsTable.created_at))
      : [];

    const isWindowOpen = isQuestionWindowOpen(tender);

    return {
      clarifications: answered,
      myPending,
      questionDeadline: getQuestionDeadline(tender),
      isWindowOpen,
      canAsk: isWindowOpen && vendor?.vendor_status === "approved",
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new InternalServerError(
      "Failed to fetch clarifications",
      "FETCH_CLARIFICATIONS_ERROR"
    );
  }
};

/**
 * Every question on a tender with the asking business, unanswered first
 */
export const adminTenderClarifications = async (tenderId: number) => {
  try {
    const tender = await findTender(tenderId);

    const clarifications = await db
      .select({
        clar_id: tenderClarificationsTable.clar_id,
        clar_question: tenderClarificationsTable.clar_question,
        clar_answer: tenderClarificationsTable.clar_answer,
        clar_answered_at: tenderClarificationsTable.clar_answered_at,
        created_at: tenderClarificationsTable.created_at,
        business_name: sql<
          string | null
        >`coalesce(${businessTable.biz_trade_name}, ${businessTable.biz_legal_name})`,
      })
      .from(tenderClarificationsTable)
      .leftJoin(
        businessTable,
        eq(tenderClarificationsTable.vendor_id, businessTable.vendor_id)
      )
      .where(eq(tenderClarificationsTable.tender_id, tenderId))
      .orderBy(
        sql`${tenderClarificationsTable.clar_answer} IS NOT NULL`,
        asc(tenderClarificationsTable.created_at)
      );

    return {
      tender: {
        tender_id: tender.tender_id,
        tender_title: tender.tender_title,
        tender_number: tender.tender_number,
        questionDeadline: getQuestionDeadline(tender),
      },
      clarifications,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new InternalServerError(
      "Failed to fetch clarifications",
      "FETCH_CLARIFICATIONS_ERROR"
    );
  }
};
