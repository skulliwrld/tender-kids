import { connectToDB } from '@/lib/Database/connectToDB'
import { Student } from '@/models/student.model'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    await connectToDB()
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const all = searchParams.get('all')
    const classId = searchParams.get('classId')

    if (all === 'true') {
      const query = {}

      if (classId) {
        query.Class = classId
      }

      const students = await Student.find(query).populate('Class', 'name numericId').sort({ Name: 1 })
      return NextResponse.json(students)
    }

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email required' }, { status: 400 })
    }

    const student = await Student.findOne({ Email: email }).populate('Class', 'name')

    if (!student) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, student })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
