import { nextui } from '@nextui-org/theme';
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/components/(button|snippet|code|input).js"
  ],
  theme: {
    extend: {
      colors: {
        "primary-dark": "#0E003A",
        "primary-dark-transparency": "#0E003A77",
        "secondary": "#BF0066",
        "danger": "#F3434F",
        "danger-light": "#EEB0B4",
        "success": "#7DE300",
        "alert": "#DBE300",
        "info": "#28DDFD",
        "white": "#FFFFFF",
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
export default config;