import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { getStudentFees, getStudentFeeSummary, getStudentFeeById, updateStudentFee, waiveStudentFee, deleteStudentFee, recalculateFeeBalance } from '@/lib/actions/studentFee.action';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const studentId = searchParams.get('studentId');
    const academicSessionId = searchParams.get('academicSessionId');
    const termId = searchParams.get('termId');
    const summary = searchParams.get('summary');
    
    if (id) {
      const studentFee = await getStudentFeeById(id);
      return NextResponse.json(studentFee);
    }
    
    let targetStudentId = studentId;
    
    // Try to get student from session
    const session = await getServerSession(authConfig);
    
    // Try with email first, then name
    if (session?.user?.role === 'student') {
      const { Student } = await import('@/models/student.model');
      const { connectToDB } = await import('@/lib/Database/connectToDB');
      await connectToDB();
      
      let student = await Student.findOne({ Email: session.user.email });
      
      // If not found by email, try by name
      if (!student && session.user.name) {
        student = await Student.findOne({ Name: session.user.name });
      }
      
      if (student) {
        targetStudentId = student._id.toString();
      }
    }
    
    // If no student ID found, return empty array
    if (!targetStudentId) {
      return NextResponse.json([]);
    }
    
    if (summary === 'true' && targetStudentId) {
      const feeSummary = await getStudentFeeSummary(targetStudentId, academicSessionId, termId);
      return NextResponse.json(feeSummary);
    }
    
    const fees = await getStudentFees(targetStudentId, academicSessionId, termId);
    return NextResponse.json(fees);
  } catch (error) {
    console.log('Student fees error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');
    
    const data = await req.json();
    
    if (action === 'waive') {
      const studentFee = await waiveStudentFee(id, data.waiverAmount, data.waiverReason);
      return NextResponse.json(studentFee);
    }
    
    if (action === 'recalculate') {
      const studentFee = await recalculateFeeBalance(id);
      return NextResponse.json(studentFee);
    }
    
    const studentFee = await updateStudentFee(id, data);
    return NextResponse.json(studentFee);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    const studentFee = await deleteStudentFee(id);
    return NextResponse.json(studentFee);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
