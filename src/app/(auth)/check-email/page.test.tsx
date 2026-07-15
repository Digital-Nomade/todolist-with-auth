import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CheckEmailPage from "./page";

const mocks = vi.hoisted(() => ({
  resend: vi.fn(),
  searchParams: new URLSearchParams("email=person@example.com"),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/features/auth/authApi", () => ({
  useResendVerificationMutation: () => [mocks.resend, { isLoading: false }],
}));

describe("check-email page", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.searchParams = new URLSearchParams("email=person@example.com");
  });

  it("resends verification for the email in the query string", async () => {
    mocks.resend.mockReturnValue({
      unwrap: () => Promise.resolve({ message: "sent" }),
    });

    render(createElement(CheckEmailPage));
    fireEvent.click(screen.getByRole("button", { name: /resend verification/i }));

    await waitFor(() => expect(mocks.resend).toHaveBeenCalledWith("person@example.com"));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "A new verification email has been sent.",
    );
  });
});
