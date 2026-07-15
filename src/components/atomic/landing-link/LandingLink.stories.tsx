import type { Meta, StoryObj } from "@storybook/react";
import { LandingLink } from "./LandingLink";

const meta = {
  title: "Atomic/LandingLink",
  component: LandingLink,
  tags: ["autodocs"],
} satisfies Meta<typeof LandingLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
