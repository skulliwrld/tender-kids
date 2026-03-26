import { NextResponse } from 'next/server'
import { connectToDB } from '@/lib/Database/connectToDB'
import { Teacher } from '@/models/teacher.model'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    await connectToDB()

    const teachers = await Teacher.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { title: { $regex: query, $options: 'i' } }
      ]
    })
    .limit(10)

    return NextResponse.json({ results: JSON.parse(JSON.stringify(teachers)) })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ results: [], error: error.message }, { status: 500 })
  }
}