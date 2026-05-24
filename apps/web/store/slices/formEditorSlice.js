import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  formId: null, // null means it's a new form
  title: 'Untitled Form',
  description: '',
  visibility: 'PUBLIC',
  status: 'DRAFT',
  password: null,
  expiresAt: null,
  maxResponses: null,
  category: '',
  fields: [], // Array of objects: { id, type, label, required, options, order }
  activeFieldId: null, // For highlighting the field currently being edited
  isSaving: false,
};

export const formEditorSlice = createSlice({
  name: 'formEditor',
  initialState,
  reducers: {
    // 1. Load an existing form from the database into Redux
    loadForm: (state, action) => {
      const { id, title, description, visibility, status, expiresAt, maxResponses, password, category, fields } = action.payload;
      state.formId = id;
      state.title = title;
      state.description = description || '';
      state.visibility = visibility || 'PUBLIC';
      state.status = status || 'DRAFT';
      state.password = password || null;
      state.expiresAt = expiresAt || null;
      state.maxResponses = maxResponses || null;
      state.category = category || '';
      state.fields = fields || [];
      state.activeFieldId = null;
    },
    // 2. Reset back to a blank slate (for "Create New")
    resetForm: () => ({ ...initialState, fields: [] }),
    
    // 3. Update the main form details
    updateMetadata: (state, action) => {
      const { title, description, visibility, status, expiresAt, maxResponses, password, category } = action.payload;
      if (title !== undefined) state.title = title;
      if (description !== undefined) state.description = description;
      if (visibility !== undefined) state.visibility = visibility;
      if (status !== undefined) state.status = status;
      if (expiresAt !== undefined) state.expiresAt = expiresAt;
      if (maxResponses !== undefined) state.maxResponses = maxResponses;
      if (password !== undefined) state.password = password;
      if (category !== undefined) state.category = category;
    },

    // 4. Add a new field to the bottom of the canvas
    addField: (state, action) => {
      const type = action.payload.type;
      const hasOptions = ['single_select', 'multi_select', 'checkbox'].includes(type);
      const newField = {
        id: action.payload.id, // We'll pass a UUID here
        type,
        label: 'New Question',
        required: false,
        order: state.fields.length,
        options: hasOptions ? ['Option 1', 'Option 2'] : null,    
      };
      state.fields.push(newField);
      state.activeFieldId = newField.id; // Auto-select the new field
    },

    // 5. Update a specific field's settings (label, required, etc.)
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
