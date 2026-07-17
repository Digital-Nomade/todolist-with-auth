import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "./page";

const mocks = vi.hoisted(() => ({
  disableLocalOnly: vi.fn(),
  enableLocalOnly: vi.fn(),
  localOnly: false,
  logoutAll: vi.fn(),
  profile: {
    birthdate: "1990-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    email: "person@example.com",
    id: "6fffb4d8-ae0a-42bc-8154-80a118b36644",
    lastName: "Example",
    name: "Pat",
    profilePicture: null,
    status: "ACTIVE",
    updatedAt: "2026-01-01T00:00:00.000Z",
    username: "person",
  },
  replace: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, push: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/features/auth/authApi", () => ({
  useLogoutAllMutation: () => [mocks.logoutAll, { isLoading: false }],
  useUpdateProfileMutation: () => [mocks.updateProfile, { isLoading: false }],
  useUserProfileQuery: () => ({ data: mocks.profile, isLoading: false }),
}));

vi.mock("@/lib/features/todos/offline/hooks", () => ({
  useOfflineTodoSettings: () => ({
    disableLocalOnly: mocks.disableLocalOnly,
    enableLocalOnly: mocks.enableLocalOnly,
    localOnly: mocks.localOnly,
  }),
}));

describe("profile page", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.localOnly = false;
    mocks.enableLocalOnly.mockResolvedValue(undefined);
    mocks.disableLocalOnly.mockResolvedValue(undefined);
    mocks.updateProfile.mockReturnValue({ unwrap: () => Promise.resolve(mocks.profile) });
    mocks.logoutAll.mockReturnValue({ unwrap: () => Promise.resolve({ message: "ok" }) });
  });

  it("updates only editable profile fields", async () => {
    render(createElement(ProfilePage));

    fireEvent.change(screen.getByLabelText("last name"), {
      target: { value: "Updated" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));

    await waitFor(() => expect(mocks.updateProfile).toHaveBeenCalledWith({
      birthdate: "1990-01-01T00:00:00.000Z",
      lastName: "Updated",
      name: "Pat",
      profilePicture: null,
    }));
    expect(await screen.findByRole("status")).toHaveTextContent("Profile updated.");
  });

  it("redirects to login after logout-all", async () => {
    render(createElement(ProfilePage));

    fireEvent.click(screen.getByRole("button", { name: /sign out all devices/i }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"));
  });

  it("enables local-only mode from the profile switch", async () => {
    render(createElement(ProfilePage));

    fireEvent.click(screen.getByRole("switch", { name: "Local-only todos" }));

    await waitFor(() => expect(mocks.enableLocalOnly).toHaveBeenCalledOnce());
    expect(screen.getByText("Local-only mode enabled.")).toBeInTheDocument();
  });

  it("requires confirmation before disabling local-only mode", async () => {
    mocks.localOnly = true;
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(createElement(ProfilePage));

    fireEvent.click(screen.getByRole("switch", { name: "Local-only todos" }));

    expect(mocks.disableLocalOnly).not.toHaveBeenCalled();
  });
});
