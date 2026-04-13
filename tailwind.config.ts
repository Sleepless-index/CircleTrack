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
        accent: {
          DEFAULT: "#4f8ef7",
          light: "#7aabff",
          dim: "rgba(79,142,247,0.12)",
        },
        emerald: "#34d97b",
        rose: "#f06b85",
        amber: "#f5a623",
        bg: "#080a0f",
        surface: {
          DEFAULT: "#0f1218",
          raised: "#161b24",
          border: "rgba(255,255,255,0.07)",
          hover: "rgba(255,255,255,0.04)",
        },
        gold: {
          DEFAULT: "#e8b84b",
          light: "#f5d080",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["DM Mono", "monospace"],
        display: ["DM Sans", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      animation: {
        "slide-in": "slideIn 0.25s ease-out",
        "fade-in": "fadeIn 0.15s ease-out",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
