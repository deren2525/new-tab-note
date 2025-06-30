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
        bg_primary: 'var(--bg_primary)',
        bg_secondary: 'var(--bg_secondary)',
        bg_blockquote: 'var(--bg_blockquote)',
        bg_active: 'var(--bg_active)',
        bg_delete: 'var(--bg_delete)',
        bg_bottom_primary: 'var(--bg_bottom_primary)',
        border_primary: 'var(--border_primary)',
        border_blockquote: 'var(--border_blockquote)',
        icon_primary: 'var(--icon_primary)',
        text_primary: 'var(--text_primary)',
        text_link: 'var(--text_link)',
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
