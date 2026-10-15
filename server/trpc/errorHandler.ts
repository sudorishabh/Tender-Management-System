import { TRPCError } from "@trpc/server";
import {
  ApiError,
  ValidationError,
  ConflictError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
} from "@/lib/server/errors";

/**
 * Maps HTTP status codes to tRPC error codes
 */
const HTTP_TO_TRPC_CODE = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "BAD_REQUEST", // Validation errors map to BAD_REQUEST
  500: "INTERNAL_SERVER_ERROR",
} as const;

type TRPCErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR"
  | "PARSE_ERROR"
  | "TIMEOUT"
  | "PRECONDITION_FAILED"
  | "PAYLOAD_TOO_LARGE"
  | "METHOD_NOT_SUPPORTED"
  | "TOO_MANY_REQUESTS"
  | "CLIENT_CLOSED_REQUEST";

/**
 * Converts an ApiError to a TRPCError with appropriate code
 */
export function apiErrorToTRPCError(error: ApiError): TRPCError {
  const code =
    (HTTP_TO_TRPC_CODE[
      error.statusCode as keyof typeof HTTP_TO_TRPC_CODE
    ] as TRPCErrorCode) || "INTERNAL_SERVER_ERROR";

  return new TRPCError({
    code,
    message: error.message,
    cause: error,
  });
}

/**
 * Standard error handler for tRPC procedures
 * Converts various error types to appropriate TRPCErrors
 *
 * @param error - The error to handle
 * @param defaultMessage - Default message if error type is unknown
 * @returns TRPCError with appropriate code and message
 */
export function handleProcedureError(
  error: unknown,
  defaultMessage: string = "An unexpected error occurred"
): TRPCError {
  // Re-throw TRPCErrors as-is
  if (error instanceof TRPCError) {
    throw error;
  }

  // Handle specific ApiError subclasses
  if (error instanceof ValidationError) {
    return new TRPCError({
      code: "BAD_REQUEST",
      message: error.message,
      cause: error,
    });
  }

  if (error instanceof ConflictError) {
    return new TRPCError({
      code: "CONFLICT",
      message: error.message,
      cause: error,
    });
  }

  if (error instanceof NotFoundError) {
    return new TRPCError({
      code: "NOT_FOUND",
      message: error.message,
      cause: error,
    });
  }

  if (error instanceof BadRequestError) {
    return new TRPCError({
      code: "BAD_REQUEST",
      message: error.message,
      cause: error,
    });
  }

  if (error instanceof UnauthorizedError) {
    return new TRPCError({
      code: "UNAUTHORIZED",
      message: error.message,
      cause: error,
    });
  }

  if (error instanceof ForbiddenError) {
    return new TRPCError({
      code: "FORBIDDEN",
      message: error.message,
      cause: error,
    });
  }

  // Handle generic ApiError; server faults are hidden like unknown errors
  if (error instanceof ApiError && error.statusCode < 500) {
    return apiErrorToTRPCError(error);
  }

  // Anything else is a server fault whose message can carry internals, such
  // as the SQL text and parameters Drizzle puts in query errors. Keep it in
  // the server log and send only the generic message.
  console.error(defaultMessage, error);
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: defaultMessage,
    cause: error instanceof Error ? error : undefined,
  });
}

/**
 * Error code descriptions for better user feedback
 */
export const ERROR_DESCRIPTIONS: Record<string, string> = {
  BAD_REQUEST: "The request was invalid. Please check your input.",
  UNAUTHORIZED: "You must be logged in to perform this action.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  CONFLICT: "This action conflicts with existing data.",
  INTERNAL_SERVER_ERROR: "An unexpected error occurred. Please try again.",
  PARSE_ERROR: "Failed to parse the request data.",
  TIMEOUT: "The request timed out. Please try again.",
  TOO_MANY_REQUESTS: "Too many requests. Please wait and try again.",
};

/**
 * Get a user-friendly error description based on error code
 */
export function getErrorDescription(code: string): string {
  return (
    ERROR_DESCRIPTIONS[code] ||
    "An unexpected error occurred. Please try again."
  );
}
