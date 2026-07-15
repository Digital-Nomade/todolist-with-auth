import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionReminderOn } from "./SectionReminderOn";

describe("SectionReminderOn", () => {
  it("renders the reminder date when provided", () => {
    render(<SectionReminderOn reminderOn="2026-07-20T09:00:00.000Z" />);

    expect(screen.getByText(/Reminder on:/)).toBeInTheDocument();
    expect(screen.getByText(/Mon Jul 20 2026/)).toBeInTheDocument();
  });

  it("renders nothing without a reminder", () => {
    const { container } = render(<SectionReminderOn reminderOn={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
