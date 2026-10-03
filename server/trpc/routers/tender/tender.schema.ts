import { z } from "zod";
import {
  step1SaveSchema,
  step1Schema,
  step2SaveSchema,
  step2Schema,
  step3SaveSchema,
  step3Schema,
} from "./tender.schema.helper";

// MUTATION SCHEMA
//////////////////////////////////////////////////////

// Complete tender creation validation
export const createTenderSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
});

export type CreateTenderType = z.infer<typeof createTenderSchema>;

export const saveTenderSchema = z.object({
  step1: step1SaveSchema,
  step2: step2SaveSchema,
  step3: step3SaveSchema,
});

export type SaveTenderType = z.infer<typeof saveTenderSchema>;

// Update live tender schema (for editing published tenders)
export const updateLiveTenderSchema = z.object({
  tender_id: z.number().min(1, "Tender ID is required"),
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
});

export type UpdateLiveTenderType = z.infer<typeof updateLiveTenderSchema>;

// QUERY SCHEMA
////////////////////////////////////////////////////////

// Home latest tenders query schema
export const homeLatestTendersSchema = z.object({
  page: z.number(),
  limit: z.number(),
  search: z
    .string()
    .transform((val) => (val.trim() === "" ? null : val.trim()))
    .nullable()
    .optional(),
  department: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional(),
  location: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional(),
  budgetRange: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional(),
  publishDate: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional(),
  status: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional(),
  sortBy: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional(),
  // Open = still taking bids, closed = deadline passed. Omitted = both.
  availability: z.enum(["open", "closed", "all"]).optional(),
});

export type HomeLatestTendersType = z.infer<typeof homeLatestTendersSchema>;

// Saved tenders query schema (no pagination)
export const savedTendersSchema = z.object({});

export type SavedTendersType = z.infer<typeof savedTendersSchema>;

// Update tender status schema
export const updateTenderStatusSchema = z.object({
  tender_id: z.number().min(1, "Tender ID is required"),
  tender_status: z.string().min(1, "Status is required"),
  tender_remark: z.string().trim().optional(),
});

export type UpdateTenderStatusType = z.infer<typeof updateTenderStatusSchema>;

// Delete saved tender schema
export const deleteSavedTenderSchema = z.object({
  id: z.number(),
});

export type DeleteSavedTenderType = z.infer<typeof deleteSavedTenderSchema>;

// Search query schema
export const tenderSearchSchema = z.object({
  query: z.string().trim().min(1, "Search query is required"),
});

export type TenderSearchType = z.infer<typeof tenderSearchSchema>;

// Admin tenders query schema
export const adminLiveTendersSchema = z.object({
  page: z.string().trim(),
  limit: z.string().trim(),
  query: z.string().trim().optional(),
  department: z.string().trim().optional(),
  // Tab for filtering:
  // 'active' (bid deadline passed, can review bids)
  // 'pending' (still accepting bids)
  // 'upcoming' (tender release date is in the future, not yet released)
  tab: z.enum(["active", "pending", "upcoming"]).optional().default("active"),
});

export type AdminLiveTendersType = z.infer<typeof adminLiveTendersSchema>;

// Tender search results schema
export const tenderSearchResultsSchema = z.object({
  query: z.string().trim().optional(),
});

export type TenderSearchResultsType = z.infer<typeof tenderSearchResultsSchema>;

// Reviewed tenders query schema (no pagination)
export const getReviewedTendersSchema = z.object({});

export type GetReviewedTendersType = z.infer<typeof getReviewedTendersSchema>;
