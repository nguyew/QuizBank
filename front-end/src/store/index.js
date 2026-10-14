import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import quizReducer from './quizSlice';
import questionReducer from './questionSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    quizzes: quizReducer,
    questions: questionReducer
  }
});

export default store;