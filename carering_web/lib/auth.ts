import { auth } from '@clerk/nextjs/server';
import { prisma } from './prisma';
import { CircleRole } from '@prisma/client';

export interface AuthContext {
  userId: string;
  email: string | null;
}

/**
 * Get the authenticated user context from Clerk
 * @throws Error if user is not authenticated
 */
export async function requireAuth(): Promise<AuthContext> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return {
    userId,
    email: null, // Can be populated from Clerk user object if needed
  };
}

/**
 * Check if user has access to a specific circle
 */
export async function checkCircleAccess(
  userId: string,
  circleId: string,
  requiredRole?: CircleRole
): Promise<boolean> {
  const membership = await prisma.circleMembership.findUnique({
    where: {
      circleId_userId: {
        circleId,
        userId,
      },
    },
  });

  if (!membership) {
    return false;
  }

  if (!requiredRole) {
    return true;
  }

  // Role hierarchy: OWNER > ADMIN > CAREGIVER > FAMILY_MEMBER > VIEWER
  const roleHierarchy: Record<CircleRole, number> = {
    OWNER: 5,
    ADMIN: 4,
    CAREGIVER: 3,
    FAMILY_MEMBER: 2,
    VIEWER: 1,
  };

  return roleHierarchy[membership.role] >= roleHierarchy[requiredRole];
}

/**
 * Require circle access or throw error
 */
export async function requireCircleAccess(
  userId: string,
  circleId: string,
  requiredRole?: CircleRole
): Promise<void> {
  const hasAccess = await checkCircleAccess(userId, circleId, requiredRole);

  if (!hasAccess) {
    throw new Error(requiredRole ? 'Insufficient permissions' : 'Access denied');
  }
}

/**
 * Check ABAC (Attribute-Based Access Control) permission
 * This is a simplified implementation - expand based on your needs
 */
export async function checkPermission(
  userId: string,
  circleId: string,
  permission: string
): Promise<boolean> {
  const membership = await prisma.circleMembership.findUnique({
    where: {
      circleId_userId: {
        circleId,
        userId,
      },
    },
  });

  if (!membership) {
    return false;
  }

  // Check custom permissions in the JSON field
  const permissions = membership.permissions as Record<string, boolean> | null;
  if (permissions && permission in permissions) {
    return permissions[permission] === true;
  }

  // Default permissions based on role
  const defaultPermissions: Record<CircleRole, string[]> = {
    OWNER: ['*'], // All permissions
    ADMIN: [
      'circle.manage',
      'members.invite',
      'members.remove',
      'careplan.create',
      'careplan.edit',
      'careplan.delete',
      'medication.manage',
      'task.manage',
      'vitals.view',
      'vitals.add',
    ],
    CAREGIVER: [
      'careplan.view',
      'medication.log',
      'task.manage',
      'vitals.view',
      'vitals.add',
    ],
    FAMILY_MEMBER: [
      'careplan.view',
      'vitals.view',
      'vitals.add',
      'task.view',
    ],
    VIEWER: ['careplan.view', 'vitals.view', 'task.view'],
  };

  const rolePermissions = defaultPermissions[membership.role] || [];
  return rolePermissions.includes('*') || rolePermissions.includes(permission);
}
