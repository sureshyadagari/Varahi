import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef7ee",
          100: "#fdedd6",
          200: "#f9d7ad",
          300: "#f4b978",
          400: "#ee9242",
          500: "#ea751d",
          600: "#db5b13",
          700: "#b54412",
          800: "#903617",
          900: "#742f16",
          950: "#3f1509",
        },
      },
    },
  },
  plugins: [],
};
export default config;
