// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js"

dotenv.config({
    path:"./env"
})

connectDB()
.then(()=>{
    const port = process.env.PORT || 8000
    app.listen(port,()=>{
        console.log(`Server started and running at port $port}`);
    })
})
.catch((err)=>{
    console.log(`Failed to connect with DB ${err}`);
})