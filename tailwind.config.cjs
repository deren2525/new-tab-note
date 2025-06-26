/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./entrypoints/**/*.{html,ts,js,vue}', './components/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        bg_primary: "#181818",
        border_primary: "#2B2B2B",
        icon_primary: "#D7D7D7",
        text_primary: "#FFFFFF",
        text_link: "#4DAAFC",
      },
    },
  },
  plugins: [],
}
