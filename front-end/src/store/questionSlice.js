import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

export const fetchQuestions = createAsyncThunk('questions/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await axiosClient.get('/question');
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue('Failed to fetch questions');
  }
});

// Lấy thông báo lỗi do server trả về (vd. "options: A question needs at least 2 options")
const serverMessage = (err, fallback) => err.response?.data?.message || fallback;

// Tạo câu hỏi rời, không thuộc quiz nào
export const createQuestion = createAsyncThunk('questions/create', async (questionData, thunkAPI) => {
  try {
    const response = await axiosClient.post('/question', questionData);
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(serverMessage(err, 'Failed to create question'));
  }
});

// Tạo câu hỏi và gắn luôn vào một quiz (backend trả về câu hỏi vừa tạo)
export const createQuestionInQuiz = createAsyncThunk(
  'questions/createInQuiz',
  async ({ quizId, questionData }, thunkAPI) => {
    try {
      const response = await axiosClient.post(`/quizzes/${quizId}/question`, questionData);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(serverMessage(err, 'Failed to create question'));
    }
  }
);

// Gắn một câu hỏi ĐÃ CÓ vào quiz (không tạo câu hỏi mới)
export const attachQuestionToQuiz = createAsyncThunk(
  'questions/attachToQuiz',
  async ({ quizId, questionId }, thunkAPI) => {
    try {
      const response = await axiosClient.post(`/quizzes/${quizId}/question/${questionId}`);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(serverMessage(err, 'Failed to add question to quiz'));
    }
  }
);

export const updateQuestion = createAsyncThunk('questions/update', async ({ id, questionData }, thunkAPI) => {
  try {
    const response = await axiosClient.put(`/question/${id}`, questionData);
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(serverMessage(err, 'Failed to update question'));
  }
});

export const deleteQuestion = createAsyncThunk('questions/delete', async (id, thunkAPI) => {
  try {
    await axiosClient.delete(`/question/${id}`);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue('Failed to delete question');
  }
});

const questionSlice = createSlice({
  name: 'questions',
  initialState: { list: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(createQuestionInQuiz.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const idx = state.list.findIndex((q) => q._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.list = state.list.filter((q) => q._id !== action.payload);
      });
  }
});

export default questionSlice.reducer;