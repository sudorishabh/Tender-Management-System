import { publicProcedure, rateLimitedProcedure, router } from "../../trpc";
import { handleProcedureError } from "../../errorHandler";
import { deleteFileSchema, fileUrlSchema } from "./s3.schema";
import { deleteFileService, getFileUrlService } from "./s3.service";

export const s3Router = router({
  getFileUrl: publicProcedure.input(fileUrlSchema).query(async ({ input }) => {
    try {
      const fileUrl = await getFileUrlService(input.fileName, input.fileType);
      return {
        success: true,
        fileUrl,
      };
    } catch (error) {
      throw handleProcedureError(error, "Failed to get file URL");
    }
  }),

  // Public because the registration form cleans up its uploads while signed
  // out; only files no record uses can be deleted
  deleteFile: rateLimitedProcedure("delete-file", 60, 60 * 60 * 1000)
    .input(deleteFileSchema)
    .mutation(async ({ input }) => {
      try {
        await deleteFileService(input.fileName);
        return {
          success: true,
          message: "File deleted successfully",
        };
      } catch (error) {
        throw handleProcedureError(error, "Failed to delete file");
      }
    }),
});
