import { describe, expect, it } from "vitest";
import notificationReducer, {
  checkIfHasNotification,
  viewNotification,
} from "./notificationsSlice";

describe("notificationsSlice", () => {
  it("marks a notification as viewed", () => {
    const initial = notificationReducer(undefined, { type: "@@INIT" });
    const firstId = initial.notifications[0].id;

    const next = notificationReducer(
      initial,
      viewNotification({ notificationID: firstId }),
    );

    expect(next.notifications[0].isViewed).toBe(true);
    expect(next.notifications[0].viewedIn).toBeInstanceOf(Date);
  });

  it("exposes the checkIfHasNotification reducer without throwing", () => {
    const initial = notificationReducer(undefined, { type: "@@INIT" });

    expect(() => notificationReducer(initial, checkIfHasNotification())).not.toThrow();
  });
});
