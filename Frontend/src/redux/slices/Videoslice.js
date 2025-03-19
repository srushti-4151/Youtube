// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { fetchAllVideos } from "../../api/VideoApi.js";

// // Fetch videos from API
// export const getVideos = createAsyncThunk("videos/fetchAll", async (_, thunkAPI) => {
//   try {
//     const data = await fetchAllVideos();
//     return data;
//   } catch (error) {
//     return thunkAPI.rejectWithValue("Failed to fetch videos");
//   }
// });

// const videoSlice = createSlice({
//   name: "videos",
//   initialState: {
//     videos: [],
//     loading: false,
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(getVideos.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(getVideos.fulfilled, (state, action) => {
//         state.loading = false;
//         state.videos = action.payload.data || []; // Assuming API returns { data: [...] }
//       })
//       .addCase(getVideos.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export default videoSlice.reducer;
