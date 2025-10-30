import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateTaskSchema } from '@/lib/validation';
import {
  getAuthenticatedUserId,
  createErrorResponse,
  createSuccessResponse,
  parseRequestBody,
} from '@/lib/api-utils';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthenticatedUserId();
    const body = await parseRequestBody(request);
    const data = updateTaskSchema.parse(body);

    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!existingTask) {
      throw new Error('Not found');
    }

    // Prepare update data
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    if (data.objectiveId !== undefined) updateData.objectiveId = data.objectiveId;
    if (data.status !== undefined) {
      updateData.status = data.status;
      // Set completedAt when marking as complete
      if (data.status === 'COMPLETE' && existingTask.status !== 'COMPLETE') {
        updateData.completedAt = new Date();
      } else if (data.status !== 'COMPLETE') {
        updateData.completedAt = null;
      }
    }
    if (data.order !== undefined) updateData.order = data.order;

    const task = await prisma.task.update({
      where: {
        id: params.id,
      },
      data: updateData,
      include: {
        objective: {
          select: {
            id: true,
            title: true,
            color: true,
          },
        },
      },
    });

    return createSuccessResponse({ task });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthenticatedUserId();

    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!existingTask) {
      throw new Error('Not found');
    }

    await prisma.task.delete({
      where: {
        id: params.id,
      },
    });

    return createSuccessResponse({ success: true });
  } catch (error) {
    return createErrorResponse(error);
  }
}
