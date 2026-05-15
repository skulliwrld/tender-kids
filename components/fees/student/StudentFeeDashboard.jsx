'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StudentFeeDashboard() {
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
    fetchPayments();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchTerms(selectedSession);
    } else {
      setTerms([]);
      setSelectedTerm('');
    }
  }, [selectedSession]);

  useEffect(() => {
    if (selectedSession) {
      fetchFeeData();
    }
  }, [selectedSession, selectedTerm]);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/fees/academic');
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setSessions(data);
        const active = data.find((session) => session.isActive);
        setSelectedSession(active ? active._id : data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTerms = async (sessionId) => {
    try {
      const res = await fetch(`/api/fees/academic?type=terms&id=${sessionId}`);
      const data = await res.json();
      const nextTerms = Array.isArray(data) ? data : [];

      setTerms(nextTerms);

      const activeTerm = nextTerms.find((term) => term.isActive);
      setSelectedTerm(activeTerm ? activeTerm._id : '');
    } catch (error) {
      console.error('Error fetching terms:', error);
      setTerms([]);
      setSelectedTerm('');
    }
  };

  const fetchFeeData = async () => {
    try {
      const params = new URLSearchParams({ academicSessionId: selectedSession });
      if (selectedTerm) {
        params.append('termId', selectedTerm);
      }

      const res = await fetch(`/api/fees/student-fees?${params.toString()}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setFees(data);
      } else {
        setFees([]);
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
      setFees([]);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/fees/payments');
      const data = await res.json();

      if (Array.isArray(data)) {
        setPayments(data);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateSummary = () => {
    const totalAmount = fees.reduce((sum, fee) => sum + ((fee.amount || 0) + (fee.arrears || 0)), 0);
    const totalPaid = fees.reduce((sum, fee) => sum + (fee.amountPaid || 0), 0);
    const totalBalance = fees.reduce((sum, fee) => sum + (fee.balance || 0), 0);
    const totalArrears = fees.reduce(
      (sum, fee) => sum + (fee.feeCategory === 'arrears' ? (fee.balance || 0) : (fee.arrears || 0)),
      0
    );
    return { totalAmount, totalPaid, totalBalance, totalArrears };
  };

  const formatCurrency = (amount) => `N ${(amount || 0).toLocaleString()}`;

  const summary = calculateSummary();

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">My Fees</h1>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full sm:w-48"
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            <option value="">Select session</option>
            {sessions.map((session) => (
              <option key={session._id} value={session._id}>
                {session.name}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full sm:w-48"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            disabled={!selectedSession}
          >
            <option value="">All terms</option>
            {terms.map((term) => (
              <option key={term._id} value={term._id}>
                {term.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{formatCurrency(summary.totalAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Amount Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-red-600">{formatCurrency(summary.totalBalance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Arrears</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-amber-600">{formatCurrency(summary.totalArrears)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {summary.totalAmount > 0
                ? ((summary.totalPaid / summary.totalAmount) * 100).toFixed(0)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Fee Details</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Breakdown of all fees for the selected academic session and term
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {fees.length > 0 ? fees.map((fee) => (
              <div key={fee._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                <div className="min-w-0 w-full sm:w-auto">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-sm sm:text-base break-words">
                      {fee.feeCategory === 'arrears'
                        ? fee.title || 'Student Arrears'
                        : fee.feeStructure?.name || fee.title || 'Fee'}
                    </p>
                    {fee.feeCategory === 'arrears' && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                        Arrears
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">{fee.term?.name || ''}</p>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(fee.status)}`}>
                    {fee.status?.toUpperCase() || 'UNPAID'}
                  </span>
                  <p className="mt-1 text-xs sm:text-sm">
                    {formatCurrency(fee.amountPaid)} / {formatCurrency((fee.amount || 0) + (fee.arrears || 0))}
                  </p>
                  {fee.feeCategory === 'arrears' && (
                    <p className="text-xs text-gray-500">Arrears Balance: {formatCurrency(fee.balance)}</p>
                  )}
                  {fee.feeCategory !== 'arrears' && fee.arrears > 0 && (
                    <p className="text-xs text-gray-500">Arrears: {formatCurrency(fee.arrears)}</p>
                  )}
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-500 py-4 text-sm sm:text-base">
                {selectedSession ? 'No fees found for this session/term. Please contact the admin.' : 'Please select a session'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Payment History</CardTitle>
          <CardDescription className="text-xs sm:text-sm">All payments you have made across all sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {payments.length > 0 ? payments.map((payment) => (
              <div key={payment._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-4 border-b pb-2">
                <div className="min-w-0 w-full sm:w-auto">
                  <p className="font-medium text-sm sm:text-base break-words">
                    {payment.studentFee?.feeCategory === 'arrears'
                      ? payment.studentFee?.title || 'Arrears Payment'
                      : payment.studentFee?.feeStructure?.name || 'Fee Payment'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Receipt: {payment.receiptNumber || 'N/A'} | {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : ''}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {payment.academicSession?.name || 'No session'} {payment.term?.name ? `| ${payment.term.name}` : ''}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-semibold text-green-600 text-sm sm:text-base">{formatCurrency(payment.amount)}</p>
                  <p className="text-xs sm:text-sm text-gray-500 capitalize">{payment.paymentMethod || 'N/A'}</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-500 py-4 text-sm sm:text-base">No payment history</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
