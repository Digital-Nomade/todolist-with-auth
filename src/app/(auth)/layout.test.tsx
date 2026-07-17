import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Provider } from "react-redux";
import AuthLayout from "./layout";
import { sessionRestored } from "@/lib/features/auth/authSlice";
import { makeStore } from "@/lib/store";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, push: vi.fn() }),
  usePathname: () => "/login",
}));

vi.mock("framer-motion", () => ({
  MotionConfig: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("auth layout", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects active users away from auth screens", () => {
    const store = makeStore();
    store.dispatch(sessionRestored({
      email: "person@example.com",
      id: "6fffb4d8-ae0a-42bc-8154-80a118b36644",
      status: "ACTIVE",
      username: "person",
    } as never));

    const { container } = render(
      <Provider store={store}>
        <AuthLayout>
          <p>Login form</p>
        </AuthLayout>
      </Provider>,
    );

    expect(mocks.replace).toHaveBeenCalledWith("/home");
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

    const { getByText } = render(
      <Provider store={store}>
        <AuthLayout>
          <p>Login form</p>
        </AuthLayout>
      </Provider>,
    );

    expect(mocks.replace).toHaveBeenCalledWith("/check-email");
    expect(getByText("Login form")).toBeInTheDocument();
  });

  it("renders children for guests", () => {
    const store = makeStore();
    const { getByText } = render(
      <Provider store={store}>
        <AuthLayout>
          <p>Login form</p>
        </AuthLayout>
      </Provider>,
    );

    expect(getByText("Login form")).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
