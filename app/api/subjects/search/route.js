import { NextResponse } from 'next/server'
import { connectToDB } from '@/lib/Database/connectToDB'
import { Subject } from '@/models/subject.model'
import { Class } from '@/models/class.model'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ subjects: [] })
    }

    await connectToDB()

    const subjects = await Subject.find({
      Name: { $regex: query, $options: 'i' }
    })
    .populate('classes', 'name')
    .populate('assignedTeacher', 'name')
    .limit(10)

    return NextResponse.json({ subjects: JSON.parse(JSON.stringify(subjects)) })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ subjects: [], error: error.message }, { status: 500 })
  }
}