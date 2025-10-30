import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateProfileSchema } from '@/lib/validation';
import {
  getAuthenticatedUserId,
  createErrorResponse,
  createSuccessResponse,
  parseRequestBody,
} from '@/lib/api-utils';

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('Not found');
    }

    return createSuccessResponse({ user });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    const body = await parseRequestBody(request);
    const data = updateProfileSchema.parse(body);

    const updateData: any = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.preferences !== undefined) {
      // Merge with existing preferences
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true },
      });

      updateData.preferences = {
        ...(existingUser?.preferences as object),
        ...data.preferences,
      };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        preferences: true,
        updatedAt: true,
      },
    });

    return createSuccessResponse({ user });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE() {
  try {
    const userId = await getAuthenticatedUserId();

    await prisma.user.delete({
      where: { id: userId },
    });

    return createSuccessResponse({ success: true });
  } catch (error) {
    return createErrorResponse(error);
  }
}
