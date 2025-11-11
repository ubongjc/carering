import { NextRequest } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';
import { requireAuth, checkCircleAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAppointmentSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { sanitizeInput } from '@/lib/security';

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

    // Validate request body
    const validatedData = createAppointmentSchema.parse(body);

    const hasAccess = await checkCircleAccess(authContext.userId, circleId, 'CAREGIVER');
    if (!hasAccess) {
      return forbiddenResponse('Insufficient permissions');
    }

    // Sanitize text inputs
    const sanitizedTitle = sanitizeInput(validatedData.title);
    const sanitizedDescription = validatedData.description ? sanitizeInput(validatedData.description) : undefined;
    const sanitizedLocation = validatedData.location ? sanitizeInput(validatedData.location) : undefined;
    const sanitizedProvider = validatedData.provider ? sanitizeInput(validatedData.provider) : undefined;
    const sanitizedNotes = validatedData.notes ? sanitizeInput(validatedData.notes) : undefined;

    const appointment = await prisma.appointment.create({
      data: {
        circleId,
        title: sanitizedTitle,
        description: sanitizedDescription,
        type: validatedData.type,
        startTime: new Date(validatedData.startTime),
        endTime: new Date(validatedData.endTime),
        location: sanitizedLocation,
        provider: sanitizedProvider,
        notes: sanitizedNotes,
        reminders: validatedData.reminders || [],
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

    if (error instanceof ZodError) {
      return validationErrorResponse('Invalid request data', error.issues);
    }

    console.error('Error creating appointment:', error);
    return errorResponse('Failed to create appointment', 500);
  }
}
