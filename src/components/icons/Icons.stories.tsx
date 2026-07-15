import type { Meta, StoryObj } from "@storybook/react";
import {
  AddIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  DashboardIcon,
  EyeIcon,
  HomeIcon,
  LoadingIcon,
  NotificationIcon,
  SearchIcon,
  TextIcon,
  UserIcon,
} from "@/components/icons";
import { CalendarIcon } from "@/components/icons/CalendarIcon";

const meta = {
  title: "Icons/Gallery",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function IconCell({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-danger-light/40 bg-primary-dark-transparency p-6">
      <div className="flex h-12 w-12 items-center justify-center">{children}</div>
      <span className="text-sm font-light text-danger-light">{name}</span>
    </div>
  );
}

export const StaticIcons: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
      <IconCell name="AddIcon"><AddIcon /></IconCell>
      <IconCell name="ArrowLeftIcon"><ArrowLeftIcon /></IconCell>
      <IconCell name="ArrowRightIcon"><ArrowRightIcon /></IconCell>
      <IconCell name="CalendarIcon"><CalendarIcon /></IconCell>
      <IconCell name="DashboardIcon"><DashboardIcon /></IconCell>
      <IconCell name="EyeIcon"><EyeIcon /></IconCell>
      <IconCell name="HomeIcon"><HomeIcon /></IconCell>
      <IconCell name="SearchIcon"><SearchIcon /></IconCell>
      <IconCell name="TextIcon"><TextIcon /></IconCell>
      <IconCell name="UserIcon"><UserIcon /></IconCell>
    </div>
  ),
};

export const StatefulIcons: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      <IconCell name="CheckIcon">
        <CheckIcon className="h-8 w-8" />
      </IconCell>
      <IconCell name="LoadingIcon (active)">
        <div className="relative h-10 w-10">
          <LoadingIcon isLoading />
        </div>
      </IconCell>
      <IconCell name="NotificationIcon (active)">
        <NotificationIcon hasNotification />
      </IconCell>
      <IconCell name="NotificationIcon (idle)">
        <NotificationIcon hasNotification={false} />
      </IconCell>
    </div>
  ),
};
