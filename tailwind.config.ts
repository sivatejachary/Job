import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b1020",
        panel: "rgba(255, 255, 255, 0.075)",
        line: "rgba(255, 255, 255, 0.14)",
        textMain: "#eef2ff",
        muted: "#a7b0ca",
        accent: "#9b8cff",
        accent2: "#67e8d2",
      },
    },
  },
  plugins: [],
};
export default config;
