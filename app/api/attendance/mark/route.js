import { getServerSession } from "next-auth/next";
import { authConfig } from '@/auth.config'
import { markAttendance } from '@/lib/actions/attendance.action';

export async function POST(req) {
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== 'teacher') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const formData = await req.formData()
    formData.append('teacherEmail', session.user.email)
    
    const result = await markAttendance(formData)
    
    if (result.error) {
      return new Response(JSON.stringify({ error: result.error }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error in mark attendance API:', error)
    return new Response(JSON.stringify({ error: 'Failed to mark attendance' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
