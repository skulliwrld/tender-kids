import { getServerSession } from "next-auth/next";
import { authConfig } from '@/auth.config'
import { getStudentsByClassForAttendance } from '@/lib/actions/attendance.action';

export async function GET(req) {
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== 'teacher') {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url)
  const classId = searchParams.get('classId')
  const date = searchParams.get('date')

  if (!classId || !date) {
    return new Response(JSON.stringify({ error: 'Missing classId or date' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const students = await getStudentsByClassForAttendance(classId, date)
  return new Response(JSON.stringify({ students }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
