import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CheckEmailPage from "./page";
import {
  clearVerificationFlowState,
  storeVerificationEmail,
  storeVerificationMessage,
} from "@/lib/features/auth/verificationFlow";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  resend: vi.fn(),
  searchParams: new URLSearchParams(),
  verify: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, push: vi.fn() }),
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/features/auth/authApi", () => ({
  useVerifyEmailMutation: () => [mocks.verify, { isLoading: false }],
  useResendVerificationMutation: () => [mocks.resend, { isLoading: false }],
}));

describe("check-email page", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    sessionStorage.clear();
    mocks.searchParams = new URLSearchParams();
  });

  it("shows the registration message and masked destination email", () => {
    storeVerificationEmail("person@example.com");
    storeVerificationMessage("Check your inbox");

    render(createElement(CheckEmailPage));

    expect(screen.getByRole("status")).toHaveTextContent("Check your inbox");
    expect(screen.getByText(/p\*\*\*@example\.com/)).toBeInTheDocument();
  });

  it("submits email and code to verifyEmail", async () => {
    storeVerificationEmail("person@example.com");
    mocks.verify.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    render(createElement(CheckEmailPage));

    fireEvent.change(screen.getByLabelText("Verification code"), {
      target: { value: "012345" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verify code/i }));

    await waitFor(() => expect(mocks.verify).toHaveBeenCalledWith({
      email: "person@example.com",
      code: "012345",
    }));
    expect(mocks.replace).toHaveBeenCalledWith("/login");
    expect(sessionStorage.getItem("todo-auth.verification-email")).toBeNull();
  });

  it("shows a safe error for invalid or expired codes", async () => {
    storeVerificationEmail("person@example.com");
    mocks.verify.mockReturnValue({
      unwrap: () => Promise.reject({
        code: "UNAUTHENTICATED",
        errors: [],
        status: 200,
      }),
    });

    render(createElement(CheckEmailPage));

    fireEvent.change(screen.getByLabelText("Verification code"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verify code/i }));

    expect(await screen.findByRole("status")).toHaveTextContent("Invalid or expired code.");
  });

  it("treats HTTP 200 GraphQL errors as failures", async () => {
    storeVerificationEmail("person@example.com");
    mocks.verify.mockReturnValue({
      unwrap: () => Promise.reject({
        code: "BAD_USER_INPUT",
        errors: [],
        status: 200,
      }),
    });

    render(createElement(CheckEmailPage));

    fireEvent.change(screen.getByLabelText("Verification code"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verify code/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter a valid six-digit code.",
    );
  });

  it("resends the code, clears the input, and starts a cooldown", async () => {
    storeVerificationEmail("person@example.com");
    mocks.resend.mockReturnValue({
      unwrap: () => Promise.resolve({ message: "If an account exists, a code was sent." }),
    });

    render(createElement(CheckEmailPage));

    fireEvent.change(screen.getByLabelText("Verification code"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /resend code/i }));

    await waitFor(() => expect(mocks.resend).toHaveBeenCalledWith("person@example.com"));
    expect(screen.getByLabelText("Verification code")).toHaveValue("");
    expect(screen.getByRole("status")).toHaveTextContent(
      "If an account exists, a code was sent. Any previous code is no longer valid.",
    );
    expect(screen.getByRole("button", { name: /resend code in/i })).toBeDisabled();
  });

  it("offers a recovery path when the email is unavailable", () => {
    render(createElement(CheckEmailPage));

    expect(screen.getByRole("heading", { name: "Confirm your email" })).toBeInTheDocument();
    expect(screen.getByLabelText("email")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to registration" })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  it("never stores the verification code in session storage", async () => {
    storeVerificationEmail("person@example.com");
    mocks.verify.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    render(createElement(CheckEmailPage));

    fireEvent.change(screen.getByLabelText("Verification code"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verify code/i }));

    await waitFor(() => expect(mocks.verify).toHaveBeenCalled());
    expect(JSON.stringify(sessionStorage)).not.toContain("123456");
    clearVerificationFlowState();
  });
});
