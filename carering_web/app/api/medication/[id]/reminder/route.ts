import { NextRequest } from 'next/server';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requireAuth();
    const { id: medicationId } = await context.params;
    const body = await request.json();

    const reminder = await prisma.medicationReminder.create({
      data: {
        medicationId,
        time: body.time,
        daysOfWeek: body.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
        enabled: body.enabled !== undefined ? body.enabled : true,
        snoozeMinutes: body.snoozeMinutes || 15,
      },
    });

    return successResponse(reminder, 201);
  } catch (error) {
    console.error('Error creating reminder:', error);
    return errorResponse('Failed to create reminder', 500);
  }
}
