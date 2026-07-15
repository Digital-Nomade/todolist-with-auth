import type { Preview } from "@storybook/react";
import { NextUIProvider } from "@nextui-org/react";
import "../src/app/globals.css";

function AppGradient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-secondary to-primary-dark p-8">
      {children}
    </div>
  );
}

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true,
    },
    viewport: {
      viewports: {
        mobile: {
          name: "Mobile",
          styles: { width: "375px", height: "667px" },
        },
        tablet: {
          name: "Tablet",
          styles: { width: "768px", height: "1024px" },
        },
        desktop: {
          name: "Desktop",
          styles: { width: "1280px", height: "800px" },
        },
      },
    },
  },
  decorators: [
    (Story) => (
      <NextUIProvider>
        <AppGradient>
          <Story />
        </AppGradient>
      </NextUIProvider>
    ),
  ],
};

export default preview;
