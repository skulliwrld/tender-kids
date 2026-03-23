import { connectToDB } from '@/lib/Database/connectToDB'
import { Assignment } from '@/models/assignment.model'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    await connectToDB()
    const data = await request.json()

    const { assignmentId, studentId, answers } = data

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return NextResponse.json({ success: false, message: 'Assignment not found' }, { status: 404 })
    }

    const deadline = new Date(assignment.deadline)
    const now = new Date()
    const isLate = now > deadline

    let totalPoints = 0
    assignment.questions.forEach((question) => {
      totalPoints += question.points || 1
    })

    const existingSubmissionIndex = assignment.submissions.findIndex(
      s => s.student.toString() === studentId
    )

    const submission = {
      student: studentId,
      answers,
      score: null,
      totalPoints,
      submittedAt: now,
      gradedAt: null
    }

    if (existingSubmissionIndex >= 0) {
      assignment.submissions[existingSubmissionIndex] = submission
    } else {
      assignment.submissions.push(submission)
    }

    await assignment.save()

    return NextResponse.json({ 
      success: true, 
      message: isLate ? 'Submitted late - will not be graded' : 'Submitted successfully - awaiting grading',
      isLate 
    })
  } catch (error) {
    console.error('Error submitting assignment:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
