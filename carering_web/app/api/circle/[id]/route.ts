import { NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api-response';
import { requireAuth, checkCircleAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateCircleSchema } from '@/lib/validations';
import { ZodError } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * @openapi
 * /api/circle/{id}:
 *   get:
 *     tags:
 *       - Circles
 *     summary: Get a specific circle
 *     description: Returns details of a specific circle
 *     security:
 *       - ClerkAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Circle details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Circle not found
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requireAuth();
    const { id } = await context.params;

    // Check circle access
    const hasAccess = await checkCircleAccess(authContext.userId, id);
    if (!hasAccess) {
      return forbiddenResponse('You do not have access to this circle');
    }

    const circle = await prisma.circle.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
        carePlans: {
          where: {
            status: 'ACTIVE',
          },
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!circle) {
      return notFoundResponse('Circle not found');
    }

    return successResponse(circle);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error fetching circle:', error);
    return errorResponse(
      'Failed to fetch circle',
      500,
      'FETCH_FAILED',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * @openapi
 * /api/circle/{id}:
 *   patch:
 *     tags:
 *       - Circles
 *     summary: Update a circle
 *     description: Updates circle details (requires ADMIN or OWNER role)
 *     security:
 *       - ClerkAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Circle updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Circle not found
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requireAuth();
    const { id } = await context.params;
    const body = await request.json();

    // Check admin access
    const hasAccess = await checkCircleAccess(authContext.userId, id, 'ADMIN');
    if (!hasAccess) {
      return forbiddenResponse('You do not have permission to update this circle');
    }

    // Validate request body
    const validatedData = updateCircleSchema.parse(body);

    const circle = await prisma.circle.update({
      where: { id },
      data: validatedData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: authContext.userId,
        action: 'CIRCLE_UPDATED',
        entityType: 'Circle',
        entityId: circle.id,
        metadata: {
          updates: validatedData,
        },
      },
    });

    return successResponse(circle);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    if (error instanceof ZodError) {
      return validationErrorResponse('Invalid request data', error.issues);
    }

    console.error('Error updating circle:', error);
    return errorResponse(
      'Failed to update circle',
      500,
      'UPDATE_FAILED',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * @openapi
 * /api/circle/{id}:
 *   delete:
 *     tags:
 *       - Circles
 *     summary: Delete a circle
 *     description: Deletes a circle (requires OWNER role)
 *     security:
 *       - ClerkAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Circle deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Circle not found
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requireAuth();
    const { id } = await context.params;

    // Check owner access
    const hasAccess = await checkCircleAccess(authContext.userId, id, 'OWNER');
    if (!hasAccess) {
      return forbiddenResponse('Only the circle owner can delete the circle');
    }

    await prisma.circle.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: authContext.userId,
        action: 'CIRCLE_DELETED',
        entityType: 'Circle',
        entityId: id,
      },
    });

    return successResponse({ message: 'Circle deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error deleting circle:', error);
    return errorResponse(
      'Failed to delete circle',
      500,
      'DELETE_FAILED',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
