import { NextResponse } from 'next/server'
import { connectToDB } from '@/lib/Database/connectToDB'
import { Parent } from '@/models/parent.model'
import User from '@/models/user.model'

export async function POST(request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Parent ID is required' },
        { status: 400 }
      )
    }

    await connectToDB()

    // Get parent to find associated user
    const parent = await Parent.findById(id)
    
    if (!parent) {
      return NextResponse.json(
        { success: false, message: 'Parent not found' },
        { status: 404 }
      )
    }

    // Delete parent
    await Parent.findByIdAndDelete(id)

    // Delete associated user account if exists
    if (parent.Email) {
      await User.deleteOne({ email: parent.Email, role: 'parent' })
    }

    return NextResponse.json({
      success: true,
      message: 'Parent deleted successfully'
    })

  } catch (error) {
    console.error('Delete parent error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
