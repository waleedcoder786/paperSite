import { configureStore } from '@reduxjs/toolkit';
import paperReducer from '../slices/paperSlice';

export const store = configureStore({
  reducer: {
    // Yahan humne bataya ke 'paper' ki state ko 'paperReducer' handle karega
    paper: paperReducer,
  },
  // Middleware wagera yahan aate hain agar zaroorat ho
});

// Ye types TypeScript ke liye hain taake useSelector ko pata ho state mein kya hai
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;