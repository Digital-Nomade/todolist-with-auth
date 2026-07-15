import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingIcon } from "./LoadingIcon";

describe("LoadingIcon", () => {
  it("renders nothing when not loading", () => {
    const { container } = render(<LoadingIcon isLoading={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the spinner when loading", () => {
    const { container } = render(<LoadingIcon isLoading />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
