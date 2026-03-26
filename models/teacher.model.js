
import {Schema , model, models} from "mongoose"
const TeacherSchema = new Schema({
    title:{
        type:String,
        enum: ['Mr', 'Mrs', 'Miss', ''],
        default: ''
    },
    name:{
        type:String,  
    },
    email:{
        type:String,
    },

    DOB:{
        type:String
    },

    gender:{
        type:String,
    },

    address:{
        type:String,
    },

    password:{
        type:String
    },
    phone:{
        type:Number,
        default: null
    },
    photo:{
        type:String,
        default: ''
    },
  
},{timestamps:true})

export const Teacher = models.Teacher || model("Teacher",TeacherSchema)