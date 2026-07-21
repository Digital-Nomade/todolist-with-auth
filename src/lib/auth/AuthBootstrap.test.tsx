import { act, cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthBootstrap } from "./AuthBootstrap";
import { renderWithProviders } from "@/test/renderWithProviders";

const mocks = vi.hoisted(() => ({
  getAccessTokenExpiresAt: vi.fn(),
  refreshSessionOnce: vi.fn(),
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    refreshSessionOnce: mocks.refreshSessionOnce,
  };
});

vi.mock("@/lib/auth/session", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/session")>();
  return {
    ...actual,
    getAccessTokenExpiresAt: mocks.getAccessTokenExpiresAt,
  };
});

const activePayload = {
  accessToken: "access",
  expiresIn: 900,
  refreshToken: "refresh",
  user: {
    email: "person@example.com",
    id: "6fffb4d8-ae0a-42bc-8154-80a118b36644",
    status: "ACTIVE",
    username: "person",
  },
} as const;

describe("AuthBootstrap", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAccessTokenExpiresAt.mockReturnValue(null);
  });

  it("shows the restoring state until initialization completes", () => {
    mocks.refreshSessionOnce.mockReturnValue(new Promise(() => undefined));

    renderWithProviders(
      <AuthBootstrap><p>App content</p></AuthBootstrap>,
    );

    expect(screen.getByText("Restoring your session…")).toBeInTheDocument();
    expect(screen.queryByText("App content")).not.toBeInTheDocument();
  });

  it("renders children after a failed refresh", async () => {
    mocks.refreshSessionOnce.mockResolvedValue(null);

    renderWithProviders(
      <AuthBootstrap><p>App content</p></AuthBootstrap>,
    );

    expect(await screen.findByText("App content")).toBeInTheDocument();
  });

  it("restores the active user into Redux", async () => {
    mocks.refreshSessionOnce.mockResolvedValue(activePayload);

    const { store } = renderWithProviders(
      <AuthBootstrap><p>App content</p></AuthBootstrap>,
    );

    await waitFor(() => {
      expect(store.getState().auth.isAuthenticated).toBe(true);
      expect(screen.getAllByText("App content").length).toBeGreaterThan(0);
    });
  });

  it("rotates the session shortly before the access token expires", async () => {
    vi.useFakeTimers();
    try {
      const expiresAt = Date.now() + 10_000;
      mocks.getAccessTokenExpiresAt
        .mockReturnValueOnce(expiresAt)
        .mockReturnValueOnce(expiresAt)
        .mockReturnValue(null);
      mocks.refreshSessionOnce.mockResolvedValue(activePayload);

      renderWithProviders(
        <AuthBootstrap><p>App content</p></AuthBootstrap>,
      );
      await act(async () => {
        await Promise.resolve();
      });

      expect(mocks.refreshSessionOnce).toHaveBeenCalledOnce();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(9_000);
      });

      expect(mocks.refreshSessionOnce).toHaveBeenCalledTimes(2);
    } finally {
      cleanup();
      vi.useRealTimers();
    }
  });
});
