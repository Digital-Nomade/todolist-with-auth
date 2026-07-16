import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Provider } from "react-redux";
import PrivateLayout from "./layout";
import { sessionRestored } from "@/lib/features/auth/authSlice";
import { makeStore } from "@/lib/store";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, push: vi.fn() }),
}));

vi.mock("@/components/organism/layout-header/LayoutHeader", () => ({
  LayoutHeader: () => <header>Header</header>,
}));

vi.mock("@/components/organism/add-todo-modal/AddTodoModal", () => ({
  AddTodoModal: () => null,
}));

describe("private layout", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated users to login", () => {
    const store = makeStore();
    const { container } = render(
      <Provider store={store}>
        <PrivateLayout>
          <p>Dashboard</p>
        </PrivateLayout>
      </Provider>,
    );

    expect(mocks.replace).toHaveBeenCalledWith("/login");
    expect(container).toBeEmptyDOMElement();
  });

  it("redirects pending verification users to check-email", () => {
    const store = makeStore();
    store.dispatch(sessionRestored({
      email: "person@example.com",
      id: "6fffb4d8-ae0a-42bc-8154-80a118b36644",
      status: "PENDING_VERIFICATION",
      username: "person",
    } as never));

    render(
      <Provider store={store}>
        <PrivateLayout>
          <p>Dashboard</p>
        </PrivateLayout>
      </Provider>,
    );

    expect(mocks.replace).toHaveBeenCalledWith("/check-email");
  });

  it("renders protected content for active users", () => {
    const store = makeStore();
    store.dispatch(sessionRestored({
      email: "person@example.com",
      id: "6fffb4d8-ae0a-42bc-8154-80a118b36644",
      status: "ACTIVE",
      username: "person",
    } as never));

    const { getByText } = render(
      <Provider store={store}>
        <PrivateLayout>
          <p>Dashboard</p>
        </PrivateLayout>
      </Provider>,
    );

    expect(getByText("Dashboard")).toBeInTheDocument();
    expect(getByText("Header")).toBeInTheDocument();
  });
});
