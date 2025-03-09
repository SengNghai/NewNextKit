import { configureStore } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";
import * as slices from "./slices";

type State = Record<string, unknown>;
type TransformedState = Record<string, unknown>;

const logger = createLogger({
  // 配置选项
  stateTransformer: (state: State): TransformedState =>
    Object.entries(state).reduce((newState, [key, value]) => {
      if (
        value &&
        typeof value === "object" &&
        "toJS" in (value as Record<string, unknown>) &&
        typeof (value as { toJS: unknown }).toJS === "function"
      ) {
        // 检查是否存在 toJS 方法并调用
        newState[key] = (value as { toJS: () => unknown }).toJS();
      } else {
        newState[key] = value;
      }
      return newState;
    }, {} as TransformedState),
});

export const store = configureStore({
  reducer: {
    counter: slices.counterSlice.reducer,
    globalData: slices.globalDataSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
