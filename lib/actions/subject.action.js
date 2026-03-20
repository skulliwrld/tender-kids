"use server"
import mongoose from 'mongoose';
import { Subject } from "@/models/subject.model";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectToDB } from "../Database/connectToDB";


// ADDING SUBJECTS TO DB (Master List)
export const addSubject = async (FormData) =>{
 
    const {name,teacher,desc} = Object.fromEntries(FormData)
    try {
        connectToDB()
        const newSubject = new Subject({
            Name:name,
            assignedTeacher:teacher || null,
            description:desc,
            classes: []
        })

        await newSubject.save()
        if(newSubject.ok){
            console.log("it is okay----")
        }
    } catch (error) {
       console.log(error.message) 
    }

    revalidatePath("/subject")
    redirect("/subject")
 }

// FETCH ALL SUBJECTS (Master List)
export const FetchAllSubjects = async (q) =>{
    const regex = new RegExp(q,"i")
    try{
        await connectToDB();
        const subjects = await Subject.find({Name:{$regex:regex}})
            .populate("assignedTeacher", "name")
            .sort({ createdAt: -1 })
        return { subjects: JSON.parse(JSON.stringify(subjects)) }
    }catch(error){
        console.log(error)
        return { subjects: [] }
    }
}

// FETCH SUBJECTS BY CLASS
 export const FetchSubjectByClass = async (class_id, q, page) => {

    const regex = new RegExp(q,"i")
    const ITEMS_PAR_PAGE = 10

    try{
        await connectToDB();

        const classObjectId = new mongoose.Types.ObjectId(class_id);

        const subjects = await Subject.find({
            classes: classObjectId,
            Name: {$regex:regex}
        })
        .populate("assignedTeacher", "name")
        .limit(ITEMS_PAR_PAGE)
        .skip(ITEMS_PAR_PAGE * (page-1))

        return { subjects: JSON.parse(JSON.stringify(subjects)), count: subjects.length }
    
    }catch(error){
        console.log(error)
        return { subjects: [], count: 0 }
    }
}

// ASSIGN SUBJECTS TO A CLASS
export const assignSubjectsToClass = async (classId, subjectIds) => {
    try {
        await connectToDB()
        
        const classObjectId = new mongoose.Types.ObjectId(classId);
        
        // First, remove this class from all subjects
        await Subject.updateMany(
            { classes: classObjectId },
            { $pull: { classes: classObjectId } }
        )
        
        // Then add this class to selected subjects
        if (subjectIds && subjectIds.length > 0) {
            const subjectObjectIds = subjectIds.map(id => new mongoose.Types.ObjectId(id));
            await Subject.updateMany(
                { _id: { $in: subjectObjectIds } },
                { $addToSet: { classes: classObjectId } }
            )
        }
        
        revalidatePath(`/subject/${classId}`)
        revalidatePath("/subject")
        return { success: true }
    } catch (error) {
        console.error('Error assigning subjects:', error)
        return { success: false, error: error.message }
    }
}

// EDITING SUBJECT FORM ACTION.
export const SubjectUpdate = async (FormData) =>{
    const  {id,Name,assignedTeacher,description} = Object.fromEntries(FormData)
    try {
        connectToDB()
        const updateSubjectFieds = {
            Name,
            assignedTeacher: assignedTeacher || null,
            description
        }

        Object.keys(updateSubjectFieds).forEach((key) =>(updateSubjectFieds[key] === "" || undefined) && delete updateSubjectFieds[key]);

        await Subject.findByIdAndUpdate(id,updateSubjectFieds)

    } catch (error) {
        console.log(error)
        
    }
    
    revalidatePath("/subject")
    redirect("/subject")
}

// FETCHING INDIVIDUAL SUBJECT DATA
export  const fetchIndividuaLSubjectData = async (id) =>{
    try {
        await connectToDB()
        const SUBJECTS = await Subject.findById(id).populate("assignedTeacher").populate("classes", "name")
        return SUBJECTS
    } catch (error) {
        console.log(error)   
    }
}

// DELETING SUBJECT FUNCTION
export const deleteSubject = async (FormData) =>{

    const {id} = Object.fromEntries(FormData);
    try {
        connectToDB();
        await Subject.findByIdAndDelete(id)
    } catch (error) {
        console.log(error)
        throw new Error("Failed to Delete Product")
    }
    revalidatePath("/subject")
    redirect("/subject")
}
