import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, push: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/features/auth/authApi", () => ({
  useLoginUserMutation: () => [mocks.login, { isLoading: false }],
}));

describe("login page", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects active users to home", async () => {
    mocks.login.mockReturnValue({
      unwrap: () => Promise.resolve({
        accessToken: "access",
        expiresIn: 900,
        refreshToken: "refresh",
        user: {
          email: "person@example.com",
          id: "6fffb4d8-ae0a-42bc-8154-80a118b36644",
          status: "ACTIVE",
          username: "person",
        },
      }),
    });

    render(createElement(LoginPage));
    fireEvent.change(screen.getByLabelText("email or username"), {
      target: { value: "person" },
    });
    fireEvent.change(screen.getByLabelText("password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/home"));
  });

  it("shows a safe error for failed login", async () => {
    mocks.login.mockReturnValue({
      unwrap: () => Promise.reject({ data: { code: "INVALID_CREDENTIALS" } }),
    });

    render(createElement(LoginPage));
    fireEvent.change(screen.getByLabelText("email or username"), {
      target: { value: "person" },
    });
    fireEvent.change(screen.getByLabelText("password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The identifier or password is incorrect.",
    );
  });
});
