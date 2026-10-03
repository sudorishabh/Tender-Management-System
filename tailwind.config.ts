import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./_components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand blue for buttons, links and active states. Same hue as the
        // navy, lighter so controls read as blue rather than black. Hover
        // deepens towards the navy
        primary: {
          DEFAULT: "#00619a",
          hover: "#044973",
        },
        secondary: "",
        card: "#f6f6f6",
        // Page background behind dashboard content
        canvas: "#f4f6f9",
        // Brand navy for large surfaces only: the sign-in panel and dashboard
        // sidebar, with soft starting the banners. Too heavy for buttons.
        // Backed by the --navy-* variables in app/globals.css
        navy: {
          DEFAULT: "hsl(var(--navy) / <alpha-value>)",
          hover: "hsl(var(--navy-hover) / <alpha-value>)",
          soft: "hsl(var(--navy-soft) / <alpha-value>)",
          foreground: "hsl(var(--navy-foreground) / <alpha-value>)",
          accent: "hsl(var(--navy-accent) / <alpha-value>)",
        },
        // Backed by the --sidebar-* variables in app/globals.css
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          primary: "hsl(var(--sidebar-primary) / <alpha-value>)",
          "primary-foreground":
            "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          accent: "hsl(var(--sidebar-accent) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
        },
      },

      borderRadius: {
        mmd: "0.67rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
// Refresh config
