"use server"

import { Teacher } from "@/models/teacher.model";
import { Student } from "@/models/student.model";
import { connectToDB } from "../Database/connectToDB";
import { Class } from "@/models/class.model";
import { Subject } from "@/models/subject.model";
import { Day } from "@/models/day.model";
export const fetchTeachers = async (q,page) =>{

    const USER_PAR_PAGE = 5

    const regex = new RegExp(q,"i")
    try{
        await connectToDB();
        const count= await Teacher.find({name:{$regex:regex}}).countDocuments()
        const users =  await Teacher.find({name:{$regex:regex}}).limit(USER_PAR_PAGE).skip(USER_PAR_PAGE * (page -1));
        return {users,count}
    }catch(error){
        console.log(error)
    }
}

// getting all Teachers Data

export const AllTeachersFetch = async () =>{
    try{
        await connectToDB();
        const teachers =  await Teacher.find()
        if(!teachers){
            console.log("there was an issue when getting teachers data")
        }
        return JSON.parse(JSON.stringify(teachers))
    }catch(error){
        console.log(error)
    }
}

export const AllClassFetch = async () =>{
    try{
        await connectToDB();
        const classess =  await Class.find()
        if(!classess){
            console.log("there was an issue when getting teachers data")
        }
        return JSON.parse(JSON.stringify(classess))
    }catch(error){
        console.log(error)
    }
}

export const AllSubjectFetch = async () =>{
    try{
        await connectToDB();
        const Subjects =  await Subject.find()
        if(!Subjects){
            console.log("there was an issue when getting teachers data")
        }
        return JSON.parse(JSON.stringify(Subjects))
    }catch(error){
        console.log(error)
    }
}


export const FetchClasses = async (q, teacherId = null) => {
    try {
        await connectToDB();

        let query = {}
        
        if (q && q.trim()) {
            const regex = new RegExp(q.trim(), "i")
            query = { name: { $regex: regex } }
        }
        
        if (teacherId) {
            query.assignedTeacher = teacherId
        }

        const classes = await Class.find(query)
            .populate('assignedTeacher', 'name')
            .sort({ createdAt: -1 })

        return { classes: JSON.parse(JSON.stringify(classes)) }

    } catch (error) {
        console.log(error)
        return { classes: [] }
    }
}

export  const fetchIndividualClassData = async (id) =>{
    try {
        await connectToDB()
        const { Subject } = require("@/models/subject.model")
        const mongoose = require("mongoose")
        const classObjectId = new mongoose.Types.ObjectId(id)
        
        const CLASS = await Class.findById(id)
        
        // Get subjects assigned to this class
        const subjects = await Subject.find({ classes: classObjectId })
            .populate("assignedTeacher", "name")
        
        const result = JSON.parse(JSON.stringify(CLASS))
        result.subjectList = JSON.parse(JSON.stringify(subjects))
        
        return result
    } catch (error) {
        console.log(error)   
    }
}


export const AllDayFetch = async () =>{
    try{
        await connectToDB();
        const days =  await Day.find()
        if(!days){
            console.log("there was an issue when getting teachers data")
        }
        return JSON.parse(JSON.stringify(days))
    }catch(error){
        console.log(error)
    }
}

export const AllStudentFetch = async () =>{
    try{
        await connectToDB();
        const students =  await Student.find()
        if(!students){
            console.log("there was an issue when getting students data")
        }
        return JSON.parse(JSON.stringify(students))
    }catch(error){
        console.log(error)
    }
}

export const fetchStudentsByClass = async (classId) =>{
    try{
        await connectToDB();
        const students =  await Student.find({ Class: classId })
        if(!students){
            console.log("there was an issue when getting students data")
        }
        return JSON.parse(JSON.stringify(students))
    }catch(error){
        console.log(error)
    }
}

export const fetchIndividualStudentData = async (id) =>{
    try {
        await connectToDB()
        
        // Check if id is a valid ObjectId
        const mongoose = require('mongoose')
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null
        }
        
        const student = await Student.findById(id)
        return JSON.parse(JSON.stringify(student))
    } catch (error) {
        console.log(error)   
    }
}
