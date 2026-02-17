import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        tamu: {
          maroon: "#500000",
          maroonDark: "#3d0000",
          maroon700: "#732f2f",
          maroon100: "#f5e6e6",
          maroon50: "#fbf5f5",
          cream: "#f7f5f0",
        },
        maroon: {
          DEFAULT: "#500000",
          dark: "#3d0000",
          light: "#6b0000",
          900: "var(--maroon-900)",
          700: "var(--maroon-700)",
          100: "var(--maroon-100)",
          50: "var(--maroon-50)",
        },
        pipeline: {
          success: "var(--success)",
          "success-bg": "var(--success-bg)",
          danger: "var(--danger)",
          "danger-bg": "var(--danger-bg)",
          warning: "var(--warning)",
          "warning-bg": "var(--warning-bg)",
          muted: "var(--muted)",
          "muted-bg": "var(--muted-bg)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        'extra-wide': '0.15em',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
