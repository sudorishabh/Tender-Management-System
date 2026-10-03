import {
  router,
  publicProcedure,
  adminProcedure,
  superAdminProcedure,
} from "../../trpc";
import { z } from "zod";
import { handleProcedureError } from "../../errorHandler";
import {
  homeLatestTendersSchema,
  adminLiveTendersSchema,
  savedTendersSchema,
  tenderSearchResultsSchema,
  getReviewedTendersSchema,
} from "./tender.schema";
import {
  homeLatestTenders,
  homeTenderStats,
  homeTenderLocations,
  adminLiveTenders,
  tenderDetails,
  savedTender,
  savedTenders,
  tenderSearchResults,
  reviewTenders,
  reviewedTenders,
} from "./tender.service";
import { getLiveTenderForEdit } from "./tender.service.helper";

export const tenderQueryRoute = router({
  // Get home latest tenders (public)
  getHomeLatest: publicProcedure
    .input(homeLatestTendersSchema)
    .query(async ({ input }) => {
      try {
        const data = await homeLatestTenders(input);
        return { success: true, ...data };
      } catch (error) {
        throw handleProcedureError(error, "Failed to fetch tenders");
      }
    }),

  // Get headline counts for the home banner (public)
  getHomeStats: publicProcedure.query(async () => {
    try {
      const data = await homeTenderStats();
      return { success: true, ...data };
    } catch (error) {
      throw handleProcedureError(error, "Failed to fetch tender stats");
    }
  }),

  // Get locations to suggest in the home location filter (public)
  getHomeLocations: publicProcedure.query(async () => {
    try {
      const data = await homeTenderLocations();
      return { success: true, ...data };
    } catch (error) {
      throw handleProcedureError(error, "Failed to fetch tender locations");
    }
  }),

  // Get reviewed tenders (admin only)
  getReviewedTenders: adminProcedure
    .input(getReviewedTendersSchema)
    .query(async () => {
      try {
        const data = await reviewedTenders();
        return { success: true, ...data };
      } catch (error) {
        throw handleProcedureError(error, "Failed to fetch reviewed tenders");
      }
    }),

  // Get admin live tenders (admin only)
  getAdminLive: adminProcedure
    .input(adminLiveTendersSchema)
    .query(async ({ input }) => {
      try {
        const result = await adminLiveTenders(input);
        return { success: true, ...result };
      } catch (error) {
        throw handleProcedureError(error, "Failed to fetch live tenders");
      }
    }),

  // Get tender details (public) — vendorSelection and emailInvites are intentionally
  // excluded from this response; they contain sensitive business data (invited vendors
  // and their email addresses) that must not be exposed to unauthenticated users.
  getDetails: publicProcedure.input(z.number()).query(async ({ input }) => {
    try {
      const {
        tender,
        bidderDocuments,
        isLive,
        isReleased,
      } = await tenderDetails(input);

      return {
        success: true,
        tenderData: {
          tender,
          bidderDocumentsReq: bidderDocuments,
          isLive,
          isReleased,
        },
      };
    } catch (error) {
      throw handleProcedureError(error, "Tender not found");
    }
  }),

  // Full tender details including vendorSelection and emailInvites (super admin only).
  // These fields are excluded from the public getDetails endpoint to prevent
  // leaking invited vendor identities and email addresses.
  getAdminDetails: superAdminProcedure
    .input(z.number())
    .query(async ({ input }) => {
      try {
        const {
          tender,
          bidderDocuments,
          vendorSelection,
          emailInvites,
          isLive,
          isReleased,
        } = await tenderDetails(input);

        return {
          success: true,
          tenderData: {
            tender,
            bidderDocumentsReq: bidderDocuments,
            isLive,
            isReleased,
          },
          vendorSelection,
          emailInvites,
        };
      } catch (error) {
        throw handleProcedureError(error, "Tender not found");
      }
    }),

  // Get saved tender (admin only)
  getSaved: adminProcedure.input(z.number()).query(async ({ input }) => {
    try {
      const result = await savedTender(input);
      return { success: true, ...result };
    } catch (error) {
      throw handleProcedureError(error, "Saved tender not found");
    }
  }),

  getReviewTenders: superAdminProcedure.query(async () => {
    try {
      const data = await reviewTenders();
      return { success: true, ...data };
    } catch (error) {
      throw handleProcedureError(error, "Failed to fetch review tenders");
    }
  }),

  // Get saved tenders (admin only)
  getSavedTenders: adminProcedure.input(savedTendersSchema).query(async () => {
    try {
      const result = await savedTenders();
      return { success: true, ...result };
    } catch (error) {
      throw handleProcedureError(error, "Failed to fetch saved tenders");
    }
  }),

  // Get live tender data for editing (admin only)
  getForEdit: adminProcedure.input(z.number()).query(async ({ input }) => {
    try {
      const result = await getLiveTenderForEdit(input);
      return { success: true, ...result };
    } catch (error) {
      throw handleProcedureError(error, "Failed to fetch tender for editing");
    }
  }),

  // Search tenders (public)
  search: publicProcedure
    .input(tenderSearchResultsSchema)
    .query(async ({ input }) => {
      try {
        const result = await tenderSearchResults(input);
        return { success: true, ...result };
      } catch (error) {
        throw handleProcedureError(error, "Failed to search tenders");
      }
    }),
});
