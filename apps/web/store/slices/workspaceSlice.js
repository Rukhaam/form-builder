import { createSlice } from "@reduxjs/toolkit";

// Safely read from localStorage (SSR-safe)
function getPersistedWorkspaceId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("activeWorkspaceId") || null;
}

const initialState = {
  workspaces: [],
  activeWorkspaceId: getPersistedWorkspaceId(),
  isLoading: false,
};

export const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setWorkspaces: (state, action) => {
      state.workspaces = action.payload;
      state.isLoading = false;

      // If no active workspace is set, default to the first one
      if (!state.activeWorkspaceId && action.payload.length > 0) {
        state.activeWorkspaceId = action.payload[0].workspaceId;
        if (typeof window !== "undefined") {
          localStorage.setItem("activeWorkspaceId", action.payload[0].workspaceId);
        }
      }

      // If the currently active workspace is no longer in the list, reset
      if (
        state.activeWorkspaceId &&
        !action.payload.find((w) => w.workspaceId === state.activeWorkspaceId)
      ) {
        state.activeWorkspaceId = action.payload.length > 0 ? action.payload[0].workspaceId : null;
        if (typeof window !== "undefined") {
          if (state.activeWorkspaceId) {
            localStorage.setItem("activeWorkspaceId", state.activeWorkspaceId);
          } else {
            localStorage.removeItem("activeWorkspaceId");
          }
        }
      }
    },

    setActiveWorkspace: (state, action) => {
      state.activeWorkspaceId = action.payload;
      if (typeof window !== "undefined") {
        if (action.payload) {
          localStorage.setItem("activeWorkspaceId", action.payload);
        } else {
          localStorage.removeItem("activeWorkspaceId");
        }
      }
    },

    setWorkspaceLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    clearWorkspaces: (state) => {
      state.workspaces = [];
      state.activeWorkspaceId = null;
      state.isLoading = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("activeWorkspaceId");
      }
    },
  },
});

export const {
  setWorkspaces,
  setActiveWorkspace,
  setWorkspaceLoading,
  clearWorkspaces,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
