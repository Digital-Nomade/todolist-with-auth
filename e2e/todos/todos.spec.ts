import { test, expect } from "@playwright/test";
import { installGraphqlMock } from "../fixtures/graphql-mock";
import { loginAsActiveUser, openAddTodoModal } from "../helpers/auth";

test.describe("home todos", () => {
  test.beforeEach(async ({ page }) => {
    await installGraphqlMock(page);
    await loginAsActiveUser(page);
  });

  test("renders the selected todo details", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Plan sprint backlog" })).toBeVisible();
    await expect(page.getByText("Review priorities with the team.")).toBeVisible();
  });

  test("navigates between todos", async ({ page }) => {
    const todoDetail = page.locator("section.mx-auto").filter({
      has: page.getByRole("heading", { name: "Plan sprint backlog" }),
    });
    await todoDetail.getByRole("button").nth(1).click();

    await expect(page.getByRole("heading", { name: "Write release notes" })).toBeVisible();
    await expect(page.getByText("Document the authentication migration.")).toBeVisible();
  });

  test("marks a todo as done", async ({ page }) => {
    await page.getByRole("button", { name: /check/i }).click();
    await expect(page.getByRole("button", { name: /check/i })).toBeVisible();
  });
});

test.describe("dashboard todos", () => {
  test.beforeEach(async ({ page }) => {
    await installGraphqlMock(page);
    await loginAsActiveUser(page);
  });

  test("lists todos and updates the detail panel on selection", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByRole("button", { name: "Plan sprint ba..." })).toBeVisible();
    await page.getByRole("button", { name: "Write release ..." }).click();

    await expect(page.getByRole("heading", { name: "Write release notes" })).toBeVisible();
    await expect(page.getByText("Document the authentication migration.")).toBeVisible();
  });
});

test.describe("create todo modal", () => {
  test.beforeEach(async ({ page }) => {
    await installGraphqlMock(page);
    await loginAsActiveUser(page);
  });

  test("creates a todo from the header modal", async ({ page }) => {
    await openAddTodoModal(page);

    await page.getByLabel("New Todo").fill("Ship Playwright coverage");
    await page.locator("textarea[name='description']").fill("Cover every available flow.");

    const createTodoResponse = page.waitForResponse((response) => {
      const postData = response.request().postData() ?? "";
      return response.url().includes("/graphql") && postData.includes("CreateTodo");
    });

    await page.getByRole("button", { name: "Save", exact: true }).click();
    await createTodoResponse;

    await expect(page.getByRole("heading", { name: "Ship Playwright coverage" })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("closes the modal without creating a todo", async ({ page }) => {
    await openAddTodoModal(page);
    await page.getByRole("button", { name: /cancel/i }).click();

    await expect(page.getByLabel("New Todo")).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("heading", { name: "Plan sprint backlog" })).toBeVisible();
  });
});

test.describe("header navigation", () => {
  test.beforeEach(async ({ page }) => {
    await installGraphqlMock(page);
    await loginAsActiveUser(page);
  });

  test("opens the notification menu and navigates to profile", async ({ page }) => {
    const notificationButton = page.locator("nav").getByRole("button").first();
    await notificationButton.click();
    await expect(page.getByText("Notification 1")).toBeVisible();

    await page.getByLabel("Profile").click();
    await expect(page).toHaveURL("/profile");
    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
  });
});
