/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./entrypoints/**/*.{html,ts,js,vue}', './components/**/*.{vue,ts}'],
  theme: {
    extend: {
      fontFamily: {
        jp: ['Noto Sans JP', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        robotoMono: ['Roboto Mono', 'sans-serif'],
      },
      colors: {
        bg_primary: '#181818',
        bg_secondary: '#1f1f1f',
        bg_blockquote: '#434343',
        border_primary: '#2B2B2B',
        border_blockquote: '#252525',
        icon_primary: '#D7D7D7',
        text_primary: '#FFFFFF',
        text_link: '#4DAAFC',
      },
      fontSize: {
        h1: ['30px', { lineHeight: '1.4' }],
        h2: ['27px', { lineHeight: '1.4' }],
        h3: ['24px', { lineHeight: '1.4' }],
        h4: ['21px', { lineHeight: '1.4' }],
        h5: ['19.5px', { lineHeight: '1.4' }],
        h6: ['18px', { lineHeight: '1.4' }],
        body: ['14px', { lineHeight: '1.4' }],
        code: ['16px', { lineHeight: '1.6' }],
      },
    },
  },
  plugins: [],
}
