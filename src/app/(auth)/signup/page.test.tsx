import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SignUp from "./page";

const mocks = vi.hoisted(() => ({
  createUser: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/features/auth/authApi", () => ({
  useRegisterUserMutation: () => [mocks.createUser, { isLoading: false }],
}));

describe("signup page", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers with form variables then navigates to check-email", async () => {
    mocks.createUser.mockReturnValue({
      unwrap: () => Promise.resolve({ message: "Check your inbox" }),
    });
    render(createElement(SignUp));

    fireEvent.change(screen.getByLabelText("email"), {
      target: { value: "person+test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("username"), {
      target: { value: "person" },
    });
    fireEvent.change(screen.getByLabelText("password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("confirm password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "Pat" } });
    fireEvent.change(screen.getByLabelText("last name"), {
      target: { value: "Example" },
    });
    fireEvent.change(screen.getByLabelText("birthdate"), {
      target: { value: "1990-01-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(mocks.createUser).toHaveBeenCalledWith({
      birthdate: "1990-01-01T00:00:00.000Z",
      email: "person+test@example.com",
      lastName: "Example",
      name: "Pat",
      password: "password123",
      profilePicture: null,
      username: "person",
    }));
    expect(mocks.push).toHaveBeenCalledWith(
      "/check-email?email=person%2Btest%40example.com",
    );
  });
});
