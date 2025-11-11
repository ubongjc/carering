import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags:
 *       - System
 *     summary: Health check endpoint
 *     description: Returns the health status of the application and its dependencies
 *     responses:
 *       200:
 *         description: Application is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                     version:
 *                       type: string
 *                     database:
 *                       type: string
 *       503:
 *         description: Application is unhealthy
 */
export async function GET(request: NextRequest) {
  try {
    // Check database connection
    let databaseStatus = 'disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'connected';
    } catch (error) {
      console.error('Database health check failed:', error);
      databaseStatus = 'error';
    }

    const healthData = {
      status: databaseStatus === 'connected' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      database: databaseStatus,
      environment: process.env.NODE_ENV || 'development',
    };

    // Return 503 if database is not connected
    if (databaseStatus !== 'connected') {
      return errorResponse(
        'Service degraded: Database connection failed',
        503,
        'SERVICE_DEGRADED',
        healthData
      );
    }

    return successResponse(healthData);
  } catch (error) {
    console.error('Health check error:', error);
    return errorResponse(
      'Health check failed',
      503,
      'HEALTH_CHECK_FAILED',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
