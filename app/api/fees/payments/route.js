import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { createPayment, getPayments, getStudentPayments, getPaymentById, reversePayment, getPaymentHistory, bulkCreatePayments } from '@/lib/actions/payment.action';
import { Student } from '@/models/student.model';
import { connectToDB } from '@/lib/Database/connectToDB';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const studentId = searchParams.get('studentId');
    const academicSessionId = searchParams.get('academicSessionId');
    const termId = searchParams.get('termId');
    const studentFeeId = searchParams.get('studentFeeId');
    const history = searchParams.get('history');
    const paymentDate = searchParams.get('paymentDate');
    
    if (id) {
      const payment = await getPaymentById(id);
      return NextResponse.json(payment);
    }
    
    if (history === 'true' && studentFeeId) {
      const payments = await getPaymentHistory(studentFeeId);
      return NextResponse.json(payments);
    }
    
    let targetStudentId = studentId;
    
    try {
      const session = await getServerSession(authConfig);
      if (session?.user?.role && ['student', 'parent'].includes(session.user.role)) {
        await connectToDB();
        
        if (session.user.role === 'student') {
          const student = await Student.findOne({ Email: session.user.email });
          if (student) targetStudentId = student._id.toString();
        } else if (session.user.role === 'parent') {
          if (!studentId) {
            const { Parent } = await import('@/models/parent.model');
            const parent = await Parent.findOne({ Email: session.user.email });
            if (parent) {
              const children = await Student.find({ Parent: parent._id });
              if (children.length > 0) {
                targetStudentId = children.map(c => c._id);
              }
            }
          }
        }
      }
    } catch (e) {
      // Continue without session
    }
    
    if (targetStudentId) {
      const payments = await getStudentPayments(targetStudentId, academicSessionId, termId, paymentDate);
      return NextResponse.json(payments);
    }
    
    const payments = await getPayments({ academicSessionId, termId, paymentDate });
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || !['admin', 'student', 'parent'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    
    const data = await req.json();
    
    if (action === 'bulk') {
      const results = await bulkCreatePayments(data.payments);
      return NextResponse.json(results, { status: 201 });
    }
    
    if (!data.receivedBy && session.user.role === 'admin') {
      data.receivedBy = session.user.id;
    }
    
    const payment = await createPayment(data);
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
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
    
    if (action === 'reverse') {
      const data = await req.json();
      const payment = await reversePayment(id, data.reason);
      return NextResponse.json(payment);
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
