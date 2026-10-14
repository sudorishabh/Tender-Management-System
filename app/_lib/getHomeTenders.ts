import { homeLatestTenders } from "@/server/trpc/routers/tender/tender.service";
import { HOME_TENDERS_PAGE_SIZE } from "@/lib/constants";

// Query params the home list reads its filters from (see useHomeFilterUrlSync)
const HOME_FILTER_PARAMS = ["show", "q", "department", "location", "budget", "sort"];

export const hasHomeFilters = (
  searchParams: Record<string, string | string[] | undefined>
) => HOME_FILTER_PARAMS.some((key) => Boolean(searchParams[key]));

/**
 * Loads the unfiltered first page of the home list on the server, so search
 * engines find the tender titles and links in the HTML.
 *
 * Same shape as the public `tender.getHomeLatest` procedure so the client
 * query can start from it. Returns undefined when the database can't be
 * reached - the client then loads the list itself, as it used to.
 */
export const getHomeTenders = async () => {
  try {
    const data = await homeLatestTenders({
      page: 1,
      limit: HOME_TENDERS_PAGE_SIZE,
      availability: "all",
    });
    return { success: true, ...data };
  } catch (error) {
    console.error("Failed to load tenders for the home page", error);
    return undefined;
  }
};
