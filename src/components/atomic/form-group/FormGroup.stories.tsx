import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button/Button";
import { FormGroup } from "./FormGroup";
import { Input } from "../input/Input";

function FormGroupDemo({ variant }: { variant: "single" | "stacked" }) {
  if (variant === "single") {
    return (
      <FormGroup>
        <Input label="name" htmlFor="name" type="text" />
      </FormGroup>
    );
  }

  return (
    <form className="max-w-md border border-danger-light p-8">
      <FormGroup>
        <Input label="email" htmlFor="stacked-email" type="email" />
      </FormGroup>
      <FormGroup>
        <Input label="password" htmlFor="stacked-password" type="password" />
      </FormGroup>
      <FormGroup>
        <Button buttonType="secondary" variant="fill" rounded type="button">
          submit
        </Button>
      </FormGroup>
    </form>
  );
}

const meta = {
  title: "Atomic/FormGroup",
  component: FormGroupDemo,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "radio",
      options: ["single", "stacked"],
    },
  },
  args: {
    variant: "single",
  },
} satisfies Meta<typeof FormGroupDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleField: Story = {
  args: {
    variant: "single",
  },
};

export const StackedFields: Story = {
  args: {
    variant: "stacked",
  },
};
