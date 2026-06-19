import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 臙脂（えんじ）系：専門家の注意点を囲む色
        enji: {
          DEFAULT: "#9e2a2b",
          light: "#fbeae9",
          border: "#e0b4b3",
        },
        ink: "#1f2933",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Hiragino Kaku Gothic ProN",
          "Hiragino Sans",
          "Meiryo",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
