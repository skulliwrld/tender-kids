import { NextResponse } from 'next/server'
import { connectToDB } from '@/lib/Database/connectToDB'
import { Student } from '@/models/student.model'
import { Parent } from '@/models/parent.model'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Parent email is required' },
        { status: 400 }
      )
    }

    await connectToDB()

    const parent = await Parent.findOne({ Email: email })

    if (!parent) {
      return NextResponse.json(
        { success: false, message: 'No parent found with that email. Please check your registered email.' },
        { status: 404 }
      )
    }

    const students = await Student.find({ Parent: parent._id })
      .populate('Class', 'name')
      .lean()

    return NextResponse.json({
      success: true,
      children: JSON.parse(JSON.stringify(students))
    })

  } catch (error) {
    console.error('Parent portal children error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
