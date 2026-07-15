import { expect, type Page } from "@playwright/test";
import { credentials } from "../fixtures/test-data";

export async function loginAsActiveUser(page: Page) {
  await page.goto("/login");
  await page.getByLabel("email or username").fill(credentials.active.identifier);
  await page.getByLabel("password").fill(credentials.active.password);
  await page.getByRole("button", { name: /login/i }).click();
  await expect(page).toHaveURL("/home");
  await expect(page.getByText(/Welcome person/)).toBeVisible();
}

export async function openAddTodoModal(page: Page) {
  await page.locator("header").getByRole("button").first().click();
  await expect(page.getByLabel("New Todo")).toBeVisible();
}
