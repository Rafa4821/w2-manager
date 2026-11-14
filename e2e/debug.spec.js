import { test, expect } from '@playwright/test'

test('debug: screenshot after load', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.screenshot({ path: 'e2e-debug.png', fullPage: true })
  const html = await page.content()
  console.log('Page title:', await page.title())
  console.log('Root innerHTML length:', html.length)
  console.log('Body text (first 500):', (await page.innerText('body')).slice(0, 500))
  expect(true).toBe(true)
})
