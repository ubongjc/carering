import { NextRequest } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logMedicationSchema } from '@/lib/validations';
import { ZodError } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requireAuth();
    const { id: medicationId } = await context.params;
    const body = await request.json();

    const validatedData = logMedicationSchema.parse(body);

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
      return errorResponse('Access denied', 403, 'FORBIDDEN');
    }

    // Create log entry
    const log = await prisma.medicationLog.create({
      data: {
        medicationId,
        takenAt: new Date(validatedData.takenAt),
        takenBy: validatedData.takenBy || authContext.userId,
        notes: validatedData.notes,
        status: validatedData.status,
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        circleId: medication.carePlan.circle.id,
        userId: authContext.userId,
        type: 'MEDICATION_LOGGED',
        title: 'Medication logged',
        description: `${medication.name} - ${validatedData.status.toLowerCase()}`,
        data: {
          medicationId,
          medicationName: medication.name,
          status: validatedData.status,
        },
      },
    });

    return successResponse(log, 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    if (error instanceof ZodError) {
      return validationErrorResponse('Invalid request data', error.issues);
    }
    console.error('Error logging medication:', error);
    return errorResponse('Failed to log medication', 500);
  }
}
