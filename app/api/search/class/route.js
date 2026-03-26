import { NextResponse } from 'next/server'
import { connectToDB } from '@/lib/Database/connectToDB'
import { Class } from '@/models/class.model'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    await connectToDB()

    const classes = await Class.find({
      name: { $regex: query, $options: 'i' }
    })
    .limit(10)

    return NextResponse.json({ results: JSON.parse(JSON.stringify(classes)) })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ results: [], error: error.message }, { status: 500 })
  }
}