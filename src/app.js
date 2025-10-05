import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/user.route.js"
import tweetRoute from "./routes/tweet.route.js"
import videoRoute from "./routes/video.route.js"
import commentRoute from "./routes/comment.route.js"
import playlistRoute from "./routes/playlist.route.js"

const app = express()
app.use(cors({
    origin:process.env.CORS,
    credentials:true
}))

// Configuration settings
app.use(express.json({   // It is used to accept json data from client
    limit:"16kb"
}))

app.use(express.urlencoded({    // It is used to accept form data  
    extended:true,
    limit:"16kb"
}))

app.use(express.static("public"))  // This config is used to store pdf, file locally
app.use(cookieParser())

// Routes Import 

app.get("/", (req, res) => {
    res.send("Hello World!");
});


// Routes Declarations
app.use('/api/v1/users',userRoutes)
app.use('/api/v1/tweets',tweetRoute)
app.use('/api/v1/video',videoRoute)
app.use('/api/v1/comments',commentRoute)
app.use('/api/v1/playlist',playlistRoute)

export {app}