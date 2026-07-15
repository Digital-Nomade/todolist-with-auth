import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children with fill and secondary styles", () => {
    render(
      <Button buttonType="secondary" variant="fill" rounded>
        login
      </Button>,
    );

    const button = screen.getByRole("button", { name: "login" });
    expect(button).toHaveClass("bg-secondary", "text-primary-dark", "rounded-full");
  });

  it("supports outlined variants", () => {
    render(
      <Button buttonType="danger" variant="outlined">
        delete
      </Button>,
    );

    expect(screen.getByRole("button", { name: "delete" }))
      .toHaveClass("border-danger", "text-danger");
  });

  it("can be disabled", () => {
    render(
      <Button buttonType="secondary" variant="fill" disabled>
        unavailable
      </Button>,
    );

    expect(screen.getByRole("button", { name: "unavailable" })).toBeDisabled();
  });
});
