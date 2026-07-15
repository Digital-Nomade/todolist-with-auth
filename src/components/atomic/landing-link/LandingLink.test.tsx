import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LandingLink } from "./LandingLink";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("LandingLink", () => {
  it("renders the brand link", () => {
    render(<LandingLink />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/");
    expect(screen.getByText("You Do!")).toBeInTheDocument();
    expect(screen.getByText("Much More")).toBeInTheDocument();
  });
});
