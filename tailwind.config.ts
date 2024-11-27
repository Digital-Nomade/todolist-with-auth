import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "primary-dark": "#0E003A",
        "primary-light": "#BF0066",
        "danger": "#F3434F",
        "danger-light": "#EEB0B4",
        "success": "#7DE300",
        "alert": "#DBE300",
        "info": "#28DDFD",
        "white": "#FFFFFF",
      },
    },
  },
  plugins: [],
};
export default config;