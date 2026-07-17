import { expect, test } from "@playwright/test";
import { installGraphqlMock } from "../fixtures/graphql-mock";
import { loginAsActiveUser, openAddTodoModal } from "../helpers/auth";

async function createTodo(page: Parameters<typeof openAddTodoModal>[0], title: string) {
  await openAddTodoModal(page);
  await page.getByLabel("New Todo").fill(title);
  await page.getByLabel("Description").fill("Created while disconnected");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByLabel("New Todo")).not.toBeVisible();
}

async function offlineStore(page: Parameters<typeof openAddTodoModal>[0]) {
  return page.evaluate(() => {
    const key = Object.keys(localStorage).find(candidate =>
      candidate.startsWith("offline.todos.v1:"));
    return key ? JSON.parse(localStorage.getItem(key) ?? "{}") : null;
  });
}

async function setReportedOnline(
  page: Parameters<typeof openAddTodoModal>[0],
  isOnline: boolean,
) {
  await page.evaluate((online) => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: online,
    });
    window.dispatchEvent(new Event(online ? "online" : "offline"));
  }, isOnline);
}

test.describe("offline todo sync", () => {
  test("persists an offline create across reload and syncs on reconnect", async ({ page }) => {
    const mock = await installGraphqlMock(page);
    await loginAsActiveUser(page);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "onLine", {
        configurable: true,
        value: false,
      });
    });
    await setReportedOnline(page, false);
    await expect(page.getByTestId("todo-sync-status-banner")).not.toBeVisible();

    await createTodo(page, "Offline itinerary");

    await expect(page.getByText("Offline itinerary")).toBeVisible();
    await expect(page.getByTestId("todo-sync-status-banner")).toContainText(
      "will sync when you reconnect",
    );
    expect((await offlineStore(page)).queue).toHaveLength(1);

    await page.reload();
    await expect(page.getByText("Offline itinerary")).toBeVisible();

    await setReportedOnline(page, true);
    await expect.poll(async () => (await offlineStore(page)).queue.length).toBe(0);
    expect(mock.idempotencyKeys).toHaveLength(1);
    await expect(page.getByText("Offline itinerary")).toBeVisible();
  });

  test("keeps local-only changes off GraphQL until the user confirms upload", async ({ page }) => {
    const mock = await installGraphqlMock(page);
    await loginAsActiveUser(page);
    await page.goto("/profile");

    page.once("dialog", dialog => dialog.accept());
    const localOnlySwitch = page.getByRole("switch", { name: "Local-only todos" });
    await localOnlySwitch.click();
    await expect(localOnlySwitch).toBeChecked();
    await expect.poll(() => mock.migrationCalls.prepare).toBe(1);
    await expect.poll(() => mock.migrationCalls.commit).toBe(1);
    expect(mock.todos).toHaveLength(0);

    await page.goto("/home");
    await createTodo(page, "Device-only todo");
    await expect(page.getByText("Device-only todo")).toBeVisible();
    expect(mock.idempotencyKeys).toHaveLength(0);

    await page.goto("/profile");
    page.once("dialog", dialog => dialog.accept());
    await page.getByRole("switch", { name: "Local-only todos" }).click();

    await expect.poll(() => mock.idempotencyKeys.length).toBeGreaterThan(0);
    await expect(page.getByRole("switch", { name: "Local-only todos" })).not.toBeChecked();
  });

  test("does not enable local-only mode when the destructive confirm is cancelled", async ({ page }) => {
    const mock = await installGraphqlMock(page);
    await loginAsActiveUser(page);
    await page.goto("/profile");

    page.once("dialog", dialog => dialog.dismiss());
    await page.getByRole("switch", { name: "Local-only todos" }).click();

    await expect(page.getByRole("switch", { name: "Local-only todos" })).not.toBeChecked();
    expect(mock.migrationCalls.prepare).toBe(0);
    expect(mock.todos.length).toBeGreaterThan(0);
  });

  test("removes a todo offline and queues its server deletion", async ({ page, context }) => {
    const mock = await installGraphqlMock(page);
    await loginAsActiveUser(page);
    await context.setOffline(true);

    await page.getByRole("button", { name: "delete" }).click();

    await expect(page.getByText("Review priorities with the team.")).not.toBeVisible();
    expect((await offlineStore(page)).queue).toContainEqual(
      expect.objectContaining({ type: "DELETE" }),
    );

    await context.setOffline(false);
    await expect.poll(async () => (await offlineStore(page)).queue.length).toBe(0);
    expect(mock.todos.some(todo =>
      todo.id === "550e8400-e29b-41d4-a716-446655440001")).toBe(false);
  });

  test("hydrates only the authenticated user's offline store", async ({ page }) => {
    await installGraphqlMock(page);
    await page.addInitScript(() => {
      const makeStore = (userId: string, title: string) => ({
        baselineSnapshot: null,
        lastSyncAt: null,
        localOnly: true,
        migrationJournal: null,
        queue: [],
        todos: [{
          createdAt: "2026-07-01T00:00:00.000Z",
          description: title,
          done: false,
          dueTo: null,
          localId: `${userId}-local`,
          reminderOn: null,
          serverId: null,
          syncStatus: "local_only",
          title,
          updatedAt: "2026-07-01T00:00:00.000Z",
        }],
        userId,
        version: 2,
      });
      localStorage.setItem(
        "offline.todos.v1:6fffb4d8-ae0a-42bc-8154-80a118b36644",
        JSON.stringify(makeStore(
          "6fffb4d8-ae0a-42bc-8154-80a118b36644",
          "Current account todo",
        )),
      );
      localStorage.setItem(
        "offline.todos.v1:other-user",
        JSON.stringify(makeStore("other-user", "Other account todo")),
      );
    });

    await loginAsActiveUser(page);

    await expect(page.getByRole("heading", { name: "Current account todo" })).toBeVisible();
    await expect(page.getByText("Other account todo")).not.toBeVisible();
  });
});
