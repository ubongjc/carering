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

    const hasAccess = await checkCircleAccess(authContext.userId, circleId);
    if (!hasAccess) {
      return forbiddenResponse();
    }

    const message = await prisma.message.create({
      data: {
        circleId,
        senderId: authContext.userId,
        content: body.content,
        type: body.type || 'TEXT',
        attachments: body.attachments,
        replyToId: body.replyToId,
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
    console.error('Error sending message:', error);
    return errorResponse('Failed to send message', 500);
  }
}
