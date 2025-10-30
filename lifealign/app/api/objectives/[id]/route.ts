import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateObjectiveSchema } from '@/lib/validation';
import {
  getAuthenticatedUserId,
  createErrorResponse,
  createSuccessResponse,
  parseRequestBody,
} from '@/lib/api-utils';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthenticatedUserId();

    const objective = await prisma.objective.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        tasks: {
          orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (!objective) {
      throw new Error('Not found');
    }

    return createSuccessResponse({ objective });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthenticatedUserId();
    const body = await parseRequestBody(request);
    const data = updateObjectiveSchema.parse(body);

    // Verify objective belongs to user
    const existingObjective = await prisma.objective.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!existingObjective) {
      throw new Error('Not found');
    }

    // Prepare update data
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.targetDate !== undefined) updateData.targetDate = new Date(data.targetDate);
    if (data.status !== undefined) updateData.status = data.status;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.order !== undefined) updateData.order = data.order;

    const objective = await prisma.objective.update({
      where: {
        id: params.id,
      },
      data: updateData,
    });

    return createSuccessResponse({ objective });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getAuthenticatedUserId();

    // Verify objective belongs to user
    const existingObjective = await prisma.objective.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!existingObjective) {
      throw new Error('Not found');
    }

    // Note: Tasks will have their objectiveId set to null due to onDelete: SetNull
    await prisma.objective.delete({
      where: {
        id: params.id,
      },
    });

    return createSuccessResponse({ success: true });
  } catch (error) {
    return createErrorResponse(error);
  }
}
