import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { makeStore } from "@/lib/store";

export function renderWithProviders(ui: ReactElement) {
  const store = makeStore();
  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>),
  };
}
