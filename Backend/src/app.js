import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// .use used to add middlewares and configurations
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials : true //option allows cookies to be sent with cross-origin requests.
}))

app.use(express.json({limit: "16kb"})) // Middleware to parse incoming JSON requests with a size limit of 16 kilobytes. This is useful for handling JSON payloads in POST requests.
app.use(express.urlencoded({extended: true, limit: "16kb"})) // Middleware to parse incoming URL-encoded data (like form submissions). extended: true allows for rich objects and arrays to be encoded. The size limit is also 16 kilobytes.
app.use(express.static("public"))  // Serves static files (like HTML, CSS, JavaScript) from the public directory. This means any files placed in the public folder can be accessed directly via their URL.
app.use(cookieParser())


// routes import
import userRouter from "./routes/user.routes.js"
// import videoRouter from "./routes/video.routes.js"

// routes declaration
app.use("/api/v1/users", userRouter)
// app.use("/api/v1/videos", videoRouter)
// // ex. = http://localhost:8000/api/v1/users/register

export { app }