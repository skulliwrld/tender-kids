import { connectToDB } from '@/lib/Database/connectToDB'
import User from '@/models/user.model'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { secretKey } = await request.json()
    
    // Add a secret key to prevent unauthorized resets
    if (secretKey !== 'reset-admin-2024') {
      return NextResponse.json({ message: 'Invalid secret key' }, { status: 401 })
    }

    await connectToDB()
    
    // Delete all admin users
    const result = await User.deleteMany({ role: 'admin' })
    
    return NextResponse.json({ 
      message: 'All admin users deleted successfully',
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error('Error resetting admins:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
