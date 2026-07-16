import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormGroup } from "./FormGroup";

describe("FormGroup", () => {
  it("wraps children with spacing classes", () => {
    const { container } = render(
      <FormGroup>
        <label htmlFor="name">name</label>
        <input id="name" />
      </FormGroup>,
    );

    expect(container.firstChild).toHaveClass("w-full", "last-of-type:mb-0");
    expect(screen.getByLabelText("name")).toBeInTheDocument();
  });
});
