import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotificationIcon } from "./NotificaitonIcon";

describe("NotificationIcon", () => {
  it("uses the alert color when notifications are present", () => {
    const { container } = render(<NotificationIcon hasNotification />);
    expect(container.querySelector("circle")?.getAttribute("fill")).toBe("#F3434F");
  });

  it("uses the idle color when notifications are absent", () => {
    const { container } = render(<NotificationIcon hasNotification={false} />);
    expect(container.querySelector("circle")?.getAttribute("fill")).toBe("#EEB0B4");
  });
});
