import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  formId: null, 
  title: 'Untitled Form',
  description: '',
  visibility: 'PUBLIC',
  status: 'DRAFT',
  password: null,
  expiresAt: null,
  maxResponses: null,
  oneResponsePerPerson: false,
  category: '',
  coverImageUrl: '',
  theme: 'light',
  fields: [],
  activeFieldId: null, 
  isSaving: false,
};

export const formEditorSlice = createSlice({
  name: 'formEditor',
  initialState,
  reducers: {
    // 1. Load an existing form from the database into Redux
    loadForm: (state, action) => {
      const { id, title, description, visibility, status, expiresAt, maxResponses, oneResponsePerPerson, password, category, coverImageUrl, theme, fields } = action.payload;
      state.formId = id;
      state.title = title;
      state.description = description || '';
      state.visibility = visibility || 'PUBLIC';
      state.status = status || 'DRAFT';
      state.password = password || null;
      state.expiresAt = expiresAt || null;
      state.maxResponses = maxResponses || null;
      state.oneResponsePerPerson = oneResponsePerPerson || false;
      state.category = category || '';
      state.coverImageUrl = coverImageUrl || '';
      state.theme = theme || 'light';
      state.fields = fields || [];
      state.activeFieldId = null;
    },
    // 2. Reset back to a blank slate (for "Create New")
    resetForm: () => ({ ...initialState, fields: [] }),
    
    // 3. Update the main form details
    updateMetadata: (state, action) => {
      const { title, description, visibility, status, expiresAt, maxResponses, oneResponsePerPerson, password, category, coverImageUrl, theme } = action.payload;
      if (title !== undefined) state.title = title;
      if (description !== undefined) state.description = description;
      if (visibility !== undefined) state.visibility = visibility;
      if (status !== undefined) state.status = status;
      if (expiresAt !== undefined) state.expiresAt = expiresAt;
      if (maxResponses !== undefined) state.maxResponses = maxResponses;
      if (oneResponsePerPerson !== undefined) state.oneResponsePerPerson = oneResponsePerPerson;
      if (password !== undefined) state.password = password;
      if (category !== undefined) state.category = category;
      if (coverImageUrl !== undefined) state.coverImageUrl = coverImageUrl;
      if (theme !== undefined) state.theme = theme;
    },

    // 4. Add a new field to the bottom of the canvas
    addField: (state, action) => {
      const type = action.payload.type;
      const hasOptions = ['single_select', 'multi_select', 'checkbox'].includes(type);
      const newField = {
        id: action.payload.id,
        type,
        label: 'New Question',
        required: false,
        order: state.fields.length,
        options: hasOptions ? ['Option 1', 'Option 2'] : null,    
      };
      state.fields.push(newField);
      state.activeFieldId = newField.id; 
    },

   
    updateField: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.fields.findIndex(f => f.id === id);
      if (index !== -1) {
        state.fields[index] = { ...state.fields[index], ...updates };
      }
    },

    // 6. Delete a field
    removeField: (state, action) => {
      state.fields = state.fields.filter(f => f.id !== action.payload);
      state.fields = state.fields.map((field, index) => ({ ...field, order: index }));
      if (state.activeFieldId === action.payload) {
        state.activeFieldId = null;
      }
    },

    // 7. Reorder fields (called by our Drag and Drop engine later)
    reorderFields: (state, action) => {
      state.fields = action.payload; // Payload will be the new sorted array
    },

    setActiveField: (state, action) => {
      state.activeFieldId = action.payload;
    }
  },
});

export const { 
  loadForm, resetForm, updateMetadata, 
  addField, updateField, removeField, reorderFields, setActiveField 
} = formEditorSlice.actions;

export default formEditorSlice.reducer;
