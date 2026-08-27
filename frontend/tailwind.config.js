/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#2d6a4f",
          deep: "#1b4332",
          ink: "#1f2a24",
          muted: "#738078",
          line: "#e4ebe6",
          cream: "#f7f8f5",
          orange: "#d4a373",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-outfit)", "Outfit", "sans-serif"],
        mono: ["var(--font-mono)", "DM Mono", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};