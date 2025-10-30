import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTaskSchema } from '@/lib/validation';
import {
  getAuthenticatedUserId,
  createErrorResponse,
  createSuccessResponse,
  parseRequestBody,
} from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    const searchParams = request.nextUrl.searchParams;

    const status = searchParams.get('status');
    const objectiveId = searchParams.get('objectiveId');
    const dueDate = searchParams.get('dueDate');
    const includeCompleted = searchParams.get('includeCompleted') === 'true';

    // Build where clause
    const where: any = {
      userId,
    };

    if (status) {
      where.status = status;
    }

    if (objectiveId === 'null') {
      where.objectiveId = null;
    } else if (objectiveId) {
      where.objectiveId = objectiveId;
    }

    if (!includeCompleted) {
      where.status = { not: 'COMPLETE' };
    }

    // Handle date filtering
    if (dueDate === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      where.dueDate = {
        gte: today,
        lt: tomorrow,
      };
    } else if (dueDate === 'week') {
      const today = new Date();
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);

      where.dueDate = {
        gte: today,
        lte: weekEnd,
      };
    } else if (dueDate === 'overdue') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      where.dueDate = {
        lt: today,
      };
      where.status = { not: 'COMPLETE' };
    } else if (dueDate === 'none') {
      where.dueDate = null;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        objective: {
          select: {
            id: true,
            title: true,
            color: true,
          },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return createSuccessResponse({ tasks, total: tasks.length });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    const body = await parseRequestBody(request);
    const data = createTaskSchema.parse(body);

    // Get the next order value
    const maxOrderTask = await prisma.task.findFirst({
      where: { userId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const task = await prisma.task.create({
      data: {
        userId,
        title: data.title,
        notes: data.notes || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        objectiveId: data.objectiveId || null,
        status: data.status || 'NOT_STARTED',
        order: (maxOrderTask?.order ?? -1) + 1,
      },
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
