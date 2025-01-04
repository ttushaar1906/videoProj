import _default from "emoji-picker-react/dist/data/emojis";
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
    videoFile:{
        type:String,
        reqired:true
    },
    thumbNail:{
        type:String,
        reqired:true
    },
    title:{
        type:String,
        reqired:true
    },
    description:{
        type:String,
        reqired:true
    },
    duration:{
        type:Number,
        reqired:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    videoOwner:{
        type: Schema.Types.ObjectId,
        ref:"User"
    }
}, { timestamps: true })

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.Model("Video", videoSchema)