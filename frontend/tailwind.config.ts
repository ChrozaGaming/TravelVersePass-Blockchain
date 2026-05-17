import type { Config } from "tailwindcss";

// Tailwind di-setup tapi BELUM dipakai di komponen.
// Tim FE bebas styling — semua page sudah punya struktur HTML semantic.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
