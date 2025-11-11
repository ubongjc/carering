import { NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createCircleSchema } from '@/lib/validations';
import { ZodError } from 'zod';

/**
 * @openapi
 * /api/circle:
 *   get:
 *     tags:
 *       - Circles
 *     summary: List all circles for the authenticated user
 *     description: Returns all circles where the user is a member
 *     security:
 *       - ClerkAuth: []
 *     responses:
 *       200:
 *         description: List of circles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: NextRequest) {
  try {
    const authContext = await requireAuth();

    const circles = await prisma.circle.findMany({
      where: {
        members: {
          some: {
            userId: authContext.userId,
          },
        },
      },
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
        _count: {
          select: {
            carePlans: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(circles);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error fetching circles:', error);
    return errorResponse(
      'Failed to fetch circles',
      500,
      'FETCH_FAILED',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * @openapi
 * /api/circle:
 *   post:
 *     tags:
 *       - Circles
 *     summary: Create a new circle
 *     description: Creates a new care circle with the authenticated user as owner
 *     security:
 *       - ClerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Circle created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: NextRequest) {
  try {
    const authContext = await requireAuth();
    const body = await request.json();

    // Validate request body
    const validatedData = createCircleSchema.parse(body);

    // Check if user exists, create if not
    let user = await prisma.user.findUnique({
      where: { id: authContext.userId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: authContext.userId,
          email: authContext.email || '',
        },
      });
    }

    // Create circle with the user as owner
    const circle = await prisma.circle.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        creatorId: authContext.userId,
        members: {
          create: {
            userId: authContext.userId,
            role: 'OWNER',
          },
        },
      },
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
        action: 'CIRCLE_CREATED',
        entityType: 'Circle',
        entityId: circle.id,
        metadata: {
          circleName: circle.name,
        },
      },
    });

    return successResponse(circle, 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    if (error instanceof ZodError) {
      return validationErrorResponse('Invalid request data', error.errors);
    }

    console.error('Error creating circle:', error);
    return errorResponse(
      'Failed to create circle',
      500,
      'CREATE_FAILED',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
