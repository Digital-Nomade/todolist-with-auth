import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("renders a floating label input", () => {
    render(<Input label="email" htmlFor="email" type="email" />);

    expect(screen.getByLabelText("email")).toBeInTheDocument();
  });

  it("shows validation feedback", () => {
    render(
      <Input
        label="email"
        htmlFor="email"
        type="email"
        errorMessage="Email is required"
      />,
    );

    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    render(<Input label="password" htmlFor="password" type="password" />);

    const input = screen.getByLabelText("password");
    expect(input).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button"));
    expect(input).toHaveAttribute("type", "text");
  });
});
