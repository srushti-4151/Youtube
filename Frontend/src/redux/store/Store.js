import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "../slices/Sidebarslice.js"
import authReducer from "../slices/Authslice.js"
import themeReducer from "../slices/ThemeSlice.js"
import videoReducer from "../slices/Videoslice.js"


export const store = configureStore({
    reducer: {
        sidebar: sidebarReducer,
        auth: authReducer,
        theme: themeReducer,
        videos: videoReducer,
    }
})
