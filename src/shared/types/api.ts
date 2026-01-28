/**
 * API Response Types
 * Comprehensive type definitions for API responses following REST best practices
 *
 * For utility functions (type guards, response builders), see @/shared/lib/api-helpers
 */

// ============================================================================
// ENUM DEFINITIONS
// ============================================================================

/**
 * Standard HTTP-like status codes for API responses
 */
export enum ResponseStatus {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

// ============================================================================
// BASE RESPONSE TYPES
// ============================================================================

/**
 * Base response structure for all API responses
 */
export interface BaseResponse {
  /** Indicates if the request was successful */
  success: boolean;
  /** Human-readable message about the response */
  message: string;
  /** Timestamp when the response was generated */
  timestamp?: Date;
  /** Optional correlation ID for request tracing */
  correlationId?: string;
}

/**
 * Success response - returned when operation completes successfully
 */
export interface SuccessResponse<T> extends BaseResponse {
  success: true;
  message: string;
  /** The returned data payload */
  data: T;
  /** Optional metadata about the data */
  meta?: ResponseMetadata;
}

/**
 * Error response - returned when operation fails
 */
export interface ErrorResponse extends BaseResponse {
  success: false;
  message: string;
  /** Field-level validation errors */
  errors?: Record<string, string[]>;
  /** Error code for programmatic handling */
  code?: string;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Validation error response - specific error type for validation failures
 */
export interface ValidationErrorResponse extends ErrorResponse {
  code: "VALIDATION_ERROR";
  errors: Record<string, string[]>;
}

// ============================================================================
// RESPONSE METADATA
// ============================================================================

/**
 * Metadata about paginated responses
 */
export interface PaginationMeta {
  /** Current page number (1-indexed) */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  pages: number;
  /** Whether there are more pages */
  hasNextPage: boolean;
  /** Whether there are previous pages */
  hasPreviousPage: boolean;
}

/**
 * Metadata for list/array responses
 */
export interface ListMeta extends Partial<PaginationMeta> {
  /** Number of items returned in this response */
  count: number;
}

/**
 * General response metadata
 */
export interface ResponseMetadata {
  /** List metadata if applicable */
  list?: ListMeta;
  /** Pagination metadata if applicable */
  pagination?: PaginationMeta;
  /** Custom metadata */
  [key: string]: unknown;
}

// ============================================================================
// UNION RESPONSE TYPES
// ============================================================================

/**
 * Generic API response - can be success or error
 * Use type guards from @/shared/lib/api-helpers for type narrowing
 *
 * @example
 * import { isSuccessResponse } from "@/shared/lib/api-helpers";
 *
 * const response = await fetchData();
 * if (isSuccessResponse(response)) {
 *   console.log(response.data);
 * }
 */
export type ApiResponse<T = unknown> =
  | SuccessResponse<T>
  | ErrorResponse;

/**
 * Server action response - specifically for Next.js server actions
 * Narrower type for better type safety in action handlers
 */
export type ActionResponse<T = unknown> =
  | SuccessResponse<T>
  | ErrorResponse;

// ============================================================================
// PAGINATED RESPONSES
// ============================================================================

/**
 * Response for paginated list endpoints
 */
export interface PaginatedResponse<T> extends SuccessResponse<T[]> {
  meta: {
    pagination: PaginationMeta;
    count: number;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract the data type from a success response
 *
 * @example
 * type UserData = ExtractResponseData<typeof userResponse>;
 */
export type ExtractResponseData<T extends ApiResponse> = T extends SuccessResponse<
  infer U
>
  ? U
  : never;