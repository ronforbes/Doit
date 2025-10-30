import { auth } from './auth';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return session.user.id;
}

export function createErrorResponse(error: unknown, status: number = 500): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors,
        },
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    if (error.message === 'Not found') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Resource not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Internal server error',
        },
      },
      { status }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error',
      },
    },
    { status: 500 }
  );
}

export function createSuccessResponse<T>(data: T, meta?: Record<string, any>): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    ...(meta && { meta }),
  });
}

export async function parseRequestBody(request: NextRequest): Promise<any> {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON body');
  }
}
