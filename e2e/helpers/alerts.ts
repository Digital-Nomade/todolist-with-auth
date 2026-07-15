import type { Page } from "@playwright/test";

export function appAlert(page: Page) {
  return page.locator("p[role='alert']");
}
