'use server'

import { connectToDB } from '@/lib/Database/connectToDB'
import Grade from '@/models/grade.model'
import { Result } from '@/models/result.model'
import Attendance from '@/models/attendance.model'

// ===== GRADES =====

export async function createGrade(gradeData) {
  try {
    await connectToDB()
    const grade = new Grade(gradeData)
    const savedGrade = await grade.save()
    return JSON.parse(JSON.stringify(savedGrade))
  } catch (error) {
    throw new Error(`Failed to create grade: ${error.message}`)
  }
}

export async function getAllGrades(filters = {}) {
  try {
    await connectToDB()
    const grades = await Grade.find(filters)
      .populate('student', 'name')
      .populate('subject', 'name')
      .populate('class', 'name')
      .populate('teacher', 'name')
      .sort({ createdAt: -1 })
    return JSON.parse(JSON.stringify(grades))
  } catch (error) {
    throw new Error(`Failed to fetch grades: ${error.message}`)
  }
}

export async function getGradeById(id) {
  try {
    await connectToDB()
    const grade = await Grade.findById(id)
      .populate('student')
      .populate('subject')
      .populate('class')
      .populate('teacher')
    return JSON.parse(JSON.stringify(grade))
  } catch (error) {
    throw new Error(`Failed to fetch grade: ${error.message}`)
  }
}

export async function getStudentGrades(studentId) {
  try {
    await connectToDB()
    const grades = await Grade.find({ student: studentId })
      .populate('subject', 'name')
      .populate('class', 'name')
      .sort({ term: -1 })
    return JSON.parse(JSON.stringify(grades))
  } catch (error) {
    throw new Error(`Failed to fetch student grades: ${error.message}`)
  }
}

export async function getClassGrades(classId, subjectId, term, academicSession) {
  try {
    await connectToDB()
    const mongoose = require('mongoose')
    
    const filters = {
      class: new mongoose.Types.ObjectId(classId)
    }
    
    if (subjectId) {
      filters.subject = new mongoose.Types.ObjectId(subjectId)
    }
    if (term) {
      filters.term = term
    }
    if (academicSession) {
      filters.academicSession = academicSession
    }

    const grades = await Grade.find(filters)
      .populate('student', 'Name Email')
      .populate('subject', 'name')
      .populate('class', 'name')
      .sort({ 'student.Name': 1 })
    return JSON.parse(JSON.stringify(grades))
  } catch (error) {
    throw new Error(`Failed to fetch class grades: ${error.message}`)
  }
}

export async function updateGrade(id, updateData) {
  try {
    await connectToDB()
    const grade = await Grade.findByIdAndUpdate(id, updateData, { new: true })
    return JSON.parse(JSON.stringify(grade))
  } catch (error) {
    throw new Error(`Failed to update grade: ${error.message}`)
  }
}

export async function deleteGrade(id) {
  try {
    await connectToDB()
    await Grade.findByIdAndDelete(id)
    return { success: true, message: 'Grade deleted successfully' }
  } catch (error) {
    throw new Error(`Failed to delete grade: ${error.message}`)
  }
}

// ===== RESULTS =====

export async function createResult(resultData) {
  try {
    await connectToDB()
    const result = new Result(resultData)
    const savedResult = await result.save()
    return JSON.parse(JSON.stringify(savedResult))
  } catch (error) {
    throw new Error(`Failed to create result: ${error.message}`)
  }
}

export async function getAllResults(filters = {}) {
  try {
    await connectToDB()
    const results = await Result.find(filters)
      .populate('student', 'name rollNumber')
      .populate('class', 'name')
      .populate('gradeDetails.subject', 'name')
      .sort({ createdAt: -1 })
    return JSON.parse(JSON.stringify(results))
  } catch (error) {
    throw new Error(`Failed to fetch results: ${error.message}`)
  }
}

export async function getStudentResult(studentId, term, academicSession) {
  try {
    await connectToDB()
    const result = await Result.findOne({
      student: studentId,
      term,
      academicSession,
    })
      .populate('student')
      .populate('class')
      .populate('gradeDetails.subject')
    return JSON.parse(JSON.stringify(result))
  } catch (error) {
    throw new Error(`Failed to fetch student result: ${error.message}`)
  }
}

export async function getClassResults(classId, term, academicSession) {
  try {
    await connectToDB()
    const results = await Result.find({
      class: classId,
      term,
      academicSession,
    })
      .populate('student', 'name rollNumber')
      .sort({ position: 1 })
    return JSON.parse(JSON.stringify(results))
  } catch (error) {
    throw new Error(`Failed to fetch class results: ${error.message}`)
  }
}

export async function updateResult(id, updateData) {
  try {
    await connectToDB()
    const result = await Result.findByIdAndUpdate(id, updateData, { new: true })
    return JSON.parse(JSON.stringify(result))
  } catch (error) {
    throw new Error(`Failed to update result: ${error.message}`)
  }
}

export async function deleteResult(id) {
  try {
    await connectToDB()
    await Result.findByIdAndDelete(id)
    return { success: true, message: 'Result deleted successfully' }
  } catch (error) {
    throw new Error(`Failed to delete result: ${error.message}`)
  }
}

// ===== ATTENDANCE =====

export async function createAttendance(attendanceData) {
  try {
    await connectToDB()
    const attendance = new Attendance(attendanceData)
    const savedAttendance = await attendance.save()
    return JSON.parse(JSON.stringify(savedAttendance))
  } catch (error) {
    throw new Error(`Failed to create attendance: ${error.message}`)
  }
}

export async function getAllAttendance(filters = {}) {
  try {
    await connectToDB()
    const attendance = await Attendance.find(filters)
      .populate('student', 'name rollNumber')
      .populate('class', 'name')
      .populate('subject', 'name')
      .populate('teacher', 'name')
      .sort({ date: -1 })
    return JSON.parse(JSON.stringify(attendance))
  } catch (error) {
    throw new Error(`Failed to fetch attendance: ${error.message}`)
  }
}

export async function getStudentAttendance(studentId, startDate, endDate) {
  try {
    await connectToDB()
    const attendance = await Attendance.find({
      student: studentId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate('subject', 'name')
      .populate('class', 'name')
      .sort({ date: -1 })
    return JSON.parse(JSON.stringify(attendance))
  } catch (error) {
    throw new Error(`Failed to fetch student attendance: ${error.message}`)
  }
}

export async function getClassAttendance(classId, date) {
  try {
    await connectToDB()
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const attendance = await Attendance.find({
      class: classId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate('student', 'name rollNumber')
      .sort({ student: 1 })
    return JSON.parse(JSON.stringify(attendance))
  } catch (error) {
    throw new Error(`Failed to fetch class attendance: ${error.message}`)
  }
}

export async function getAttendanceStats(studentId, startDate, endDate) {
  try {
    await connectToDB()
    const attendance = await Attendance.find({
      student: studentId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })

    const stats = {
      total: attendance.length,
      present: attendance.filter((a) => a.status === 'Present').length,
      absent: attendance.filter((a) => a.status === 'Absent').length,
      late: attendance.filter((a) => a.status === 'Late').length,
      leave: attendance.filter((a) => a.status === 'Leave').length,
      halfDay: attendance.filter((a) => a.status === 'Half Day').length,
      percentage: attendance.length
        ? ((attendance.filter(
            (a) =>
              a.status === 'Present' ||
              a.status === 'Late' ||
              a.status === 'Half Day'
          ).length /
            attendance.length) *
            100).toFixed(2)
        : 0,
    }
    return stats
  } catch (error) {
    throw new Error(`Failed to calculate attendance stats: ${error.message}`)
  }
}

export async function updateAttendance(id, updateData) {
  try {
    await connectToDB()
    const attendance = await Attendance.findByIdAndUpdate(id, updateData, {
      new: true,
    })
    return JSON.parse(JSON.stringify(attendance))
  } catch (error) {
    throw new Error(`Failed to update attendance: ${error.message}`)
  }
}

export async function deleteAttendance(id) {
  try {
    await connectToDB()
    await Attendance.findByIdAndDelete(id)
    return { success: true, message: 'Attendance record deleted successfully' }
  } catch (error) {
    throw new Error(`Failed to delete attendance: ${error.message}`)
  }
}

export async function bulkCreateAttendance(attendanceRecords) {
  try {
    await connectToDB()
    const saved = await Attendance.insertMany(attendanceRecords)
    return { success: true, count: saved.length }
  } catch (error) {
    throw new Error(`Failed to bulk create attendance: ${error.message}`)
  }
}
