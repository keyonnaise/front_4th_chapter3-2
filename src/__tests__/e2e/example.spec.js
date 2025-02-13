import { test, expect } from '@playwright/test';

test('홈페이지 제목 확인', async ({ page }) => {
  await page.goto('https://www.example.com');
  const title = await page.title();
  expect(title).toBe('Example Domain');
});

test('링크 클릭 후 이동 확인', async ({ page }) => {
  await page.goto('https://www.example.com');
  await page.click('a');
  await expect(page).toHaveURL('https://www.iana.org/domains/reserved');
});
