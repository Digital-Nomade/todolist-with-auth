import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CheckEmailPage from "./page";
import {
  clearVerificationFlowState,
  storeVerificationEmail,
  storeVerificationMessage,
  VERIFICATION_FLOW_KEY,
} from "@/lib/features/auth/verificationFlow";
import { makeStore } from "@/lib/store";

const mocks = vi.hoisted(() => ({
  resend: vi.fn(),
  searchParams: new URLSearchParams(),
  verify: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
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

function renderCheckEmailPage() {
  return render(
    <Provider store={makeStore()}>
      {createElement(CheckEmailPage)}
    </Provider>,
  );
}

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

    renderCheckEmailPage();

    expect(screen.getByRole("status")).toHaveTextContent("Check your inbox");
    expect(screen.getByText(/p\*\*\*@example\.com/)).toBeInTheDocument();
  });

  it("shows a success state after verification instead of auto-login", async () => {
    storeVerificationEmail("person@example.com");
    mocks.verify.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    renderCheckEmailPage();

    fireEvent.change(screen.getByLabelText("Verification code"), {
      target: { value: "012345" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verify code/i }));

    expect(await screen.findByRole("heading", { name: "Email confirmed" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Your email has been confirmed. You can now sign in.",
    );
    expect(screen.getByRole("link", { name: "Go to login" })).toHaveAttribute("href", "/login");
    expect(sessionStorage.getItem(VERIFICATION_FLOW_KEY)).toBeNull();
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

    renderCheckEmailPage();

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

    renderCheckEmailPage();

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

    renderCheckEmailPage();

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
    renderCheckEmailPage();

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

    renderCheckEmailPage();

    fireEvent.change(screen.getByLabelText("Verification code"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verify code/i }));

    await waitFor(() => expect(mocks.verify).toHaveBeenCalled());
    expect(JSON.stringify(sessionStorage)).not.toContain("123456");
    clearVerificationFlowState();
  });
});
