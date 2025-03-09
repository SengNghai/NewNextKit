import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GlobalDataState {
  currentDomain: string;
  anotherField: number;
}

const initialState: GlobalDataState = {
  currentDomain: "",
  anotherField: 0,
};

export const globalDataSlice = createSlice({
  name: "globalData",
  initialState,
  reducers: {
    updateGlobalData: (state, action: PayloadAction<GlobalDataState>) => {
      return { ...state, ...action.payload };
    },
  },
});

// export const { updateGlobalData } = globalDataSlice.actions;
// export default globalDataSlice.reducer;
