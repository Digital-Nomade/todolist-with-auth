import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { NotificaitonMenu } from "./NotificationMenu";
import { renderWithProviders } from "@/test/renderWithProviders";

describe("NotificaitonMenu", () => {
  afterEach(cleanup);

  it("renders seeded notifications", () => {
    renderWithProviders(<NotificaitonMenu />);

    expect(screen.getByText("Notification 1")).toBeInTheDocument();
    expect(screen.getByText("Notification 4")).toBeInTheDocument();
  });

  it("dispatches when a notification is clicked", () => {
    const { store } = renderWithProviders(<NotificaitonMenu />);

    fireEvent.click(screen.getAllByRole("button")[0]);

    expect(store.getState().notification.notifications[0].isViewed).toBe(false);
  });
});
