import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { getAdminFeeDashboard, getClassFeeReport, getPaymentReport, getOutstandingBalances, getFeeCollectionStats } from '@/lib/actions/feeDashboard.action';

export async function GET(req) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const academicSessionId = searchParams.get('academicSessionId');
    const termId = searchParams.get('termId');
    const classId = searchParams.get('classId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minBalance = parseFloat(searchParams.get('minBalance') || '0');
    
    if (type === 'dashboard') {
      const dashboard = await getAdminFeeDashboard(academicSessionId, termId);
      return NextResponse.json(dashboard);
    }
    
    if (type === 'class-report' && classId) {
      const report = await getClassFeeReport(classId, academicSessionId, termId);
      return NextResponse.json(report);
    }
    
    if (type === 'payment-report' && startDate && endDate) {
      const report = await getPaymentReport(startDate, endDate, academicSessionId, termId);
      return NextResponse.json(report);
    }
    
    if (type === 'outstanding') {
      const outstanding = await getOutstandingBalances(academicSessionId, termId, minBalance);
      return NextResponse.json(outstanding);
    }
    
    if (type === 'collection-stats') {
      const stats = await getFeeCollectionStats(academicSessionId);
      return NextResponse.json(stats);
    }
    
    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
