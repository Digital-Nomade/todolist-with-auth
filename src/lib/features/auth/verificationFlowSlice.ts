import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { VerificationFlowSnapshot } from "./verificationFlow";

type VerificationFlowState = {
  email: string | null;
  message: string | null;
  resendAvailableAt: number | null;
};

const initialState: VerificationFlowState = {
  email: null,
  message: null,
  resendAvailableAt: null,
};

export const verificationFlowSlice = createSlice({
  name: "verificationFlow",
  initialState,
  reducers: {
    verificationFlowStarted: (state, { payload }: PayloadAction<VerificationFlowSnapshot>) => {
      state.email = payload.email;
      state.message = payload.message;
      state.resendAvailableAt = payload.resendAvailableAt;
    },
    verificationFlowCleared: (state) => {
      state.email = null;
      state.message = null;
      state.resendAvailableAt = null;
    },
  },
});

export const {
  verificationFlowCleared,
  verificationFlowStarted,
} = verificationFlowSlice.actions;

export default verificationFlowSlice.reducer;
