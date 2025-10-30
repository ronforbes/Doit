import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bulkUpdateTasksSchema } from '@/lib/validation';
import {
  getAuthenticatedUserId,
  createErrorResponse,
  createSuccessResponse,
  parseRequestBody,
} from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    const body = await parseRequestBody(request);
    const { updates } = bulkUpdateTasksSchema.parse(body);

    // Verify all tasks belong to user
    const taskIds = updates.map((u) => u.id);
    const userTasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
        userId,
      },
      select: { id: true },
    });

    if (userTasks.length !== taskIds.length) {
      throw new Error('Some tasks not found or unauthorized');
    }

    // Update tasks in a transaction
    await prisma.$transaction(
      updates.map((update) =>
        prisma.task.update({
          where: { id: update.id },
          data: { order: update.order },
        })
      )
    );

    return createSuccessResponse({ updated: updates.length });
  } catch (error) {
    return createErrorResponse(error);
  }
}
