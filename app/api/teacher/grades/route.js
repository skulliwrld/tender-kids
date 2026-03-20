import { NextResponse } from 'next/server'
import { getClassGrades } from '@/lib/actions/gradeResult.action'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const subjectId = searchParams.get('subjectId')
    const term = searchParams.get('term')
    const academicSession = searchParams.get('academicSession')

    if (!classId || !subjectId) {
      return NextResponse.json({ grades: [] })
    }

    const grades = await getClassGrades(classId, subjectId, term, academicSession)
    
    return NextResponse.json({ grades })
  } catch (error) {
    console.error('Error fetching class grades:', error)
    return NextResponse.json({ grades: [] }, { status: 500 })
  }
}
