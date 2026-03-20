import { NextResponse } from 'next/server'
import { connectToDB } from '@/lib/Database/connectToDB'
import { Student } from '@/models/student.model'
import { Parent } from '@/models/parent.model'
import { Class } from '@/models/class.model'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentName = searchParams.get('studentName')?.toLowerCase().trim()
    const parentName = searchParams.get('parentName')?.toLowerCase().trim()

    if (!studentName || !parentName) {
      return NextResponse.json(
        { success: false, message: 'Both student name and parent name are required' },
        { status: 400 }
      )
    }

    await connectToDB()

    // Find parent by name (partial match)
    const parents = await Parent.find({
      Name: { $regex: parentName, $options: 'i' }
    })

    if (parents.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No parent found with that name' },
        { status: 404 }
      )
    }

    const parentIds = parents.map(p => p._id)

    // Find students whose name contains the search query and whose parent is in the list
    const students = await Student.find({
      Name: { $regex: studentName, $options: 'i' },
      Parent: { $in: parentIds }
    })
    .populate('Class', 'name')
    .lean()

    if (students.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No student found with that name under your account' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      students: JSON.parse(JSON.stringify(students))
    })

  } catch (error) {
    console.error('Parent portal search error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
