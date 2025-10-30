import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId, createErrorResponse, createSuccessResponse } from '@/lib/api-utils';

export async function POST() {
  try {
    const userId = await getAuthenticatedUserId();

    const [tasks, objectives] = await Promise.all([
      prisma.task.findMany({
        where: { userId },
        include: {
          objective: {
            select: {
              title: true,
            },
          },
        },
      }),
      prisma.objective.findMany({
        where: { userId },
      }),
    ]);

    const exportData = {
      tasks,
      objectives,
      exportedAt: new Date().toISOString(),
    };

    return createSuccessResponse({ data: exportData });
  } catch (error) {
    return createErrorResponse(error);
  }
}
