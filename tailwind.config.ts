import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#004c91",
          dark: "#003a70",
          light: "#e7f1fb"
        },
        ink: "#172033",
        paper: "#f7f9fc",
        success: "#1f8a5b",
        warning: "#b7791f"
      },
      fontFamily: {
        sans: ['"DM Sans"', '"Inter"', "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 16px 40px rgba(23, 32, 51, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
