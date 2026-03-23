import { connectToDB } from '@/lib/Database/connectToDB'
import { Teacher } from '@/models/teacher.model'
import { Subject } from '@/models/subject.model'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    await connectToDB()
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    const subjects = await Subject.find({}).populate('classes').sort({ Name: 1 })
    return NextResponse.json({ success: true, subjects })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
