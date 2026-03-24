import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { createAcademicSession, getAcademicSessions, getActiveAcademicSession, getAcademicSessionById, updateAcademicSession, deleteAcademicSession } from '@/lib/actions/academicSession.action';
import { createTerm, getTermsBySession, getActiveTerm, getTermById, updateTerm } from '@/lib/actions/academicSession.action';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    
    if (type === 'active-session') {
      const activeSession = await getActiveAcademicSession();
      return NextResponse.json(activeSession);
    }
    
    if (type === 'active-term') {
      const activeTerm = await getActiveTerm();
      return NextResponse.json(activeTerm);
    }
    
    if (type === 'terms' && id) {
      const terms = await getTermsBySession(id);
      return NextResponse.json(terms);
    }
    
    if (id) {
      if (type === 'session') {
        const academicSession = await getAcademicSessionById(id);
        return NextResponse.json(academicSession);
      }
      if (type === 'term') {
        const term = await getTermById(id);
        return NextResponse.json(term);
      }
    }
    
    const sessions = await getAcademicSessions();
    return NextResponse.json(sessions);
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
    
    const data = await req.json();
    
    if (data.documentType === 'session') {
      const academicSession = await createAcademicSession(data);
      return NextResponse.json(academicSession, { status: 201 });
    }
    
    if (data.documentType === 'term') {
      const term = await createTerm(data);
      return NextResponse.json(term, { status: 201 });
    }
    
    return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
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
    const type = searchParams.get('type');
    
    const data = await req.json();
    
    if (type === 'session') {
      const academicSession = await updateAcademicSession(id, data);
      return NextResponse.json(academicSession);
    }
    
    if (type === 'term') {
      const term = await updateTerm(id, data);
      return NextResponse.json(term);
    }
    
    return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
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
    
    const academicSession = await deleteAcademicSession(id);
    return NextResponse.json(academicSession);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
