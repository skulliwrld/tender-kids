import { getServerSession } from "next-auth/next";
import { authConfig } from '@/auth.config'
import { getStudentsByClass } from '@/lib/actions/teacher.actions';

export async function GET(req, { params }) {
  const { classId } = await params;
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== 'teacher') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const students = await getStudentsByClass(classId);
  return new Response(JSON.stringify(students), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}