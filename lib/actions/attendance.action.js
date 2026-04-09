"use server"
import { connectToDB } from "../Database/connectToDB"
import { Student } from "@/models/student.model"
import { Class } from "@/models/class.model"
import Attendance from "@/models/attendance.model"
import { Teacher } from "@/models/teacher.model"
import { revalidatePath } from "next/cache"

export const getStudentsByClassForAttendance = async (classId, date) => {
    try {
        await connectToDB()
        const mongoose = require('mongoose')
        const classObjectId = new mongoose.Types.ObjectId(classId)

        const students = await Student.find({ Class: classObjectId })
            .sort({ Name: 1 })
            .lean()

        const dateObj = new Date(date)
        const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0))
        const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999))

        const attendanceRecords = await Attendance.find({
            class: classObjectId,
            date: { $gte: startOfDay, $lte: endOfDay }
        }).lean()

        const attendanceMap = {}
        attendanceRecords.forEach(record => {
            attendanceMap[record.student.toString()] = record
        })

        const studentsWithAttendance = students.map(student => ({
            ...student,
            attendance: attendanceMap[student._id.toString()] || null
        }))

        return JSON.parse(JSON.stringify(studentsWithAttendance))
    } catch (error) {
        console.error('Error fetching students for attendance:', error)
        return []
    }
}

export const getTeacherClassesForAttendance = async (teacherEmail) => {
    try {
        await connectToDB()
        
        const teacher = await Teacher.findOne({ email: teacherEmail })
        
        if (!teacher) {
            return []
        }
        
        const classes = await Class.find({ assignedTeacher: teacher._id })
        
        return JSON.parse(JSON.stringify(classes))
    } catch (error) {
        console.error('Error fetching teacher classes for attendance:', error)
        return []
    }
}

export const markAttendance = async (formData) => {
    try {
        await connectToDB()
        
        const classId = formData.get('classId')
        const date = formData.get('date')
        const teacherEmail = formData.get('teacherEmail')
        
        const teacher = await Teacher.findOne({ email: teacherEmail })
        
        if (!teacher) {
            return { error: 'Teacher not found' }
        }

        // Verify that the teacher is assigned to this class
        const classRecord = await Class.findOne({
            _id: classId,
            assignedTeacher: teacher._id
        })
        
        if (!classRecord) {
            return { error: 'You are not authorized to mark attendance for this class' }
        }

        const attendanceData = []
        
        formData.forEach((value, key) => {
            if (key.startsWith('attendance_')) {
                const studentId = key.replace('attendance_', '')
                const status = value
                
                attendanceData.push({
                    student: studentId,
                    class: classId,
                    date: new Date(date),
                    status,
                    teacher: teacher._id
                })
            }
        })

        const dateObj = new Date(date)
        const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0))
        const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999))

        await Attendance.deleteMany({
            class: classId,
            date: { $gte: startOfDay, $lte: endOfDay }
        })

        if (attendanceData.length > 0) {
            await Attendance.insertMany(attendanceData)
        }

        revalidatePath("/teacher/attendance")
        return { success: true }
    } catch (error) {
        console.error('Error marking attendance:', error)
        return { error: 'Failed to mark attendance' }
    }
}

export const getStudentAttendance = async (studentId) => {
    try {
        await connectToDB()
        const mongoose = require('mongoose')
        const studentObjectId = new mongoose.Types.ObjectId(studentId)

        const attendance = await Attendance.find({ student: studentObjectId })
            .sort({ date: -1 })
            .populate('class', 'name')
            .lean()

        return JSON.parse(JSON.stringify(attendance))
    } catch (error) {
        console.error('Error fetching student attendance:', error)
        return []
    }
}

export const getStudentAttendanceStats = async (studentId) => {
    try {
        await connectToDB()
        const mongoose = require('mongoose')
        const studentObjectId = new mongoose.Types.ObjectId(studentId)

        const attendance = await Attendance.find({ student: studentObjectId }).lean()

        const stats = {
            total: attendance.length,
            present: attendance.filter(a => a.status === 'Present').length,
            absent: attendance.filter(a => a.status === 'Absent').length,
            late: attendance.filter(a => a.status === 'Late').length,
            leave: attendance.filter(a => a.status === 'Leave').length,
            halfDay: attendance.filter(a => a.status === 'Half Day').length
        }

        stats.presentPercentage = stats.total > 0 
            ? Math.round((stats.present / stats.total) * 100) 
            : 0

        return stats
    } catch (error) {
        console.error('Error fetching student attendance stats:', error)
        return {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            leave: 0,
            halfDay: 0,
            presentPercentage: 0
        }
    }
}

export const getAllClasses = async () => {
    try {
        await connectToDB()
        const classes = await Class.find().sort({ name: 1 }).lean()
        return JSON.parse(JSON.stringify(classes))
    } catch (error) {
        console.error('Error fetching classes:', error)
        return []
    }
}

export const getAttendanceByDate = async (date) => {
    try {
        await connectToDB()
        
        const dateObj = new Date(date)
        const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0))
        const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999))

        const attendance = await Attendance.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        })
        .populate('class', 'name')
        .populate('student', 'Name Email')
        .lean()

        const classes = await Class.find().lean()
        const classMap = {}
        classes.forEach(cls => {
            classMap[cls._id.toString()] = cls
        })

        const classStats = {}
        classes.forEach(cls => {
            classStats[cls._id.toString()] = {
                className: cls.name,
                total: 0,
                present: 0,
                absent: 0,
                late: 0,
                leave: 0,
                halfDay: 0,
                notMarked: 0
            }
        })

        const allStudents = await Student.find().lean()
        const studentsByClass = {}
        allStudents.forEach(student => {
            const classId = student.Class?.toString()
            if (classId) {
                if (!studentsByClass[classId]) {
                    studentsByClass[classId] = []
                }
                studentsByClass[classId].push(student)
            }
        })

        Object.keys(studentsByClass).forEach(classId => {
            if (classStats[classId]) {
                classStats[classId].total = studentsByClass[classId].length
                classStats[classId].notMarked = studentsByClass[classId].length
            }
        })

        attendance.forEach(record => {
            const classId = record.class?._id?.toString() || record.class?.toString()
            if (classStats[classId]) {
                classStats[classId].notMarked = Math.max(0, classStats[classId].notMarked - 1)
                switch (record.status) {
                    case 'Present':
                        classStats[classId].present++
                        break
                    case 'Absent':
                        classStats[classId].absent++
                        break
                    case 'Late':
                        classStats[classId].late++
                        break
                    case 'Leave':
                        classStats[classId].leave++
                        break
                    case 'Half Day':
                        classStats[classId].halfDay++
                        break
                }
            }
        })

        const result = Object.values(classStats).filter(cls => cls.total > 0)
        
        const overallStats = {
            totalStudents: result.reduce((sum, cls) => sum + cls.total, 0),
            totalPresent: result.reduce((sum, cls) => sum + cls.present, 0),
            totalAbsent: result.reduce((sum, cls) => sum + cls.absent, 0),
            totalLate: result.reduce((sum, cls) => sum + cls.late, 0),
            totalLeave: result.reduce((sum, cls) => sum + cls.leave, 0),
            totalHalfDay: result.reduce((sum, cls) => sum + cls.halfDay, 0),
            totalNotMarked: result.reduce((sum, cls) => sum + cls.notMarked, 0)
        }
        overallStats.presentPercentage = overallStats.totalStudents > 0 
            ? Math.round((overallStats.totalPresent / overallStats.totalStudents) * 100) 
            : 0

        return {
            date,
            classStats: result,
            overallStats
        }
    } catch (error) {
        console.error('Error fetching attendance by date:', error)
        return {
            date,
            classStats: [],
            overallStats: {
                totalStudents: 0,
                totalPresent: 0,
                totalAbsent: 0,
                totalLate: 0,
                totalLeave: 0,
                totalHalfDay: 0,
                totalNotMarked: 0,
                presentPercentage: 0
            }
        }
    }
}

export const getTeacherAttendanceByDate = async (teacherEmail, date) => {
    try {
        await connectToDB()
        const mongoose = require('mongoose')
        
        const teacher = await Teacher.findOne({ email: teacherEmail })
        if (!teacher) {
            return { classes: [], overallStats: {} }
        }

        const classes = await Class.find({ assignedTeacher: teacher._id }).lean()
        if (classes.length === 0) {
            return { classes: [], overallStats: {} }
        }

        const classIds = classes.map(c => c._id)

        const dateObj = new Date(date)
        const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0))
        const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999))

        const attendance = await Attendance.find({
            class: { $in: classIds },
            date: { $gte: startOfDay, $lte: endOfDay }
        })
        .populate('class', 'name')
        .populate('student', 'Name Email')
        .lean()

        const studentsByClass = {}
        for (const cls of classes) {
            const students = await Student.find({ Class: cls._id }).lean()
            studentsByClass[cls._id.toString()] = students
        }

        const classStats = classes.map(cls => {
            const classStudents = studentsByClass[cls._id.toString()] || []
            const classAttendance = attendance.filter(a => 
                a.class?._id?.toString() === cls._id.toString() || a.class?.toString() === cls._id.toString()
            )

            return {
                _id: cls._id,
                name: cls.name,
                total: classStudents.length,
                present: classAttendance.filter(a => a.status === 'Present').length,
                absent: classAttendance.filter(a => a.status === 'Absent').length,
                late: classAttendance.filter(a => a.status === 'Late').length,
                leave: classAttendance.filter(a => a.status === 'Leave').length,
                halfDay: classAttendance.filter(a => a.status === 'Half Day').length,
                notMarked: classStudents.length - classAttendance.length,
                students: classStudents.map(s => {
                    const record = classAttendance.find(a => 
                        a.student?._id?.toString() === s._id.toString()
                    )
                    return {
                        ...s,
                        status: record?.status || 'Not Marked'
                    }
                })
            }
        })

        const overallStats = {
            totalStudents: classStats.reduce((sum, cls) => sum + cls.total, 0),
            totalPresent: classStats.reduce((sum, cls) => sum + cls.present, 0),
            totalAbsent: classStats.reduce((sum, cls) => sum + cls.absent, 0),
            totalLate: classStats.reduce((sum, cls) => sum + cls.late, 0),
            totalLeave: classStats.reduce((sum, cls) => sum + cls.leave, 0),
            totalHalfDay: classStats.reduce((sum, cls) => sum + cls.halfDay, 0),
            totalNotMarked: classStats.reduce((sum, cls) => sum + cls.notMarked, 0)
        }
        overallStats.presentPercentage = overallStats.totalStudents > 0 
            ? Math.round((overallStats.totalPresent / overallStats.totalStudents) * 100) 
            : 0

        return {
            date,
            classes: classStats,
            overallStats
        }
    } catch (error) {
        console.error('Error fetching teacher attendance by date:', error)
        return { classes: [], overallStats: {} }
    }
}
