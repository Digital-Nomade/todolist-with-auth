import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SignUpForm } from "./SignupForm";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("SignUpForm", () => {
  afterEach(cleanup);

  it("shows validation errors for invalid input", async () => {
    render(<SignUpForm moveToNextStep={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText("You must add a valid email")).toBeInTheDocument();
      expect(screen.getByText("Password min length 6")).toBeInTheDocument();
      expect(screen.getByText("Passwords must match")).toBeInTheDocument();
    });
  });

  it("advances to the next step after a successful submit", async () => {
    vi.useFakeTimers();
    const moveToNextStep = vi.fn();
    render(<SignUpForm moveToNextStep={moveToNextStep} />);

    fireEvent.change(screen.getByLabelText("email"), {
      target: { value: "person@example.com" },
    });
    fireEvent.change(screen.getByLabelText("password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/retype/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    await vi.runAllTimersAsync();
    vi.useRealTimers();

    expect(moveToNextStep).toHaveBeenCalledOnce();
  });
});
