import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta = {
  title: "Atomic/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    label: "email",
    htmlFor: "email",
    type: "text",
    placeholder: " ",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Password: Story = {
  args: {
    label: "password",
    htmlFor: "password",
    type: "password",
  },
};

export const WithError: Story = {
  args: {
    label: "email",
    htmlFor: "email-error",
    errorMessage: "Email is required",
    defaultValue: "",
  },
};

export const Disabled: Story = {
  args: {
    label: "username",
    htmlFor: "username",
    disabled: true,
    defaultValue: "bruno",
  },
};

export const FormExample: Story = {
  render: () => (
    <form className="max-w-md space-y-8">
      <Input label="email" htmlFor="form-email" type="email" />
      <Input label="password" htmlFor="form-password" type="password" />
      <Input
        label="confirm password"
        htmlFor="form-confirm"
        type="password"
        errorMessage="Passwords must match"
      />
    </form>
  ),
};
