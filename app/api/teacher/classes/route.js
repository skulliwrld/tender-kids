import { getServerSession } from "next-auth/next";
import { authConfig } from '@/auth.config'
import { getTeacherClassesForAttendance } from '@/lib/actions/attendance.action';

export async function GET(req) {
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== 'teacher') {
    return new Response('Unauthorized', { status: 401 });
  }

  const classes = await getTeacherClassesForAttendance(session.user.email);
  return new Response(JSON.stringify({ classes }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}