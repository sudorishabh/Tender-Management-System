import { cache } from "react";
import { tenderDetails } from "@/server/trpc/routers/tender/tender.service";
import { ApiError } from "@/lib/server/errors";

/** Route params arrive as strings - only positive integers are tender ids */
export const parseTenderId = (raw: string) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

/**
 * Loads a tender for the public tender page on the server.
 *
 * `response` has the same shape as the public `tender.getDetails` procedure so
 * the client query can start from it. `isPublic` matches the home listing:
 * approved and past its release date. Anything else stays out of the HTML.
 *
 * Wrapped in `cache` so generateMetadata and the page share one fetch.
 * Returns null when the tender does not exist.
 */
export const getTender = cache(async (tenderId: number) => {
  try {
    const { tender, bidderDocuments, isLive, isReleased } =
      await tenderDetails(tenderId);

    return {
      isPublic: tender.tender_is_active === true && isReleased,
      response: {
        success: true,
        tenderData: {
          tender,
          bidderDocumentsReq: bidderDocuments,
          isLive,
          isReleased,
        },
      },
    };
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) return null;
    throw error;
  }
});
