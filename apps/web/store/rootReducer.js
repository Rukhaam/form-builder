import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import formEditorReducer from './slices/formEditorSlice.js';

// 1. Combine all your individual slices here
const appReducer = combineReducers({
  auth: authReducer,
  formEditor: formEditorReducer,
});

// 2. Wrap it in a Root Reducer to intercept global actions
const rootReducer = (state, action) => {
  if (action.type === 'auth/logoutSuccess') {
    state = undefined; 
  }

  return appReducer(state, action);
};

export default rootReducer;