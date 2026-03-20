'use server'

import { connectDB } from '@/lib/db/mongodb'
import Grade from '@/models/grade.model'
import { Student } from '@/models/student.model'
import { Subject } from '@/models/subject.model'
import mongoose from 'mongoose'

export async function calculateFinalGrade(studentId, subjectId, term = 'Term 1', academicSession = '2025-2026') {
  try {
    await connectDB()

    const studentObjectId = new mongoose.Types.ObjectId(studentId)
    const subjectObjectId = new mongoose.Types.ObjectId(subjectId)

    const grades = await Grade.find({
      student: studentObjectId,
      subject: subjectObjectId,
      term: term,
      academicSession: academicSession
    })

    if (grades.length === 0) {
      return {
        studentId,
        subjectId,
        numericGrade: 0,
        letterGrade: 'N/A',
        message: 'No grades found for this student, subject, term and session'
      }
    }

    const exams = grades.filter(g => 
      g.exam === 'Midterm' || g.exam === 'Final Exam' || g.exam === 'Test'
    )
    const quizzes = grades.filter(g => 
      g.exam === 'Quiz' || g.exam === 'Assignment' || g.exam === 'Project'
    )

    const examAverage = exams.length > 0
      ? exams.reduce((sum, g) => sum + g.marks, 0) / exams.length
      : 0

    const quizAverage = quizzes.length > 0
      ? quizzes.reduce((sum, g) => sum + g.marks, 0) / quizzes.length
      : 0

    const finalGrade = (examAverage * 0.6) + (quizAverage * 0.4)

    let letterGrade
    if (finalGrade >= 90) letterGrade = 'A+'
    else if (finalGrade >= 85) letterGrade = 'A'
    else if (finalGrade >= 80) letterGrade = 'A-'
    else if (finalGrade >= 75) letterGrade = 'B+'
    else if (finalGrade >= 70) letterGrade = 'B'
    else if (finalGrade >= 65) letterGrade = 'B-'
    else if (finalGrade >= 60) letterGrade = 'C+'
    else if (finalGrade >= 55) letterGrade = 'C'
    else if (finalGrade >= 50) letterGrade = 'C-'
    else if (finalGrade >= 45) letterGrade = 'D+'
    else if (finalGrade >= 40) letterGrade = 'D'
    else letterGrade = 'F'

    const student = await Student.findById(studentObjectId)
    const subject = await Subject.findById(subjectObjectId)

    return {
      studentId: student?._id?.toString(),
      studentName: student?.Name || student?.name || 'Unknown Student',
      subjectId: subject?._id?.toString(),
      subjectName: subject?.Name || subject?.name || 'Unknown Subject',
      numericGrade: Math.round(finalGrade * 100) / 100,
      letterGrade,
      examAverage: Math.round(examAverage * 100) / 100,
      quizAverage: Math.round(quizAverage * 100) / 100,
      totalAssessments: grades.length
    }

  } catch (error) {
    console.error('Error calculating final grade:', error)
    return {
      numericGrade: 0,
      letterGrade: 'ERROR',
      message: 'Failed to calculate final grade'
    }
  }
}

export async function getClassFinalGrades(classId, subjectId, term = 'Term 1', academicSession = '2025-2026') {
  try {
    await connectDB()

    const classObjectId = new mongoose.Types.ObjectId(classId)
    const subjectObjectId = new mongoose.Types.ObjectId(subjectId)
    
    const students = await Student.find({ Class: classObjectId })
    const classGrades = []

    for (const student of students) {
      const result = await calculateFinalGrade(student._id.toString(), subjectId, term, academicSession)
      if (result.numericGrade > 0) {
        classGrades.push({
          studentId: student._id.toString(),
          studentName: student.Name || student.name || 'Unknown Student',
          rollNumber: student.rollNumber,
          ...result
        })
      } else {
        classGrades.push({
          studentId: student._id.toString(),
          studentName: student.Name || student.name || 'Unknown Student',
          rollNumber: student.rollNumber,
          numericGrade: 0,
          letterGrade: 'N/A',
          examAverage: 0,
          quizAverage: 0,
          totalAssessments: 0
        })
      }
    }

    return classGrades.sort((a, b) => b.numericGrade - a.numericGrade)

  } catch (error) {
    console.error('Error getting class final grades:', error)
    return []
  }
}
