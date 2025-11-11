import { NextRequest } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';
import { requireAuth, checkCircleAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createMessageSchema } from '@/lib/validations';
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before');

    const hasAccess = await checkCircleAccess(authContext.userId, circleId);
    if (!hasAccess) {
      return forbiddenResponse();
    }

    const messages = await prisma.message.findMany({
      where: {
        circleId,
        ...(before && { createdAt: { lt: new Date(before) } }),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return successResponse(messages.reverse());
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('Error fetching messages:', error);
    return errorResponse('Failed to fetch messages', 500);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requireAuth();
    const { id: circleId } = await context.params;
    const body = await request.json();

    // Validate request body
    const validatedData = createMessageSchema.parse(body);

    const hasAccess = await checkCircleAccess(authContext.userId, circleId);
    if (!hasAccess) {
      return forbiddenResponse();
    }

    // Sanitize content
    const sanitizedContent = sanitizeInput(validatedData.content);

    const message = await prisma.message.create({
      data: {
        circleId,
        senderId: authContext.userId,
        content: sanitizedContent,
        type: validatedData.type,
        attachments: validatedData.attachments || [],
        replyToId: validatedData.replyToId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // TODO: Broadcast via WebSocket

    return successResponse(message, 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    if (error instanceof ZodError) {
      return validationErrorResponse('Invalid request data', error.issues);
    }

    console.error('Error sending message:', error);
    return errorResponse('Failed to send message', 500);
  }
}
