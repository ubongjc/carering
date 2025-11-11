import { NextRequest } from 'next/server';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';
import { requireAuth, checkCircleAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requireAuth();
    const { id: circleId } = await context.params;
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const hasAccess = await checkCircleAccess(authContext.userId, circleId);
    if (!hasAccess) {
      return forbiddenResponse();
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        circleId,
        ...((from || to) && {
          startTime: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) }),
          },
        }),
      },
      orderBy: { startTime: 'asc' },
    });

    return successResponse(appointments);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('Error fetching appointments:', error);
    return errorResponse('Failed to fetch appointments', 500);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requireAuth();
    const { id: circleId } = await context.params;
    const body = await request.json();

    const hasAccess = await checkCircleAccess(authContext.userId, circleId, 'CAREGIVER');
    if (!hasAccess) {
      return forbiddenResponse('Insufficient permissions');
    }

    const appointment = await prisma.appointment.create({
      data: {
        circleId,
        title: body.title,
        description: body.description,
        type: body.type,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        location: body.location,
        provider: body.provider,
        notes: body.notes,
        reminders: body.reminders,
      },
    });

    await prisma.activity.create({
      data: {
        circleId,
        userId: authContext.userId,
        type: 'APPOINTMENT_SCHEDULED',
        title: 'Appointment scheduled',
        description: `${appointment.title} on ${appointment.startTime.toLocaleDateString()}`,
        data: { appointmentId: appointment.id },
      },
    });

    return successResponse(appointment, 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('Error creating appointment:', error);
    return errorResponse('Failed to create appointment', 500);
  }
}
