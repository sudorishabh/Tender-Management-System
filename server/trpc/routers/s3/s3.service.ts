import { unlink } from "fs/promises";
import { eq, or } from "drizzle-orm";
import { db } from "@/server/db";
import {
  bidsTable,
  bidVendorDocsTable,
  businessTable,
  tenderTable,
  vendorProfileTable,
} from "@/server/db/schema";
import {
  InternalServerError,
  ApiError,
  BadRequestError,
  ForbiddenError,
} from "@/lib/server/errors";
import { parseUploadKey, resolveUploadPath } from "@/lib/server/uploads";
import {
  canVendorsViewTender,
  getTenderTimelineStatus,
} from "@/lib/server/tenderStateHelpers";

export type FileViewer = {
  userId: number;
  role: "vendor" | "admin" | "super_admin";
} | null;

export type FileAccess = "allowed" | "denied" | "not_found";

const tenderDates = {
  tender_is_active: tenderTable.tender_is_active,
  tender_release_date: tenderTable.tender_release_date,
  tender_bid_submission_deadline: tenderTable.tender_bid_submission_deadline,
  tender_technical_bid_opening: tenderTable.tender_technical_bid_opening,
  tender_financial_bid_opening: tenderTable.tender_financial_bid_opening,
};

/**
 * Finds every record that uses an uploaded file. Records store the bare
 * upload name without the "pdf/" folder, so callers pass the parsed name.
 */
async function findFileReferences(name: string) {
  const [tenders, vendorDocs, businessDocs, bids, bidRequirementDocs] =
    await Promise.all([
      db
        .select(tenderDates)
        .from(tenderTable)
        .where(eq(tenderTable.tender_contract_document, name)),
      db
        .select({ ownerId: vendorProfileTable.user_id })
        .from(vendorProfileTable)
        .where(
          or(
            eq(vendorProfileTable.vendor_pan_doc_key, name),
            eq(vendorProfileTable.vendor_adhar_doc_key, name),
            eq(vendorProfileTable.vendor_image_key, name)
          )
        ),
      db
        .select({ ownerId: vendorProfileTable.user_id })
        .from(businessTable)
        .innerJoin(
          vendorProfileTable,
          eq(businessTable.vendor_id, vendorProfileTable.vendor_id)
        )
        .where(
          or(
            eq(businessTable.biz_reg_doc_key, name),
            eq(businessTable.biz_gst_doc_key, name),
            eq(businessTable.biz_bank_doc_key, name),
            eq(businessTable.biz_msme_cert_doc_key, name)
          )
        ),
      db
        .select({
          ownerId: vendorProfileTable.user_id,
          bid_fee_doc_key: bidsTable.bid_fee_doc_key,
          technical_doc_key: bidsTable.technical_doc_key,
          financial_doc_key: bidsTable.financial_doc_key,
          tender: tenderDates,
        })
        .from(bidsTable)
        .innerJoin(
          vendorProfileTable,
          eq(bidsTable.vendor_id, vendorProfileTable.vendor_id)
        )
        .innerJoin(tenderTable, eq(bidsTable.tender_id, tenderTable.tender_id))
        .where(
          or(
            eq(bidsTable.bid_fee_doc_key, name),
            eq(bidsTable.technical_doc_key, name),
            eq(bidsTable.financial_doc_key, name)
          )
        ),
      db
        .select({ ownerId: vendorProfileTable.user_id })
        .from(bidVendorDocsTable)
        .innerJoin(bidsTable, eq(bidVendorDocsTable.bid_id, bidsTable.bid_id))
        .innerJoin(
          vendorProfileTable,
          eq(bidsTable.vendor_id, vendorProfileTable.vendor_id)
        )
        .where(eq(bidVendorDocsTable.bvd_doc_key, name)),
    ]);

  return {
    tenders,
    // Vendor KYC documents and bid requirement documents
    vendorOwnerIds: [...vendorDocs, ...businessDocs, ...bidRequirementDocs].map(
      (row) => row.ownerId
    ),
    bids,
    isReferenced:
      tenders.length +
        vendorDocs.length +
        businessDocs.length +
        bids.length +
        bidRequirementDocs.length >
      0,
  };
}

type BidFileRow = Awaited<ReturnType<typeof findFileReferences>>["bids"][number];

// Same masking as the admin bid views in bid.service.ts: technical and
// financial documents stay hidden until their opening dates
function canAdminSeeBidFile(bid: BidFileRow, name: string): boolean {
  if (name === bid.bid_fee_doc_key) return true;

  const status = getTenderTimelineStatus(bid.tender);
  if (!status.isBidSubmissionClosed) return false;

  return (
    (name === bid.technical_doc_key && status.canShowTechnicalDoc) ||
    (name === bid.financial_doc_key && status.canShowFinancialDoc)
  );
}

/**
 * Decides whether `viewer` (null when signed out) may open an uploaded file:
 * - tender documents: anyone once the tender is approved and released
 * - vendor and bid documents: the vendor they belong to
 * - admins: everything, except bid documents that are still sealed
 * Files that no record uses are not served at all.
 */
export async function getFileAccess(
  fileKey: string,
  viewer: FileViewer
): Promise<FileAccess> {
  const parsed = parseUploadKey(fileKey);
  if (!parsed) return "not_found";

  const { name } = parsed;
  const { tenders, vendorOwnerIds, bids, isReferenced } =
    await findFileReferences(name);

  if (!isReferenced) return "not_found";

  const isAdmin = viewer?.role === "admin" || viewer?.role === "super_admin";
  const isOwner = (ownerId: number) => viewer?.userId === ownerId;

  const allowed =
    tenders.some((tender) => isAdmin || canVendorsViewTender(tender)) ||
    vendorOwnerIds.some((ownerId) => isAdmin || isOwner(ownerId)) ||
    bids.some(
      (bid) => isOwner(bid.ownerId) || (isAdmin && canAdminSeeBidFile(bid, name))
    );

  return allowed ? "allowed" : "denied";
}

/**
 * Returns a local URL for viewing/downloading a file.
 */
export async function getFileUrlService(
  fileName: string,
  _fileType: string
): Promise<string> {
  return `/api/files/${fileName}`;
}

/**
 * Deletes an uploaded file that no record uses yet. The upload forms call this
 * to clean up after a failed save; files already attached to a tender, vendor
 * or bid can't be deleted this way.
 */
export async function deleteFileService(fileName: string): Promise<void> {
  const parsed = parseUploadKey(fileName);
  if (!parsed) {
    throw new BadRequestError("Invalid file name", "INVALID_FILE_NAME");
  }

  try {
    // Check and delete the same parsed name, so no spelling of the key can
    // pass the in-use check while still pointing at a used file
    const filePath = resolveUploadPath(fileName);

    if ((await findFileReferences(parsed.name)).isReferenced) {
      throw new ForbiddenError("File is in use", "FILE_IN_USE");
    }

    await unlink(filePath);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new InternalServerError("Failed to delete file", "DELETE_ERROR");
  }
}

/**
 * Deletes multiple files from the local uploads directory.
 */
export async function deleteMultipleFilesService(
  fileNames: string[]
): Promise<void> {
  try {
    await Promise.all(fileNames.map((fileName) => deleteFileService(fileName)));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new InternalServerError(
      "Failed to delete files",
      "DELETE_MULTIPLE_ERROR"
    );
  }
}
