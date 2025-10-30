import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createObjectiveSchema } from '@/lib/validation';
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

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    const objectives = await prisma.objective.findMany({
      where,
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
        tasks: {
          where: {
            status: 'COMPLETE',
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    // Format response with task counts
    const objectivesWithCounts = objectives.map((objective) => ({
      ...objective,
      taskCount: objective._count.tasks,
      completedTaskCount: objective.tasks.length,
      tasks: undefined,
      _count: undefined,
    }));

    return createSuccessResponse({ objectives: objectivesWithCounts });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    const body = await parseRequestBody(request);
    const data = createObjectiveSchema.parse(body);

    // Check max active objectives constraint (5 active max)
    const activeCount = await prisma.objective.count({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    if (activeCount >= 5) {
      return createErrorResponse(
        new Error('Maximum 5 active objectives allowed. Please complete or archive an existing objective.'),
        400
      );
    }

    // Get the next order value
    const maxOrderObjective = await prisma.objective.findFirst({
      where: { userId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const objective = await prisma.objective.create({
      data: {
        userId,
        title: data.title,
        description: data.description || null,
        startDate: new Date(data.startDate),
        targetDate: new Date(data.targetDate),
        color: data.color || '#3b82f6',
        order: (maxOrderObjective?.order ?? -1) + 1,
      },
    });

    return createSuccessResponse({ objective });
  } catch (error) {
    return createErrorResponse(error);
  }
}
