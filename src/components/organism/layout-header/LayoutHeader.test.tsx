import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LayoutHeader } from "./LayoutHeader";
import { sessionRestored } from "@/lib/features/auth/authSlice";
import { makeStore } from "@/lib/store";

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ replace: mocks.replace, push: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/lib/features/auth/authApi", () => ({
  useLogoutMutation: () => [mocks.logout, { isLoading: false }],
}));

const activeUser = {
  email: "person@example.com",
  id: "6fffb4d8-ae0a-42bc-8154-80a118b36644",
  status: "ACTIVE",
  username: "person",
} as const;

function renderHeader() {
  const store = makeStore();
  store.dispatch(sessionRestored(activeUser as never));
  return {
    store,
    ...render(
      <Provider store={store}>
        <LayoutHeader />
      </Provider>,
    ),
  };
}

describe("LayoutHeader", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.logout.mockReturnValue({ unwrap: () => Promise.resolve() });
  });

  it("renders the active username and navigation links", () => {
    renderHeader();

    expect(screen.getByText("New todo")).toBeInTheDocument();
    expect(screen.getByLabelText("Profile")).toHaveAttribute("href", "/profile");
    expect(screen.getAllByRole("link").some((link) => link.getAttribute("href") === "/home"))
      .toBe(true);
  });

  it("toggles the notification menu", () => {
    renderHeader();

    const notificationButton = screen.getByRole("button", {
      name: "View notifications",
    });

    expect(screen.queryByText("Notification 1")).not.toBeInTheDocument();
    fireEvent.click(notificationButton);
    expect(screen.getByText("Notification 1")).toBeInTheDocument();
  });

  it("navigates to a trimmed todo search", () => {
    renderHeader();

    fireEvent.change(screen.getByRole("textbox", { name: "Search todos" }), {
      target: { value: "  weekly groceries  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit todo search" }));

    expect(mocks.replace).toHaveBeenCalledWith(
      "/dashboard?search=weekly%20groceries",
    );
  });

  it("logs out and redirects to login", async () => {
    renderHeader();

    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    await vi.waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"));
  });
});
