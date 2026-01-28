/**
 * API Response Helpers
 * Utility functions for creating and validating API responses
 */

import type {
  ApiResponse,
  SuccessResponse,
  ErrorResponse,
  ValidationErrorResponse,
  ResponseMetadata,
} from "@/shared/types/api";

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if response is successful
 * @example
 * if (isSuccessResponse(response)) {
 *   console.log(response.data); // TypeScript knows data exists
 * }
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is SuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is an error
 * @example
 * if (isErrorResponse(response)) {
 *   console.log(response.errors); // TypeScript knows errors may exist
 * }
 */
export function isErrorResponse<T>(
  response: ApiResponse<T>
): response is ErrorResponse {
  return response.success === false;
}

/**
 * Type guard to check if error is a validation error
 * @example
 * if (isValidationError(error)) {
 *   showFieldErrors(error.errors); // TypeScript knows errors exist
 * }
 */
export function isValidationError(
  error: ErrorResponse
): error is ValidationErrorResponse {
  return error.code === "VALIDATION_ERROR" && Boolean(error.errors);
}

// ============================================================================
// RESPONSE BUILDERS
// ============================================================================

/**
 * Create a properly-typed success response
 *
 * @param data - The data payload to return
 * @param message - Human-readable success message (default: "Success")
 * @param meta - Optional metadata (pagination, etc)
 * @returns Success response object with correct types
 *
 * @example
 * const org = await db.organisasi.findUnique({ where: { id } });
 * return createSuccessResponse(org, "Organisasi berhasil diambil");
 */
export function createSuccessResponse<T>(
  data: T,
  message: string = "Success",
  meta?: ResponseMetadata
): SuccessResponse<T> {
  return {
    success: true,
    message,
    data,
    ...(meta && { meta }),
    timestamp: new Date(),
  };
}

/**
 * Create a properly-typed error response
 *
 * @param message - Human-readable error message
 * @param code - Error code for programmatic handling (NOT_FOUND, FORBIDDEN, etc)
 * @param errors - Field-level validation errors (if applicable)
 * @param details - Additional error context/debugging information
 * @returns Error response object with correct types
 *
 * @example
 * // Simple error
 * return createErrorResponse("Organisasi tidak ditemukan", "NOT_FOUND");
 *
 * @example
 * // With validation errors
 * return createErrorResponse(
 *   "Data tidak valid",
 *   "VALIDATION_ERROR",
 *   { nama: ["Nama sudah digunakan"], eselon: ["Eselon harus positif"] }
 * );
 *
 * @example
 * // With debugging details
 * return createErrorResponse(
 *   "Database error",
 *   "INTERNAL_ERROR",
 *   undefined,
 *   { originalError: error.message, userId: session.user.id }
 * );
 */
export function createErrorResponse(
  message: string,
  code?: string,
  errors?: Record<string, string[]>,
  details?: Record<string, unknown>
): ErrorResponse {
  return {
    success: false,
    message,
    ...(code && { code }),
    ...(errors && { errors }),
    ...(details && { details }),
    timestamp: new Date(),
  };
}

/**
 * Create a validation error response
 *
 * @param errors - Field-level validation errors
 * @param message - Human-readable error message (default: "Validation failed")
 * @returns Validation error response with correct types
 *
 * @example
 * try {
 *   const data = createOrganisasiSchema.parse(input);
 * } catch (error) {
 *   if (error instanceof z.ZodError) {
 *     return createValidationError(
 *       error.flatten().fieldErrors as Record<string, string[]>,
 *       "Data organisasi tidak valid"
 *     );
 *   }
 * }
 */
export function createValidationError(
  errors: Record<string, string[]>,
  message: string = "Validation failed"
): ValidationErrorResponse {
  return {
    success: false,
    message,
    code: "VALIDATION_ERROR",
    errors,
    timestamp: new Date(),
  };
}

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Check if a response is successful or an error (boolean version)
 * Useful when you just need to check success/failure without type narrowing
 *
 * @example
 * if (isSuccessful(response)) {
 *   // Do something
 * } else {
 *   logError(response.message);
 * }
 */
export function isSuccessful<T>(response: ApiResponse<T>): boolean {
  return response.success === true;
}

/**
 * Get error message from response (works for both success and error)
 *
 * @example
 * const message = getResponseMessage(response);
 * toast.show(message);
 */
export function getResponseMessage<T>(response: ApiResponse<T>): string {
  return response.message;
}

/**
 * Extract errors from response (safely handles missing errors)
 *
 * @example
 * const errors = getResponseErrors(response);
 * if (errors) {
 *   showFieldErrors(errors);
 * }
 */
export function getResponseErrors(
  response: ApiResponse
): Record<string, string[]> | undefined {
  if (isErrorResponse(response)) {
    return response.errors;
  }
  return undefined;
}
