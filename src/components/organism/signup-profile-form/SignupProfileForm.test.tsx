import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SignUpProfileForm } from "./SignupProfileForm";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("SignUpProfileForm", () => {
  afterEach(cleanup);

  it("requires profile fields before continuing", async () => {
    const navigate = vi.fn();
    render(<SignUpProfileForm navigate={navigate} />);

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("You must provide a name")).toBeInTheDocument();
      expect(screen.getByText("You must provide a last name.")).toBeInTheDocument();
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it("navigates after a successful profile submit", async () => {
    vi.useFakeTimers();
    const navigate = vi.fn();
    render(<SignUpProfileForm navigate={navigate} />);

    fireEvent.change(screen.getByLabelText("name"), {
      target: { value: "Pat" },
    });
    fireEvent.change(screen.getByLabelText("last name"), {
      target: { value: "Example" },
    });
    fireEvent.change(screen.getByLabelText("username"), {
      target: { value: "person" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await vi.runAllTimersAsync();
    vi.useRealTimers();

    expect(navigate).toHaveBeenCalledOnce();
  });
});
