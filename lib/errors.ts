export enum ErrorCode {
  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  
  // Authentication errors
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",
  
  // Resource errors
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  CONFLICT = "CONFLICT",
  
  // Business logic errors
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  INVALID_STATE = "INVALID_STATE",
  OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED",
  
  // Rate limiting
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
  
  // Server errors
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  DATABASE_ERROR = "DATABASE_ERROR",
}

export interface ErrorDetail {
  field?: string
  message: string
  code?: string
}

export interface ApiError {
  error: {
    code: ErrorCode
    message: string
    details?: ErrorDetail[]
  }
  timestamp: string
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 400,
    public details?: ErrorDetail[]
  ) {
    super(message)
    this.name = "AppError"
  }

  toJSON(): ApiError {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
      timestamp: new Date().toISOString(),
    }
  }
}

export function createErrorResponse(
  code: ErrorCode,
  message: string,
  statusCode: number = 400,
  details?: ErrorDetail[]
): Response {
  const error: ApiError = {
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  }

  return Response.json(error, { status: statusCode })
}

export function handleError(error: unknown): Response {
  if (error instanceof AppError) {
    return createErrorResponse(
      error.code,
      error.message,
      error.statusCode,
      error.details
    )
  }

  if (error instanceof Error) {
    console.error("Unhandled error:", error)
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "An unexpected error occurred",
      500
    )
  }

  return createErrorResponse(
    ErrorCode.INTERNAL_ERROR,
    "An unknown error occurred",
    500
  )
}

// Common error creators
export const Errors = {
  unauthorized: (message = "Unauthorized") =>
    new AppError(ErrorCode.UNAUTHORIZED, message, 401),
  
  forbidden: (message = "Forbidden") =>
    new AppError(ErrorCode.FORBIDDEN, message, 403),
  
  notFound: (resource = "Resource") =>
    new AppError(ErrorCode.NOT_FOUND, `${resource} not found`, 404),
  
  validation: (message: string, details?: ErrorDetail[]) =>
    new AppError(ErrorCode.VALIDATION_ERROR, message, 400, details),
  
  conflict: (message: string) =>
    new AppError(ErrorCode.CONFLICT, message, 409),
  
  tooManyRequests: (message = "Too many requests") =>
    new AppError(ErrorCode.TOO_MANY_REQUESTS, message, 429),
}
