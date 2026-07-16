import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VerificationCodeInput } from "./VerificationCodeInput";

describe("VerificationCodeInput", () => {
  afterEach(cleanup);

  it("normalizes pasted values and keeps leading zeroes", () => {
    const onChange = vi.fn();
    render(createElement(VerificationCodeInput, { value: "", onChange }));

    const input = screen.getByLabelText("Verification code");
    fireEvent.paste(input, {
      clipboardData: {
        getData: () => "01-23-45",
      },
    });

    expect(onChange).toHaveBeenCalledWith("012345");
  });

  it("limits input to six numeric characters", () => {
    const onChange = vi.fn();
    render(createElement(VerificationCodeInput, { value: "", onChange }));

    fireEvent.change(screen.getByLabelText("Verification code"), {
      target: { value: "12a34567" },
    });

    expect(onChange).toHaveBeenCalledWith("123456");
  });
});
