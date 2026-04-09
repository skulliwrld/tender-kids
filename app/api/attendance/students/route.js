import { getServerSession } from "next-auth/next";
import { authConfig } from '@/auth.config'
import { getStudentsByClassForAttendance } from '@/lib/actions/attendance.action';
import { connectToDB } from '@/lib/Database/connectToDB'
import { Teacher } from '@/models/teacher.model'
import { Class } from '@/models/class.model'

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

  try {
    await connectToDB()
    
    // Verify that the teacher is assigned to this class
    const teacher = await Teacher.findOne({ email: session.user.email })
    if (!teacher) {
      return new Response(JSON.stringify({ error: 'Teacher not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const classRecord = await Class.findOne({
      _id: classId,
      assignedTeacher: teacher._id
    })
    
    if (!classRecord) {
      return new Response(JSON.stringify({ error: 'You are not authorized to access this class' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error('Error verifying class access:', error)
    return new Response(JSON.stringify({ error: 'Failed to verify access' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const students = await getStudentsByClassForAttendance(classId, date)
  return new Response(JSON.stringify({ students }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
