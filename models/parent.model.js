import {Schema , model, models} from "mongoose"
const parentSchema = new Schema({
    Name:{
        type:String,  
    },
    Email:{
        type:String,
    },
    Phone:{
        type:Number,
    },
    Profession:{
        type:String,
    },
    Address:{
        type:String,
    },
    photo: {
        type: String,
        default: ''
    },
    
},{timestamps:true})

export const Parent = models.Parent || model("Parent",parentSchema)