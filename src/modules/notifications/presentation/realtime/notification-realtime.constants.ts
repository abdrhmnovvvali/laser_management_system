export const NOTIFICATION_CREATED_EVENT = 'notification.created';

export const NOTIFICATIONS_ADMIN_ROOM = 'notifications:admins';

export function notificationsBranchRoom(branchId: string): string {
  return `notifications:branch:${branchId}`;
}
