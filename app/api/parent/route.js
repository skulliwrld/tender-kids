import { NextResponse } from 'next/server'
import { connectToDB } from '@/lib/Database/connectToDB'
import { Parent } from '@/models/parent.model'

export async function GET() {
  try {
    await connectToDB()
    const parents = await Parent.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({
      success: true,
      parents: JSON.parse(JSON.stringify(parents))
    })
  } catch (error) {
    console.error('Error fetching parents:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
