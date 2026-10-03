import { z } from "zod";
import { TENDER_TITLE_MAX_LENGTH } from "@/lib/constants";

const titleTooLong = `Title must be ${TENDER_TITLE_MAX_LENGTH} characters or fewer`;

// Step 1: Primary Information validation schema
export const step1Schema = z.object({
  tender_id: z.coerce.number().optional(),
  tender_department: z.string().min(1, "Department is required"),
  tender_number: z.string().min(1, "Tender number is required"),
  tender_type: z.string().min(1, "Tender type is required"),
  tender_scope: z.string().min(1, "Tender scope is required"),
  tender_title: z
    .string()
    .min(1, "Title is required")
    .max(TENDER_TITLE_MAX_LENGTH, titleTooLong),
  tender_description: z.string().min(1, "Description is required"),
  tender_contract_document: z.string().optional(),
  tender_location: z.string().min(1, "Tender location is required"),
  tender_opening_venue: z.string().optional(), // Optional - Venue of opening
  tender_project_duration: z.string().optional(), // Optional - Project timeframe
  tender_is_technical_doc: z.boolean().default(false),
  tender_is_financial_doc: z.boolean().default(false),
  tender_doc_fee: z.coerce.number().min(1, "Document fee is required"),
  tender_emd: z.coerce.number().min(1, "EMD is required"),
  invited_emails: z.array(z.string().email()).optional(), // Email invitations for Limited tenders
});

// Step 2: Required Submissions (Vendor Document Requirements) validation schema
export const step2ItemSchema = z.object({
  vdr_name: z.string().min(1, "Document name is required").optional(),
});

export const step2Schema = z.array(step2ItemSchema).optional();

// Step 3: Bid Deadlines validation schema
// Accepts string dates in format 'YYYY-MM-DD HH:mm:ss' to preserve exact local time
export const step3Schema = z.object({
  tender_release_date: z.string().nullable(), // 1. Release of tender
  tender_query_deadline: z.string().nullable(), // 2. Last date for submission of written questions
  tender_query_response_date: z.string().nullable(), // 3. Response to the queries
  tender_bid_submission_deadline: z.string().nullable(), // 4. Last date for submission of bids
  tender_technical_bid_opening: z.string().nullable(), // 5. Opening of technical bid
  tender_financial_bid_opening: z.string().nullable(), // 6. Financial bid opening
});

export const step1SaveSchema = z.object({
  tender_id: z.coerce.number().optional(),
  tender_department: z.string().optional(),
  tender_number: z.string().optional(),
  tender_type: z.string().optional(),
  tender_scope: z.string().optional(),
  tender_title: z.string().max(TENDER_TITLE_MAX_LENGTH, titleTooLong).optional(),
  tender_description: z.string().optional(),
  tender_contract_document: z.string().optional(),
  tender_location: z.string().optional(),
  tender_opening_venue: z.string().optional(),
  tender_project_duration: z.string().optional(),
  tender_is_technical_doc: z.boolean().optional(), // Whether technical document is required
  tender_is_financial_doc: z.boolean().optional(), // Whether financial document is required
  tender_doc_fee: z.coerce.number().optional(), // Tender document fee
  tender_emd: z.coerce.number().optional(), // Earnest Money Deposit
  invited_emails: z.array(z.string().email()).optional(), // Email invitations for Limited tenders
});

export const step2SaveItemSchema = z.object({
  vdr_name: z.string().optional(),
});

export const step2SaveSchema = z.array(step2SaveItemSchema).optional();

export const step3SaveSchema = z.object({
  tender_release_date: z.string().nullable().optional(),
  tender_query_deadline: z.string().nullable().optional(),
  tender_query_response_date: z.string().nullable().optional(),
  tender_bid_submission_deadline: z.string().nullable().optional(),
  tender_technical_bid_opening: z.string().nullable().optional(),
  tender_financial_bid_opening: z.string().nullable().optional(),
});
