import type { Meta, StoryObj } from "@storybook/nextjs";

import { Button } from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
