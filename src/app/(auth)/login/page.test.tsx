import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";
import { VERIFICATION_FLOW_KEY } from "@/lib/features/auth/verificationFlow";
import { makeStore } from "@/lib/store";

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

function renderLoginPage() {
  return render(
    <Provider store={makeStore()}>
      {createElement(LoginPage)}
    </Provider>,
  );
}

function readStoredVerificationEmail() {
  const raw = sessionStorage.getItem(VERIFICATION_FLOW_KEY);
  return raw ? JSON.parse(raw).email as string : null;
}

function readStoredVerificationMessage() {
  const raw = sessionStorage.getItem(VERIFICATION_FLOW_KEY);
  return raw ? JSON.parse(raw).message as string : null;
}

describe("login page", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
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

    renderLoginPage();
    fireEvent.change(screen.getByLabelText("email or username"), {
      target: { value: "person" },
    });
    fireEvent.change(screen.getByLabelText("password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/home"));
  });

  it("redirects pending verification users to check-email", async () => {
    mocks.login.mockReturnValue({
      unwrap: () => Promise.resolve({
        accessToken: "access",
        expiresIn: 900,
        refreshToken: "refresh",
        user: {
          email: "pending@example.com",
          id: "pending-id",
          status: "PENDING_VERIFICATION",
          username: "pending",
        },
      }),
    });

    renderLoginPage();
    fireEvent.change(screen.getByLabelText("email or username"), {
      target: { value: "pending" },
    });
    fireEvent.change(screen.getByLabelText("password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/check-email"));
    expect(readStoredVerificationEmail()).toBe("pending@example.com");
    expect(readStoredVerificationMessage()).toBe("Confirm your email to sign in.");
  });

  it("shows invalid credentials for unauthenticated login errors", async () => {
    mocks.login.mockReturnValue({
      unwrap: () => Promise.reject({ data: { code: "UNAUTHENTICATED" } }),
    });

    renderLoginPage();
    fireEvent.change(screen.getByLabelText("email or username"), {
      target: { value: "person" },
    });
    fireEvent.change(screen.getByLabelText("password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid credentials. Please try again.",
    );
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("redirects forbidden email logins to check-email", async () => {
    mocks.login.mockReturnValue({
      unwrap: () => Promise.reject({ data: { code: "FORBIDDEN" } }),
    });

    renderLoginPage();
    fireEvent.change(screen.getByLabelText("email or username"), {
      target: { value: "pending@example.com" },
    });
    fireEvent.change(screen.getByLabelText("password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/check-email"));
    expect(readStoredVerificationEmail()).toBe("pending@example.com");
    expect(readStoredVerificationMessage()).toBe("Confirm your email to sign in.");
  });

  it("shows a forbidden message for username logins without redirecting", async () => {
    mocks.login.mockReturnValue({
      unwrap: () => Promise.reject({
        errors: [{
          extensions: {
            code: "FORBIDDEN",
          },
        }],
      }),
    });

    renderLoginPage();
    fireEvent.change(screen.getByLabelText("email or username"), {
      target: { value: "pending" },
    });
    fireEvent.change(screen.getByLabelText("password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This account is not available. Verify your email or contact support.",
    );
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(readStoredVerificationEmail()).toBeNull();
  });

  it("redirects alternate email-not-verified errors when email is known", async () => {
    mocks.login.mockReturnValue({
      unwrap: () => Promise.reject({ data: { code: "EMAIL_NOT_VERIFIED" } }),
    });

    renderLoginPage();
    fireEvent.change(screen.getByLabelText("email or username"), {
      target: { value: "User@Example.com " },
    });
    fireEvent.change(screen.getByLabelText("password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/check-email"));
    expect(readStoredVerificationEmail()).toBe("user@example.com");
  });
});
