import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

const allowedOrigins = [
    "http://localhost:5173",  // For local testing
    "https://youtube-three-snowy.vercel.app"  // Your deployed frontend
];

// .use used to add middlewares and configurations
app.use(cors({
    origin: allowedOrigins,
    credentials : true //option allows cookies to be sent with cross-origin requests.
}))

app.use(express.json({limit: "16kb"})) // Middleware to parse incoming JSON requests with a size limit of 16 kilobytes. This is useful for handling JSON payloads in POST requests.
app.use(express.urlencoded({extended: true, limit: "16kb"})) // Middleware to parse incoming URL-encoded data (like form submissions). extended: true allows for rich objects and arrays to be encoded. The size limit is also 16 kilobytes.
app.use(express.static("public"))  // Serves static files (like HTML, CSS, JavaScript) from the public directory. This means any files placed in the public folder can be accessed directly via their URL.
app.use(cookieParser()) //Parses cookies from the incoming request Useful for authentication (JWT in cookies, session managemen


// routes import
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import likeRouter from "./routes/like.routes.js"
import commentRouter from "./routes/comment.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import viewsRoutes from "./routes/views.routes.js"
import watchlaterRoutes from "./routes/watchlater.routes.js"
import tweetcommentRoutes from "./routes/tweetcomment.routes.js"
import recommendationRoutes from "./routes/userinteraction.routes.js"
import dashboardRoutes from "./routes/dashboard.routes.js"

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/views", viewsRoutes);
app.use("/api/v1/watchlater", watchlaterRoutes);
app.use("/api/v1/tweetcomment", tweetcommentRoutes);
app.use("/api/v1/recommendation", recommendationRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// // ex. = http://localhost:8000/api/v1/users/register
import { errorHandler } from "./middlewares/errorHandler.js";
app.use(errorHandler);  

export { app }