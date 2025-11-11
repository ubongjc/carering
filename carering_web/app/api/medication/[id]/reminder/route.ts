import { NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createMedicationReminderSchema } from '@/lib/validations';
import { ZodError } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requireAuth();
    const { id: medicationId } = await context.params;
    const body = await request.json();

    // Validate request body
    const validatedData = createMedicationReminderSchema.parse(body);

    // Verify medication exists and user has access
    const medication = await prisma.medication.findUnique({
      where: { id: medicationId },
      include: {
        carePlan: {
          include: {
            circle: {
              include: {
                members: {
                  where: { userId: authContext.userId },
                },
              },
            },
          },
        },
      },
    });

    if (!medication) {
      return notFoundResponse('Medication not found');
    }

    if (medication.carePlan.circle.members.length === 0) {
      return forbiddenResponse('You do not have access to this medication');
    }

    // Check if user has at least CAREGIVER role
    const membership = medication.carePlan.circle.members[0];
    if (!['OWNER', 'ADMIN', 'CAREGIVER'].includes(membership.role)) {
      return forbiddenResponse('Insufficient permissions to create reminders');
    }

    // Create reminder
    const reminder = await prisma.medicationReminder.create({
      data: {
        medicationId,
        time: validatedData.time,
        daysOfWeek: validatedData.daysOfWeek,
        enabled: validatedData.enabled,
        snoozeMinutes: validatedData.snoozeMinutes,
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        circleId: medication.carePlan.circle.id,
        userId: authContext.userId,
        type: 'MEDICATION_LOGGED',
        title: 'Reminder created',
        description: `Reminder set for ${medication.name} at ${validatedData.time}`,
        data: {
          medicationId,
          medicationName: medication.name,
          reminderTime: validatedData.time,
        },
      },
    });

    return successResponse(reminder, 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    if (error instanceof ZodError) {
      return validationErrorResponse('Invalid request data', error.issues);
    }

    console.error('Error creating reminder:', error);
    return errorResponse('Failed to create reminder', 500);
  }
}
