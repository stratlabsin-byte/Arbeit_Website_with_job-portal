import { prisma } from "./prisma";

/**
 * Log an audit event for compliance tracking.
 */
export async function logAudit(params: {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
}) {
  return prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details ? JSON.stringify(params.details) : null,
    },
  });
}
