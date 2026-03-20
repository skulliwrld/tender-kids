import { NextResponse } from 'next/server'
import { connectToDB } from '@/lib/Database/connectToDB'
import { Student } from '@/models/student.model'
import Attendance from '@/models/attendance.model'
import Grade from '@/models/grade.model'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Student ID is required' },
        { status: 400 }
      )
    }

    await connectToDB()

    const student = await Student.findById(id)
      .populate('Class', 'name')
      .populate('Parent', 'Name Email Phone Profession Address')
      .lean()

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      )
    }

    const attendance = await Attendance.find({ student: id })
      .sort({ date: -1 })
      .limit(30)
      .lean()

    const grades = await Grade.find({ student: id })
      .populate('subject', 'Name')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      student: JSON.parse(JSON.stringify(student)),
      attendance: JSON.parse(JSON.stringify(attendance)),
      grades: JSON.parse(JSON.stringify(grades))
    })

  } catch (error) {
    console.error('Parent portal student data error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
