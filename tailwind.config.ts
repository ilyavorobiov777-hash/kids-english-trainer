import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#243042",
        skysoft: "#D8F1FF",
        mint: "#DFF7E8",
        peach: "#FFE1C8",
        berry: "#E84D7A"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(36, 48, 66, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
