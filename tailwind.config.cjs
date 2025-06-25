/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./entrypoints/**/*.{html,ts,js,vue}', './components/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        white: "#FFF",
        black: "#2C2C2C",
        text_black: "#2D2D2D",
        bg_code: "rgba(0,0,0,0.05)",
        bg_blockquote: "rgba(102,128,153,0.05)",
        border: "rgba(102,128,153,0.075)",
        disabled: "#B9B9B9",
        sidebar: "#E6E6E6",
        list_active: "#248888",
        list_hover: "#CCCCCC",
      },
    },
  },
  plugins: [],
}
