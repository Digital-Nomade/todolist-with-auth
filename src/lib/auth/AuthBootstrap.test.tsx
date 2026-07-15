import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthBootstrap } from "./AuthBootstrap";
import { renderWithProviders } from "@/test/renderWithProviders";

const mocks = vi.hoisted(() => ({
  refreshSessionOnce: vi.fn(),
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    refreshSessionOnce: mocks.refreshSessionOnce,
  };
});

describe("AuthBootstrap", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the restoring state until initialization completes", () => {
    mocks.refreshSessionOnce.mockReturnValue(new Promise(() => undefined));

    renderWithProviders(
      createElement(AuthBootstrap, {}, createElement("p", null, "App content")),
    );

    expect(screen.getByText("Restoring your session…")).toBeInTheDocument();
    expect(screen.queryByText("App content")).not.toBeInTheDocument();
  });

  it("renders children after a failed refresh", async () => {
    mocks.refreshSessionOnce.mockResolvedValue(null);

    renderWithProviders(
      createElement(AuthBootstrap, {}, createElement("p", null, "App content")),
    );

    expect(await screen.findByText("App content")).toBeInTheDocument();
  });

  it("restores the active user into Redux", async () => {
    mocks.refreshSessionOnce.mockResolvedValue({
      accessToken: "access",
      expiresIn: 900,
      refreshToken: "refresh",
      user: {
        email: "person@example.com",
        id: "6fffb4d8-ae0a-42bc-8154-80a118b36644",
        status: "ACTIVE",
        username: "person",
      },
    });

    const { store } = renderWithProviders(
      createElement(AuthBootstrap, {}, createElement("p", null, "App content")),
    );

    await waitFor(() => {
      expect(store.getState().auth.isAuthenticated).toBe(true);
      expect(screen.getAllByText("App content").length).toBeGreaterThan(0);
    });
  });
});
