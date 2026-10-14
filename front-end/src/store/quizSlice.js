import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

export const fetchQuizzes = createAsyncThunk('quizzes/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await axiosClient.get('/quizzes');
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue('Failed to fetch quizzes');
  }
});

export const fetchQuizById = createAsyncThunk('quizzes/fetchById', async (quizId, thunkAPI) => {
  try {
    const response = await axiosClient.get(`/quizzes/${quizId}`);
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue('Failed to fetch quiz');
  }
});

const quizSlice = createSlice({
  name: 'quizzes',
  initialState: {
    list: [],
    current: null,
    status: 'idle',
    error: null
  },
  reducers: {
    clearCurrentQuiz: (state) => {
      state.current = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchQuizById.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { clearCurrentQuiz } = quizSlice.actions;
export default quizSlice.reducer;