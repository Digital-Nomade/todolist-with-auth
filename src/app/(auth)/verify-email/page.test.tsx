import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VerifyEmailPage from "./page";

const mocks = vi.hoisted(() => ({
  searchParams: new URLSearchParams(),
  verify: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("@/lib/features/auth/authApi", () => ({
  useVerifyEmailMutation: () => [mocks.verify, { isLoading: false }],
}));

describe("verify-email page", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.searchParams = new URLSearchParams();
  });

  it("consumes the verification token from the query string", async () => {
    mocks.searchParams = new URLSearchParams("token=email-query-token");
    mocks.verify.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    render(createElement(VerifyEmailPage));

    await waitFor(() => expect(mocks.verify).toHaveBeenCalledWith("email-query-token"));
    expect(await screen.findByText("Email verified")).toBeInTheDocument();
  });
});
