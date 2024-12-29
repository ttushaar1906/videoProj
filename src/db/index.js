import mongoose from "mongoose";
import { dbName } from "../constant.js";

const connectDB = async()=>{
    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGO_URL}/${dbName}`)
       console.log(`Database connected !! DB Host : ${connectionInstance.connection.host}`);
       
    } catch (error) {
        console.log(`Failed to connect with DB !!`);
        process.exit(1)
    }
}

export default connectDB