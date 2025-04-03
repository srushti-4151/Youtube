import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "../slices/Sidebarslice.js"
import authReducer from "../slices/Authslice.js"
import themeReducer from "../slices/ThemeSlice.js"
import videoReducer from "../slices/Videoslice.js"
import subscriptionreducer from "../slices/Subscriptionslice.js"
import commentreducer from "../slices/CommentSlice.js"
import likeReducer from "../slices/Likeslice.js"
import playlistsReducer from "../slices/PlaylistSlice.js"
import viewsReducer from "../slices/ViewSlice.js"
import watchLaterReducer from "../slices/watchLaterSlice.js";
import tweetsReducer from "../slices/TweetSlice.js"
import tweetcommentsReducer from "../slices/TweetCommentSlice.js"

export const store = configureStore({
    reducer: {
        sidebar: sidebarReducer,
        auth: authReducer,
        theme: themeReducer,
        videos: videoReducer,
        subscriptions : subscriptionreducer,
        comments : commentreducer,
        like: likeReducer,
        playlists: playlistsReducer,
        views: viewsReducer,
        watchLater : watchLaterReducer,
        tweets : tweetsReducer,
        tweetcomments : tweetcommentsReducer,
    }
})
