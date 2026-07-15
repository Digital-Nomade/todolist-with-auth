import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChangePasswordPage from "./page";

const mocks = vi.hoisted(() => ({
  changePassword: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, push: vi.fn() }),
}));

vi.mock("@/lib/features/auth/authApi", () => ({
  useChangePasswordMutation: () => [mocks.changePassword, { isLoading: false }],
}));

describe("change-password page", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends current and new passwords then redirects to login", async () => {
    mocks.changePassword.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    render(createElement(ChangePasswordPage));
    fireEvent.change(screen.getByLabelText("current password"), {
      target: { value: "current-password" },
    });
    fireEvent.change(screen.getByLabelText("new password"), {
      target: { value: "new-password" },
    });
    fireEvent.change(screen.getByLabelText("confirm new password"), {
      target: { value: "new-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /change password/i }));

    await waitFor(() => expect(mocks.changePassword).toHaveBeenCalledWith({
      currentPassword: "current-password",
      newPassword: "new-password",
    }));
    expect(mocks.replace).toHaveBeenCalledWith("/login");
  });
});
