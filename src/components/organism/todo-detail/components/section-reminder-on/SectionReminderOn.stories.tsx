import type { Meta, StoryObj } from "@storybook/react";
import { SectionReminderOn } from "./SectionReminderOn";

const meta = {
  title: "Organism/SectionReminderOn",
  component: SectionReminderOn,
  tags: ["autodocs"],
  args: {
    reminderOn: "2026-07-20T09:00:00.000Z",
  },
} satisfies Meta<typeof SectionReminderOn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithReminder: Story = {};

export const WithoutReminder: Story = {
  args: {
    reminderOn: null,
  },
};
