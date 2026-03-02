import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PaperState {
  step: number;
  loading: boolean;
  classes: any[];
  fullData: Record<string, any>;
  selection: {
    classId: string | null;
    className: string | null;
    subject: any | null;
    chapters: any[];
    topics: string[];
  };
}

const initialState: PaperState = {
  step: 1,
  loading: true,
  classes: [],
  fullData: {},
  selection: {
    classId: null,
    className: null,
    subject: null,
    chapters: [],
    topics: [],
  },
};

export const paperSlice = createSlice({
  name: 'paper',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setInitialData: (state, action: PayloadAction<{ classes: any[], dataMap: any }>) => {
      state.classes = action.payload.classes;
      state.fullData = action.payload.dataMap;
      state.loading = false;
    },
    selectClass: (state, action: PayloadAction<{ id: string, title: string }>) => {
      state.selection.classId = action.payload.id;
      state.selection.className = action.payload.title;
      state.step = 2;
    },
    selectSubject: (state, action: PayloadAction<any>) => {
      state.selection.subject = action.payload;
      state.step = 3;
    },
    toggleChapter: (state, action: PayloadAction<any>) => {
      const chapter = action.payload;
      const chName = chapter.name || chapter;
      const index = state.selection.chapters.findIndex(c => (c.name || c) === chName);

      if (index !== -1) {
        // Remove chapter and its topics
        state.selection.chapters.splice(index, 1);
        const chTopics = chapter.topics?.map((t: any) => typeof t === 'string' ? t : t.name) || [];
        state.selection.topics = state.selection.topics.filter(t => !chTopics.includes(t));
      } else {
        state.selection.chapters.push(chapter);
      }
    },
    toggleTopic: (state, action: PayloadAction<{ topicName: string, chapter: any }>) => {
      const { topicName, chapter } = action.payload;
      const isTopicSelected = state.selection.topics.includes(topicName);

      if (isTopicSelected) {
        state.selection.topics = state.selection.topics.filter(t => t !== topicName);
      } else {
        state.selection.topics.push(topicName);
        // Automatically select chapter if a topic is picked
        const chName = chapter.name || chapter;
        const isChapterSelected = state.selection.chapters.find(c => (c.name || c) === chName);
        if (!isChapterSelected) state.selection.chapters.push(chapter);
      }
    },
    handleBack: (state) => {
      if (state.step === 3) {
        state.step = 2;
        state.selection.chapters = [];
        state.selection.topics = [];
        state.selection.subject = null;
      } else if (state.step === 2) {
        state.step = 1;
        state.selection.classId = null;
        state.selection.className = null;
      }
    },
    resetStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload;
    }
  }
});

export const { 
  setLoading, setInitialData, selectClass, selectSubject, 
  toggleChapter, toggleTopic, handleBack, resetStep 
} = paperSlice.actions;

export default paperSlice.reducer;