import { connectToDB } from '@/lib/Database/connectToDB'
import { Assignment } from '@/models/assignment.model'
import { Teacher } from '@/models/teacher.model'
import { Student } from '@/models/student.model'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    await connectToDB()
    const { searchParams } = new URL(request.url)
    const teacherEmail = searchParams.get('teacher')
    const classId = searchParams.get('class')
    const studentEmail = searchParams.get('student')
    const studentId = searchParams.get('studentId')

    let query = {}

    if (teacherEmail) {
      const teacher = await Teacher.findOne({ email: teacherEmail })
      if (teacher) {
        query.teacher = teacher._id
      }
    }

    if (classId) {
      query.class = classId
    }

    if (studentEmail) {
      const student = await Student.findOne({ Email: studentEmail }).lean()
      
      if (!student) {
        return NextResponse.json({ success: true, assignments: [] })
      }
      
      if (student && student.Class) {
        const classId = student.Class.toString()
        query.class = classId
      } else {
        return NextResponse.json({ success: true, assignments: [] })
      }
    }

    if (studentId) {
      const student = await Student.findById(studentId)
      if (student && student.Class) {
        const classId = student.Class.toString()
        query.class = classId
      } else {
        return NextResponse.json({ success: true, assignments: [] })
      }
    }

    const assignments = await Assignment.find(query)
      .populate('subject', 'Name')
      .populate('class', 'name')
      .populate('teacher', 'name email')
      .populate('submissions.student', 'Name email')
      .sort({ createdAt: -1 })

    return NextResponse.json({ success: true, assignments })
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectToDB()
    const data = await request.json()

    const { topic, subject, class: classId, teacherEmail, questions, deadline } = data

    const teacher = await Teacher.findOne({ email: teacherEmail })
    if (!teacher) {
      return NextResponse.json({ success: false, message: 'Teacher not found' }, { status: 404 })
    }

    const processedQuestions = questions.map(q => ({
      question: q.question,
      points: 10
    }))

    const totalPoints = processedQuestions.length * 10

    const assignment = new Assignment({
      title: topic,
      topic,
      subject,
      class: classId,
      teacher: teacher._id,
      questions: processedQuestions,
      deadline: new Date(deadline),
      totalPoints,
      isPublished: true
    })

    await assignment.save()

    return NextResponse.json({ success: true, assignment }, { status: 201 })
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
