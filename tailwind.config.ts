import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#004c91",
          50: "#eef6fd",
          100: "#d9eafa",
          200: "#b8d8f4",
          300: "#86bde9",
          400: "#4d9ad9",
          500: "#1f78c3",
          600: "#0c5fa6",
          700: "#004c91",
          800: "#073d70",
          900: "#092f55",
          dark: "#003a70",
          light: "#e7f1fb"
        },
        ink: "#172033",
        paper: "#f7f9fc",
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f1f5f9",
          subtle: "#f8fafc"
        },
        line: "#d9e2ec",
        success: "#1f8a5b",
        warning: "#b7791f",
        danger: "#b42318"
      },
      fontFamily: {
        sans: ['"DM Sans"', '"Inter"', "ui-sans-serif", "system-ui", "sans-serif"]
      },
      fontSize: {
        "display-sm": ["2rem", { lineHeight: "2.5rem", fontWeight: "700" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5rem" }],
        "body-base": ["1rem", { lineHeight: "1.75rem" }]
      },
      borderRadius: {
        ui: "0.75rem",
        "ui-sm": "0.5rem",
        "ui-lg": "1rem"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(23, 32, 51, 0.08)",
        card: "0 10px 30px rgba(23, 32, 51, 0.07)",
        focus: "0 0 0 4px rgba(0, 76, 145, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
