import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // --- LOGIN / REGISTER FLOW ---
    authStart: (state) => {
      state.isLoading = true;
      state.isSuccess = false;
      state.isError = false;
      state.errorMessage = null;
    },
    setCredentials: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    },
    authFail: (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.errorMessage = action.payload; 
    },

    // --- LOGOUT FLOW ---
    logoutStart: (state) => {
      state.isLoading = true;
      state.isSuccess = false;
      state.isError = false;
      state.errorMessage = null;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    },
    logoutFail: (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.errorMessage = action.payload;
    },

    // --- UTILITY ---
    resetAuthStatus: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.errorMessage = null;
    },
  },
});

export const {
  authStart,
  setCredentials,
  authFail,
  logoutStart,
  logoutSuccess,
  logoutFail,
  resetAuthStatus,
} = authSlice.actions;

export default authSlice.reducer;