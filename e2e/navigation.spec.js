// @ts-check
import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('dashboard loads with stat cards', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.getByText('Active Companies')).toBeVisible()
    await expect(page.getByText('Total Employees')).toBeVisible()
    await expect(page.getByText('W2 Documents')).toBeVisible()
  })

  test('companies page loads', async ({ page }) => {
    await page.goto('/companies', { waitUntil: 'networkidle' })
    await expect(page.getByRole('button', { name: /Add Company/i })).toBeVisible()
  })

  test('employees page loads', async ({ page }) => {
    await page.goto('/employees', { waitUntil: 'networkidle' })
    await expect(page.getByRole('button', { name: /Add Employee/i })).toBeVisible()
  })

  test('template library page loads', async ({ page }) => {
    await page.goto('/template-library', { waitUntil: 'networkidle' })
    await expect(page.getByText('Template Library')).toBeVisible()
  })

  test('import/export page loads', async ({ page }) => {
    await page.goto('/data-import-export', { waitUntil: 'networkidle' })
    await expect(page.getByText('Export Data')).toBeVisible()
  })

  test('settings page loads', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' })
    await expect(page.getByText('Settings')).toBeVisible()
  })

  test('responsive: mobile viewport loads dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.getByText('Active Companies')).toBeVisible()
  })
})
