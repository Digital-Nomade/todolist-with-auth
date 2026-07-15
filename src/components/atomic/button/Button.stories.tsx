import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const buttonTypes = [
  "primary",
  "secondary",
  "danger",
  "success",
  "alert",
  "info",
] as const;

const meta = {
  title: "Atomic/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    buttonType: {
      control: "select",
      options: buttonTypes,
    },
    variant: {
      control: "radio",
      options: ["fill", "outlined"],
    },
    rounded: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    children: "Button label",
    buttonType: "secondary",
    variant: "fill",
    rounded: true,
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Fill: Story = {};

export const Outlined: Story = {
  args: {
    variant: "outlined",
  },
};

export const RoundedOff: Story = {
  args: {
    rounded: false,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithLoadingContent: Story = {
  args: {
    children: (
      <>
        Saving
        <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </>
    ),
  },
};

export const SemanticMatrix: Story = {
  render: () => (
    <div className="grid max-w-4xl grid-cols-2 gap-4">
      {buttonTypes.map((buttonType) => (
        <div key={buttonType} className="flex flex-col gap-2">
          <Button buttonType={buttonType} variant="fill" rounded>
            {buttonType} fill
          </Button>
          <Button buttonType={buttonType} variant="outlined" rounded>
            {buttonType} outlined
          </Button>
        </div>
      ))}
    </div>
  ),
};
