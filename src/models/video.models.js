import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema({
    videoFile: {
        type: Stirng , //cloudinary url
        required: true,
    },
    thumbnail: {
        type: Stirng , 
        required: true,
    },
    title: {
        type: Stirng , 
        required: true,
    },
    description: {
        type: Stirng , 
        required: true,
    },
    duration: {
        type: Number, 
        required: true,
    },
    views: {
        type: Number, 
        default: 0,
    },
    ispublished: {
        type: Boolean,
        default: true,
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true}
)

videoSchema.plugin(mongooseAggregatePaginate)


export const Vidoe = mongoose.model("Video", videoSchema)