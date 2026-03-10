import { prisma } from "./prisma";

// All granular permissions for CLIENT_USER RBAC
export const PERMISSIONS = {
  VIEW_REQUISITIONS: "VIEW_REQUISITIONS",
  CREATE_REQUISITIONS: "CREATE_REQUISITIONS",
  EDIT_REQUISITIONS: "EDIT_REQUISITIONS",
  CLOSE_REQUISITIONS: "CLOSE_REQUISITIONS",
  VIEW_CANDIDATES: "VIEW_CANDIDATES",
  REVIEW_CANDIDATES: "REVIEW_CANDIDATES",
  APPROVE_CANDIDATES: "APPROVE_CANDIDATES",
  REJECT_CANDIDATES: "REJECT_CANDIDATES",
  VIEW_INTERVIEWS: "VIEW_INTERVIEWS",
  SCHEDULE_INTERVIEWS: "SCHEDULE_INTERVIEWS",
  VIEW_CVS: "VIEW_CVS",
  DOWNLOAD_CVS: "DOWNLOAD_CVS",
  VIEW_REPORTS: "VIEW_REPORTS",
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_ROLES: "MANAGE_ROLES",
  VIEW_AUDIT_LOG: "VIEW_AUDIT_LOG",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Default role templates for new clients
export const DEFAULT_CLIENT_ROLES = {
  "Hiring Manager": [
    PERMISSIONS.VIEW_REQUISITIONS,
    PERMISSIONS.CREATE_REQUISITIONS,
    PERMISSIONS.VIEW_CANDIDATES,
    PERMISSIONS.REVIEW_CANDIDATES,
    PERMISSIONS.APPROVE_CANDIDATES,
    PERMISSIONS.REJECT_CANDIDATES,
    PERMISSIONS.VIEW_INTERVIEWS,
    PERMISSIONS.SCHEDULE_INTERVIEWS,
    PERMISSIONS.VIEW_CVS,
  ],
  Interviewer: [
    PERMISSIONS.VIEW_REQUISITIONS,
    PERMISSIONS.VIEW_CANDIDATES,
    PERMISSIONS.VIEW_INTERVIEWS,
    PERMISSIONS.VIEW_CVS,
  ],
  "Client Admin": Object.values(PERMISSIONS),
};

/**
 * Check if a user has a specific permission.
 * ADMIN and RECRUITER always have all permissions.
 * CLIENT_USER permissions come from their assigned ClientRole.
 */
export async function hasPermission(
  userId: string,
  role: string,
  permission: Permission
): Promise<boolean> {
  // Admin and Recruiter bypass RBAC
  if (role === "ADMIN" || role === "RECRUITER") {
    return true;
  }

  if (role !== "CLIENT_USER") {
    return false;
  }

  // Load client user's role and permissions
  const clientUser = await prisma.clientUserProfile.findUnique({
    where: { userId },
    include: { clientRole: true },
  });

  if (!clientUser?.clientRole) {
    return false;
  }

  const permissions: string[] = JSON.parse(clientUser.clientRole.permissions);
  return permissions.includes(permission);
}

/**
 * Get all permissions for a user.
 */
export async function getUserPermissions(
  userId: string,
  role: string
): Promise<Permission[]> {
  if (role === "ADMIN" || role === "RECRUITER") {
    return Object.values(PERMISSIONS);
  }

  if (role !== "CLIENT_USER") {
    return [];
  }

  const clientUser = await prisma.clientUserProfile.findUnique({
    where: { userId },
    include: { clientRole: true },
  });

  if (!clientUser?.clientRole) {
    return [];
  }

  return JSON.parse(clientUser.clientRole.permissions);
}
