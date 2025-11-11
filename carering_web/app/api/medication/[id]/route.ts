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
import { updateMedicationSchema } from '@/lib/validations';
import { ZodError } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requireAuth();
    const { id } = await context.params;

    const medication = await prisma.medication.findUnique({
      where: { id },
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
        reminders: {
          orderBy: { time: 'asc' },
        },
        logs: {
          orderBy: { takenAt: 'desc' },
          take: 30,
        },
      },
    });

    if (!medication) {
      return notFoundResponse('Medication not found');
    }

    // Check if user has access to this medication's circle
    if (medication.carePlan.circle.members.length === 0) {
      return forbiddenResponse('You do not have access to this medication');
    }

    return successResponse(medication);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error fetching medication:', error);
    return errorResponse('Failed to fetch medication', 500);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requireAuth();
    const { id } = await context.params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateMedicationSchema.parse(body);

    // Get medication with circle info
    const existingMedication = await prisma.medication.findUnique({
      where: { id },
      include: {
        carePlan: {
          select: { circleId: true },
        },
      },
    });

    if (!existingMedication) {
      return notFoundResponse('Medication not found');
    }

    // Check access (requires at least CAREGIVER role)
    const membership = await prisma.circleMembership.findUnique({
      where: {
        circleId_userId: {
          circleId: existingMedication.carePlan.circleId,
          userId: authContext.userId,
        },
      },
    });

    if (!membership || !['OWNER', 'ADMIN', 'CAREGIVER'].includes(membership.role)) {
      return forbiddenResponse('Insufficient permissions');
    }

    // Build update data object
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.dosage !== undefined) updateData.dosage = validatedData.dosage;
    if (validatedData.frequency !== undefined) updateData.frequency = validatedData.frequency;
    if (validatedData.instructions !== undefined) updateData.instructions = validatedData.instructions;
    if (validatedData.imageUrl !== undefined) updateData.imageUrl = validatedData.imageUrl;
    if (validatedData.startDate !== undefined) updateData.startDate = new Date(validatedData.startDate);
    if (validatedData.endDate !== undefined) updateData.endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

    // Update medication
    const medication = await prisma.medication.update({
      where: { id },
      data: updateData,
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
        circleId: existingMedication.carePlan.circleId,
        userId: authContext.userId,
        type: 'MEDICATION_UPDATED',
        title: 'Medication updated',
        description: `${medication.name} has been updated`,
        data: { medicationId: medication.id, updates: Object.keys(updateData) },
      },
    });

    return successResponse(medication);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    if (error instanceof ZodError) {
      return validationErrorResponse('Invalid request data', error.issues);
    }

    console.error('Error updating medication:', error);
    return errorResponse('Failed to update medication', 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requireAuth();
    const { id } = await context.params;

    // Get medication with circle info
    const medication = await prisma.medication.findUnique({
      where: { id },
      include: {
        carePlan: {
          select: { circleId: true },
        },
      },
    });

    if (!medication) {
      return notFoundResponse('Medication not found');
    }

    // Check access (requires at least ADMIN role)
    const membership = await prisma.circleMembership.findUnique({
      where: {
        circleId_userId: {
          circleId: medication.carePlan.circleId,
          userId: authContext.userId,
        },
      },
    });

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return forbiddenResponse('Only owners and admins can delete medications');
    }

    await prisma.medication.delete({
      where: { id },
    });

    return successResponse({ message: 'Medication deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error deleting medication:', error);
    return errorResponse('Failed to delete medication', 500);
  }
}
