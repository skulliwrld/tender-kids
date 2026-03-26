"use server"
import { connectToDB } from "../Database/connectToDB"
import { Teacher } from "@/models/teacher.model"
import { Student } from "@/models/student.model"
import { Class } from "@/models/class.model"
import { Timetable } from "@/models/timetable.model"
import { Day } from "@/models/day.model"
import User from "@/models/user.model"
import bcrypt from 'bcrypt'
import { revalidatePath } from "next/cache";



export const FetchTeachers = async (q) =>{
    try{
        await connectToDB();

        let query = {}
        
        if (q && q.trim()) {
            const regex = new RegExp(q.trim(), "i")
            query = { 
                $or: [
                    { name: { $regex: regex } },
                    { email: { $regex: regex } }
                ]
            }
        }

        const Teachers =  await Teacher.find(query)
            .sort({ createdAt: -1 })
            .lean()
        
        return {Teachers: JSON.parse(JSON.stringify(Teachers))}
    
    
    }catch(error){
        console.log("Error fetching teachers:", error)
        return {Teachers: []}
    }
}


export const addTeacher = async (FormData) =>{
  
    const formDataObj = Object.fromEntries(FormData.entries())
    const {title, name, DOB, gender, address, phone, email, password, photo} = formDataObj
    
    if (!name || !email || !password) {
      return { error: 'Please fill in all required fields' }
    }
    
    try {
        await connectToDB()
        
        const existingTeacher = await Teacher.findOne({ email })
        if (existingTeacher) {
            return { error: 'A teacher with this email already exists' }
        }
        
        // Parse phone - handle empty strings, whitespace, and invalid values
        let phoneNumber = null;
        if (phone && typeof phone === 'string') {
            const trimmedPhone = phone.trim();
            if (trimmedPhone !== '') {
                const parsed = Number(trimmedPhone);
                if (!isNaN(parsed)) {
                    phoneNumber = parsed;
                }
            }
        }

        const teacherData = {
            title: title || '',
            name,
            DOB: DOB || '',
            gender: gender || '',
            address: address || '',
            email,
            password,
            phone: phoneNumber,
            photo: photo || ''
        }

        const NewTeacher = new Teacher(teacherData)
        await NewTeacher.save()

        const existingUser = await User.findOne({ email })
        if (!existingUser) {
            const hashedPassword = await bcrypt.hash(password, 10)
            const newUser = new User({
                name: title ? `${title} ${name}` : name,
                email,
                password: hashedPassword,
                role: 'teacher'
            })
            await newUser.save()
        }

    } catch (error) {
       console.log("Error adding teacher:", error)
       return { error: 'Failed to add teacher' }
    }

    revalidatePath("/teacher")
  }


 export  const fetchIndividualTeacherData = async (id) =>{
    try {
        await connectToDB()
        const Teachers = await Teacher.findById(id)
        return Teachers
    } catch (error) {
        console.log(error)   
    }
}


export const TeacherUpdate = async (FormData) =>{
    const  {id, title, name, DOB, gender, address, phone, email, password, photo} = Object.fromEntries(FormData.entries())
    
    if (!id) {
      console.log("Missing teacher ID")
      return { error: 'Missing teacher ID' }
    }
    
    try {
        await connectToDB()
        
        const existingTeacher = await Teacher.findById(id)
        if (!existingTeacher) {
            return { error: 'Teacher not found' }
        }

        const oldEmail = existingTeacher.email
        
        // Parse phone - handle empty strings, whitespace, and invalid values
        let phoneNumber = undefined;
        if (phone && typeof phone === 'string') {
            const trimmedPhone = phone.trim();
            if (trimmedPhone !== '') {
                const parsed = Number(trimmedPhone);
                if (!isNaN(parsed)) {
                    phoneNumber = parsed;
                }
            }
        }
        
        const updateTeacherFieds = {
            title, 
            name, 
            DOB, 
            gender, 
            address, 
            email,
            photo
        }
        
        // Only include phone in update if it's a valid number
        if (phoneNumber !== undefined) {
            updateTeacherFieds.phone = phoneNumber
        }

        if (password && password.trim() !== '') {
            updateTeacherFieds.password = await bcrypt.hash(password, 10)
        }

        Object.keys(updateTeacherFieds).forEach((key) => {
            if (updateTeacherFieds[key] === "" || updateTeacherFieds[key] === undefined) {
                delete updateTeacherFieds[key]
            }
        });

        await Teacher.findByIdAndUpdate(id, updateTeacherFieds)

        const userUpdateFields = {
            name: title ? `${title} ${name}` : name,
            email
        }

        if (password && password.trim() !== '') {
            userUpdateFields.password = await bcrypt.hash(password, 10)
        }

        await User.findOneAndUpdate(
            { email: oldEmail, role: 'teacher' },
            userUpdateFields
        )

    } catch (error) {
        console.log("Error updating teacher:", error)
        return { error: 'Failed to update teacher' }
    }
    
    revalidatePath("/teacher")
}


export const deleteTeacher = async (FormData) =>{

    const {id} = Object.fromEntries(FormData);
    try {
        connectToDB();
        await Teacher.findByIdAndDelete(id)
    } catch (error) {
        console.log(error)
        throw new Error("Failed to Delete Product")
    }
    revalidatePath("/teacher")
}

// ===== TEACHER DASHBOARD FUNCTIONS =====

export const getTeacherDashboardStats = async (teacherEmail) => {
    try {
        await connectToDB()

        const teacher = await Teacher.findOne({ email: teacherEmail })
        
        if (!teacher) {
            return {
                totalStudents: 0,
                activeClasses: 0,
                pendingAssignments: 0
            }
        }

        const teacherClasses = await Class.find({ assignedTeacher: teacher._id }).distinct('_id')

        const totalStudents = await Student.countDocuments({
            Class: { $in: teacherClasses }
        })

        const activeClasses = await Class.countDocuments({
            assignedTeacher: teacher._id,
        })

        const pendingAssignments = 0

        return {
            totalStudents,
            activeClasses,
            pendingAssignments
        }
    } catch (error) {
        console.error('Error fetching teacher dashboard stats:', error)
        return {
            totalStudents: 0,
            activeClasses: 0,
            pendingAssignments: 0
        }
    }
}

// fetch all classes assigned to a teacher
export const getClassesByTeacher = async (teacherEmail) => {
    try {
        await connectToDB()
        
        const teacher = await Teacher.findOne({ email: teacherEmail })
        
        if (!teacher) {
            return []
        }
        
        const classes = await Class.find({ assignedTeacher: teacher._id })
        return JSON.parse(JSON.stringify(classes))
    } catch (error) {
        console.error('Error fetching teacher classes:', error)
        return []
    }
}

export const getTeacherClasses = async (teacherEmail) => {
    try {
        await connectToDB()
        
        const teacher = await Teacher.findOne({ email: teacherEmail })
        
        if (!teacher) {
            return []
        }
        
        const classes = await Class.find({ assignedTeacher: teacher._id })
        
        const classesWithStudents = await Promise.all(
            classes.map(async (cls) => {
                const students = await Student.find({ Class: cls._id })
                    .sort({ Name: 1 })
                return {
                    ...cls.toObject(),
                    studentCount: students.length,
                    students: JSON.parse(JSON.stringify(students))
                }
            })
        )
        
        return JSON.parse(JSON.stringify(classesWithStudents))
    } catch (error) {
        console.error('Error fetching teacher classes:', error)
        return []
    }
}

// fetch students belonging to a specific class
export const getStudentsByClass = async (classId) => {
    try {
        await connectToDB()
        const mongoose = require('mongoose')
        const classObjectId = new mongoose.Types.ObjectId(classId)
        const students = await Student.find({ Class: classObjectId })
        return JSON.parse(JSON.stringify(students))
    } catch (error) {
        console.error('Error fetching students for class:', error)
        return []
    }
}

export const getTeacherTodaySchedule = async (teacherEmail) => {
    try {
        await connectToDB()

        const teacher = await Teacher.findOne({ email: teacherEmail })
        
        if (!teacher) {
            return []
        }

        // Get current day name (capitalized)
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        
        // Check if today is a valid school day
        if (!validDays.includes(today)) {
            return []
        }

        // Get classes assigned to this teacher
        const teacherClasses = await Class.find({ assignedTeacher: teacher._id }).distinct('_id')

        // Find timetables for classes taught by this teacher on current day
        const todaySchedule = await Timetable.find({
            Class: { $in: teacherClasses },
            day: today
        })
        .populate('Class', 'name')
        .populate('periods.subject', 'Name')
        .sort({ 'Class.name': 1 })

        return JSON.parse(JSON.stringify(todaySchedule))
    } catch (error) {
        console.error('Error fetching teacher schedule:', error)
        return []
    }
}