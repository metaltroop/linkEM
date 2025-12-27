import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        metal: {
          blue: "#00A3FF",
          yellow: "#FFB800",
          charcoal: "#0A0A0A",
        },
      },
      backgroundImage: {
        'industrial-grid': "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid-sm': '24px 24px',
      },
    },
  },
  plugins: [],
} satisfies Config;
