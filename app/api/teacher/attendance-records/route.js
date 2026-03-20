import { NextResponse } from 'next/server'
import { getTeacherAttendanceByDate } from '@/lib/actions/attendance.action'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ classes: [], overallStats: {} })
    }

    const result = await getTeacherAttendanceByDate(email, date)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching teacher attendance records:', error)
    return NextResponse.json({ classes: [], overallStats: {} }, { status: 500 })
  }
}
