import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { fetchChildrenByParentEmail } from '@/lib/actions/parent.action';

export async function GET(req) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== 'parent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const children = await fetchChildrenByParentEmail(session.user.email);
    return NextResponse.json(children);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
