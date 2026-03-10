import { prisma } from "./prisma";

/**
 * Create an in-app notification for a user.
 */
export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type?: string;
  linkUrl?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || "INFO",
      linkUrl: params.linkUrl,
    },
  });
}

/**
 * Create notifications for multiple users at once.
 */
export async function createBulkNotifications(params: {
  userIds: string[];
  title: string;
  message: string;
  type?: string;
  linkUrl?: string;
}) {
  return prisma.notification.createMany({
    data: params.userIds.map((userId) => ({
      userId,
      title: params.title,
      message: params.message,
      type: params.type || "INFO",
      linkUrl: params.linkUrl,
    })),
  });
}
