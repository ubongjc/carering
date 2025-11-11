import { NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from '@/lib/api-response';
import { requireAuth, requireCircleAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createMedicationSchema } from '@/lib/validations';
import { ZodError } from 'zod';

/**
 * @openapi
 * /api/medication:
 *   post:
 *     tags:
 *       - Medications
 *     summary: Create a new medication
 *     security:
 *       - ClerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - carePlanId
 *               - name
 *               - dosage
 *               - frequency
 *               - startDate
 *             properties:
 *               carePlanId:
 *                 type: string
 *               name:
 *                 type: string
 *               dosage:
 *                 type: string
 *               frequency:
 *                 type: string
 *               instructions:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Medication created successfully
 */
export async function POST(request: NextRequest) {
  try {
    const authContext = await requireAuth();
    const body = await request.json();

    // Validate request body
    const validatedData = createMedicationSchema.parse(body);

    // Get care plan to verify circle access
    const carePlan = await prisma.carePlan.findUnique({
      where: { id: validatedData.carePlanId },
      select: { circleId: true },
    });

    if (!carePlan) {
      return errorResponse('Care plan not found', 404, 'NOT_FOUND');
    }

    // Check circle access
    await requireCircleAccess(authContext.userId, carePlan.circleId, 'CAREGIVER');

    // Create medication
    const medication = await prisma.medication.create({
      data: {
        carePlanId: validatedData.carePlanId,
        name: validatedData.name,
        dosage: validatedData.dosage,
        frequency: validatedData.frequency,
        instructions: validatedData.instructions,
        imageUrl: validatedData.imageUrl,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      },
      include: {
        reminders: true,
        logs: {
          orderBy: { takenAt: 'desc' },
          take: 5,
        },
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        circleId: carePlan.circleId,
        userId: authContext.userId,
        type: 'MEDICATION_LOGGED',
        title: 'Medication added',
        description: `${medication.name} has been added to the care plan`,
        data: {
          medicationId: medication.id,
          medicationName: medication.name,
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: authContext.userId,
        action: 'MEDICATION_CREATED',
        entityType: 'Medication',
        entityId: medication.id,
        metadata: {
          medicationName: medication.name,
          carePlanId: carePlan.circleId,
        },
      },
    });

    return successResponse(medication, 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse('Access denied', 403, 'FORBIDDEN');
    }

    if (error instanceof ZodError) {
      return validationErrorResponse('Invalid request data', error.issues);
    }

    console.error('Error creating medication:', error);
    return errorResponse(
      'Failed to create medication',
      500,
      'CREATE_FAILED',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
