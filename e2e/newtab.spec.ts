import { chromium, expect, test } from '@playwright/test'
import path from 'node:path'

test('新規タブのノートを入力して再読み込み後も保持する', async () => {
  const extensionPath = path.resolve('.output/chrome-mv3')
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: process.env.PW_HEADLESS !== 'false',
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  })

  try {
    const page = await context.newPage()
    await page.goto('chrome://newtab/')

    await expect(page).toHaveURL(/^chrome-extension:\/\//)
    const editor = page.locator('textarea')
    await expect(editor).toBeVisible()

    const note = '# Playwright E2E\n\nThe note survives a reload.'
    await editor.fill(note)
    await expect(editor).toHaveValue(note)

    await page.reload()
    await expect(editor).toHaveValue(note)
  } finally {
    await context.close()
  }
})
