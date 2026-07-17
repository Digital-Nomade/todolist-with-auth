import { beforeEach, describe, expect, it } from "vitest";
import { offlineTodosKey } from "./keys";
import { readOfflineStore, updateOfflineStore } from "./repository";

describe("offline todo repository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("isolates persisted stores by user", async () => {
    await updateOfflineStore("user-a", store => ({ ...store, localOnly: true }));
    await updateOfflineStore("user-b", store => ({ ...store, localOnly: false }));

    expect((await readOfflineStore("user-a")).localOnly).toBe(true);
    expect((await readOfflineStore("user-b")).localOnly).toBe(false);
    expect(localStorage.getItem(offlineTodosKey("user-a"))).not.toBeNull();
    expect(localStorage.getItem(offlineTodosKey("user-b"))).not.toBeNull();
  });

  it("recovers safely from malformed persisted data", async () => {
    localStorage.setItem(offlineTodosKey("user-a"), "{broken");

    await expect(readOfflineStore("user-a")).resolves.toMatchObject({
      queue: [],
      todos: [],
      userId: "user-a",
      version: 1,
    });
  });

  it("serializes concurrent updates without losing writes", async () => {
    await Promise.all([
      updateOfflineStore("user-a", store => ({
        ...store,
        lastSyncAt: "first",
      })),
      updateOfflineStore("user-a", store => ({
        ...store,
        localOnly: true,
      })),
    ]);

    await expect(readOfflineStore("user-a")).resolves.toMatchObject({
      lastSyncAt: "first",
      localOnly: true,
    });
  });
});
