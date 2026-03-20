import { NextResponse } from 'next/server'
import { connectToDB } from '@/lib/Database/connectToDB'
import { Parent } from '@/models/parent.model'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Parent ID is required' },
        { status: 400 }
      )
    }

    await connectToDB()

    const parent = await Parent.findById(id).lean()

    if (!parent) {
      return NextResponse.json(
        { success: false, message: 'Parent not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      parent: JSON.parse(JSON.stringify(parent))
    })

  } catch (error) {
    console.error('Get parent error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
