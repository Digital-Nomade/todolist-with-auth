import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ResetPasswordPage from "./page";

const mocks = vi.hoisted(() => ({
  resetPassword: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("@/lib/features/auth/authApi", () => ({
  useResetPasswordMutation: () => [mocks.resetPassword, { isLoading: false }],
}));

describe("reset-password page", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.searchParams = new URLSearchParams();
  });

  it("uses a generic reset-password error for rejected tokens", async () => {
    mocks.searchParams = new URLSearchParams("token=expired-token");
    mocks.resetPassword.mockReturnValue({
      unwrap: () => Promise.reject({ code: "TOKEN_EXPIRED", errors: [] }),
    });
    render(createElement(ResetPasswordPage));

    fireEvent.change(screen.getByLabelText("new password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("confirm password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));

    expect(await screen.findByText(
      "This reset link is invalid or has expired.",
    )).toBeInTheDocument();
  });
});
