import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
  timestamp?: string;
}

export function createSuccessResponse<T>(
  data: T, 
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  }, { status });
}

export function createErrorResponse(
  error: string | string[],
  status: number = 400,
  message?: string
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    timestamp: new Date().toISOString()
  };

  if (Array.isArray(error)) {
    response.errors = error;
    response.error = error[0]; // Primary error
  } else {
    response.error = error;
  }

  if (message) {
    response.message = message;
  }

  return NextResponse.json(response, { status });
}

// Common HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;