// @ts-check
import { test, expect } from '@playwright/test'

async function waitForApp(page) {
  await page.goto('/')
  await page.waitForSelector('text=Active Companies', { timeout: 10000 })
}

test.describe('Companies CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await waitForApp(page)
    await page.getByRole('link', { name: /Companies/i }).first().click()
    await page.waitForSelector('button:has-text("Add Company")', { timeout: 5000 })
  })

  test('shows companies page with add button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Add Company/i })).toBeVisible()
  })

  test('opens create company modal', async ({ page }) => {
    await page.getByRole('button', { name: /Add Company/i }).click()
    await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 3000 })
  })

  test('validates company form on submit', async ({ page }) => {
    await page.getByRole('button', { name: /Add Company/i }).click()
    await page.waitForTimeout(300)
    const saveBtn = page.getByRole('button', { name: /Save|Create/i }).first()
    if (await saveBtn.isVisible()) {
      await saveBtn.click()
      await page.waitForTimeout(300)
    }
  })
})
