import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef1ff",
          100: "#dde4ff",
          200: "#bcc9ff",
          300: "#8fa3ff",
          400: "#6078ff",
          500: "#3147FF",
          600: "#3147FF",
          700: "#2a3de6",
          800: "#1e2eb3",
          900: "#172380",
          950: "#0f1a4d",
        },
        accent: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        navy: {
          700: "#1C264F",
          800: "#131B3F",
          900: "#0A102F",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "soft": "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        "elevated": "0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 2px 10px -2px rgba(0, 0, 0, 0.04)",
        "glow": "0 0 30px rgba(49, 71, 255, 0.15)",
        "glow-lg": "0 0 60px rgba(49, 71, 255, 0.2)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
