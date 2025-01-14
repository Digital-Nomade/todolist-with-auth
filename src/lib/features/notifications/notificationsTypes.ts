import { Notification } from "@/types/Notification.type";

export interface NotificationsInitialState {
  notifications: Notification[],
  hasNotifications: boolean,
}
