/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#075e54", light: "#128c7e", dark: "#054d44" },
        accent: { DEFAULT: "#25d366", hover: "#1ebd5a" },
        aadhaar: { saffron: "#FF9933", white: "#ffffff", green: "#138808", navy: "#0f172a" }
      },
      fontFamily: { sans: ["Inter","Segoe UI","system-ui","sans-serif"] }
    },
  },
  plugins: [],
}
