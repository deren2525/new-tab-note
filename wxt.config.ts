import { defineConfig } from 'wxt'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  manifest: {
    name: '__MSG_NAME__',
    version: '3.2.5',
    description: '__MSG_DESCRIPTION__',
    manifest_version: 3,
    default_locale: 'en',
    permissions: ['storage'],
    action: {
      default_icon: {
        '48': 'icon/icon.png',
      },
    },
    chrome_url_overrides: {
      newtab: 'overrides/newtab/index.html',
    },
    icons: {
      '16': 'icon/icon.png',
      '48': 'icon/icon.png',
      '128': 'icon/icon.png',
    },
  },
  vite() {
    return {
      plugins: [vue()],
    }
  },
})
