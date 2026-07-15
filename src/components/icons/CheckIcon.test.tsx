import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CheckIcon } from "./CheckIcon";

describe("CheckIcon", () => {
  it("accepts custom class names", () => {
    const { container } = render(<CheckIcon className="h-6 w-6" />);
    expect(container.querySelector("svg")).toHaveClass("h-6", "w-6");
  });
});
