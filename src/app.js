import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

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

import userRoutes from "./routes/user.route.js"

// Routes Declarations
app.use('/api/v1/users',userRoutes)

export {app}