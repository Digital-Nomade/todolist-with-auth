import { cleanup, render, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VerifyEmailPage from "./page";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

describe("verify-email page", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects legacy token links to the code confirmation screen", async () => {
    render(createElement(VerifyEmailPage));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/check-email"));
  });
});
