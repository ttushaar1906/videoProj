import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
app.use(({
    origin:process.env.CORS,
    credentials:true
}))

// Configuration settings
app.use(express.json({
    limit:"16kb"
}))

app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))

app.use(express.static("public"))  // This config is used to store pdf, file locally



export {app}