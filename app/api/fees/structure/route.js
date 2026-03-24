import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { createFeeStructure, getFeeStructures, getFeeStructureById, getFeeStructuresByClass, updateFeeStructure, deleteFeeStructure, assignFeeToStudents } from '@/lib/actions/feeStructure.action';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const classId = searchParams.get('classId');
    const academicSessionId = searchParams.get('academicSessionId');
    const termId = searchParams.get('termId');
    
    if (id) {
      const feeStructure = await getFeeStructureById(id);
      return NextResponse.json(feeStructure);
    }
    
    if (classId && academicSessionId && termId) {
      const feeStructures = await getFeeStructuresByClass(classId, academicSessionId, termId);
      return NextResponse.json(feeStructures);
    }
    
    const filters = {};
    if (classId) filters.classLevel = classId;
    if (academicSessionId) filters.academicSession = academicSessionId;
    if (termId) filters.term = termId;
    
    const feeStructures = await getFeeStructures(filters);
    return NextResponse.json(feeStructures);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    
    const data = await req.json();
    
    if (action === 'assign') {
      const result = await assignFeeToStudents(data.feeStructureId, data.studentIds);
      return NextResponse.json(result, { status: 201 });
    }
    
    const feeStructure = await createFeeStructure(data);
    return NextResponse.json(feeStructure, { status: 201 });
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
    
    const data = await req.json();
    const feeStructure = await updateFeeStructure(id, data);
    return NextResponse.json(feeStructure);
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
    
    const feeStructure = await deleteFeeStructure(id);
    return NextResponse.json(feeStructure);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
