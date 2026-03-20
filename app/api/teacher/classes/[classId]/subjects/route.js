import { getServerSession } from "next-auth/next";
import { authConfig } from '@/auth.config'
import { connectToDB } from '@/lib/Database/connectToDB';
import { Subject } from '@/models/subject.model';
import { Teacher } from '@/models/teacher.model';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
  const { classId } = await params;
  const session = await getServerSession(authConfig);
  
  if (!session || session.user.role !== 'teacher') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    await connectToDB();
    
    const teacher = await Teacher.findOne({ email: session.user.email });
    const classObjectId = new mongoose.Types.ObjectId(classId);
    
    let subjects;
    
    if (teacher) {
      subjects = await Subject.find({
        $or: [
          { assignedTeacher: teacher._id },
          { classes: classObjectId }
        ]
      }).sort({ Name: 1 });
    } else {
      subjects = await Subject.find({ classes: classObjectId })
        .sort({ Name: 1 });
    }

    return new Response(JSON.stringify(subjects), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch subjects' }), { status: 500 });
  }
}
