import { connectToDB } from '@/lib/Database/connectToDB'
import { Assignment } from '@/models/assignment.model'
import { Student } from '@/models/student.model'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    await connectToDB()
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('id')

    if (!assignmentId) {
      return NextResponse.json({ success: false, message: 'Assignment ID required' }, { status: 400 })
    }

    const assignment = await Assignment.findById(assignmentId)
      .populate('subject', 'Name')
      .populate('class', 'name')
      .populate('questions')
      .populate('teacher', 'name email')

    if (!assignment) {
      return NextResponse.json({ success: false, message: 'Assignment not found' }, { status: 404 })
    }

    const submissionsWithStudentData = await Promise.all(
      assignment.submissions.map(async (sub) => {
        const student = await Student.findById(sub.student).select('Name email')
        return {
          ...sub.toObject(),
          student: student || { _id: sub.student, Name: 'Unknown', email: 'N/A' }
        }
      })
    )

    const assignmentObj = assignment.toObject()
    assignmentObj.submissions = submissionsWithStudentData

    return NextResponse.json({ success: true, assignment: assignmentObj })
  } catch (error) {
    console.error('Error fetching assignment submissions:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    await connectToDB()
    const data = await request.json()

    const { assignmentId, studentId, score } = data

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return NextResponse.json({ success: false, message: 'Assignment not found' }, { status: 404 })
    }

    const submissionIndex = assignment.submissions.findIndex(
      s => s.student.toString() === studentId
    )

    if (submissionIndex >= 0) {
      assignment.submissions[submissionIndex].score = score
      assignment.submissions[submissionIndex].gradedAt = new Date()
      await assignment.save()
    }

    return NextResponse.json({ success: true, message: 'Grade saved successfully' })
  } catch (error) {
    console.error('Error grading assignment:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
