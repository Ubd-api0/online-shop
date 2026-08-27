/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  mode: "jit",
  darkMode: "class",
  theme: {
    fontFamily: {
      Roboto: ["Roboto", "sans-serif"],
      Poppins: ["Poppins", "sans-serif"],
    },
    extend: {
      screens: {
        "1000px": "1050px",
        "1100px": "1110px",
        "800px": "800px",
        "1300px": "1300px",
        "400px": "400px",
      },
      colors: {
        surface: "var(--surface)",
        "surface-alt": "var(--surface-alt)",
        content: "var(--content)",
        muted: "var(--muted)",
        border: "var(--border)",
        brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
        },
      },
    },
  },
  plugins: [],
};
