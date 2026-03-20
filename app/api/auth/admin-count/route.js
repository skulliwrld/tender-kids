import { connectToDB } from '@/lib/Database/connectToDB'
import User from '@/models/user.model'
import { NextResponse } from 'next/server'

const MAX_ADMIN_COUNT = 1

export async function GET() {
  try {
    await connectToDB()
    const adminCount = await User.countDocuments({ role: 'admin' })
    const canCreateAdmin = adminCount < MAX_ADMIN_COUNT
    
    return NextResponse.json({ 
      adminCount,
      canCreateAdmin,
      maxAdmin: MAX_ADMIN_COUNT
    })
  } catch (error) {
    console.error('Error checking admin count:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
