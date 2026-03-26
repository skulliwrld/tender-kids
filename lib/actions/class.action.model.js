// CREATING CLASS IN OUR MODEL
"use server"
import mongoose from 'mongoose';
import { Class } from "@/models/class.model";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectToDB } from "../Database/connectToDB";

export const addClass = async (FormData) =>{
 
    const {Name,number,assignedTeacher} = Object.fromEntries(FormData)
    
    // Only set assignedTeacher if it's a valid ObjectId
    let teacherId = undefined;
    if (assignedTeacher && assignedTeacher.trim() !== '') {
      try {
        teacherId = new mongoose.Types.ObjectId(assignedTeacher.trim());
      } catch (e) {
        // Invalid ObjectId format, leave as undefined
      }
    }
    
    try {
        connectToDB()
        const NewClass = new Class({
            name:Name,
            numericId:number,
        })
        
        // Only add assignedTeacher if it's valid
        if (teacherId) {
            NewClass.assignedTeacher = teacherId;
        }

        await NewClass.save()
        if(NewClass.ok){
            console.log("it is okay----")
        }
    } catch (error) {
       console.log(error.message) 
    }

    revalidatePath("/class")
    redirect("/class")
 }


 export const ClassUpdate = async (FormData) =>{
    const  {id,name , numericId , assignedTeacher} = Object.fromEntries(FormData)
    
    // Only set assignedTeacher if it's a valid ObjectId
    let teacherId = undefined;
    if (assignedTeacher && assignedTeacher.trim() !== '') {
      try {
        teacherId = new mongoose.Types.ObjectId(assignedTeacher.trim());
      } catch (e) {
        // Invalid ObjectId format, leave as undefined
      }
    }
    
    try {
        connectToDB()
        const updateClassFieds = {
            name, 
            numericId
        }
        
        // Only add assignedTeacher if it's valid
        if (teacherId) {
            updateClassFieds.assignedTeacher = teacherId;
        }

        await Class.findByIdAndUpdate(id,updateClassFieds)

    } catch (error) {
        console.log(error)
        
    }
    
    // revalidatePath("/class")
    redirect(`/class`)
}

// DELETING PRODUCT AND USER FUNCTION
export const deleteClass = async (FormData) =>{

    const {id} = Object.fromEntries(FormData);
    try {
        connectToDB();
        await Class.findByIdAndDelete(id)
    } catch (error) {
        console.log(error)
        throw new Error("Failed to Delete Product")
    }
    revalidatePath("/class")
    redirect("/class")
}
