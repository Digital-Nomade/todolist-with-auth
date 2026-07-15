import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ForgotPassword from "./page";

const mocks = vi.hoisted(() => ({
  requestReset: vi.fn(),
}));

vi.mock("@/lib/features/auth/authApi", () => ({
  useRequestPasswordResetMutation: () => [mocks.requestReset, { isLoading: false }],
}));

describe("forgot-password page", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the same forgot-password result when the API rejects", async () => {
    mocks.requestReset.mockReturnValue({
      unwrap: () => Promise.reject(new Error("unknown account")),
    });
    render(createElement(ForgotPassword));

    fireEvent.change(screen.getByLabelText("email"), {
      target: { value: "unknown@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(await screen.findByText(
      "If an account exists for that email, a password reset link has been sent.",
    )).toBeInTheDocument();
  });
});
