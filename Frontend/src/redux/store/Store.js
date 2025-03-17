import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "../slices/Sidebarslice.js"
import authReducer from "../slices/Authslice.js"

export const store = configureStore({
    reducer: {
        sidebar: sidebarReducer,
        auth: authReducer,
    }
})
