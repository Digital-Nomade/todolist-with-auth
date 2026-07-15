import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthData, AuthUser } from "./authTypes";

const initialState: AuthData = {
  initialized: false,
  isAuthenticated: false,
  user: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionRestored: (state, { payload }: PayloadAction<AuthUser>) => {
      state.initialized = true;
      state.isAuthenticated = payload.status === "ACTIVE";
      state.user = payload;
    },
    sessionCleared: (state) => {
      state.initialized = true;
      state.isAuthenticated = false;
      state.user = null;
    },
    initializationFinished: (state) => {
      state.initialized = true;
    },
  },
});

export const {
  initializationFinished,
  sessionCleared,
  sessionRestored,
} = authSlice.actions;

export default authSlice.reducer;