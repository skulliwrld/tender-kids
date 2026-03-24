'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StudentFeeDashboard() {
  const [feeSummary, setFeeSummary] = useState(null);
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchFeeData();
      fetchPayments();
    }
  }, [selectedSession]);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/fees/academic');
      const data = await res.json();
      console.log('Sessions:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        setSessions(data);
        const active = data.find(s => s.isActive);
        setSelectedSession(active ? active._id : data[0]._id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setLoading(false);
    }
  };

  const fetchFeeData = async () => {
    try {
      const res = await fetch(`/api/fees/student-fees?academicSessionId=${selectedSession}`);
      const data = await res.json();
      console.log('Student fees:', data);
      
      if (Array.isArray(data)) {
        setFees(data);
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await fetch(`/api/fees/payments?academicSessionId=${selectedSession}`);
      const data = await res.json();
      console.log('Payments:', data);
      
      if (Array.isArray(data)) {
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateSummary = () => {
    const totalAmount = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const totalPaid = fees.reduce((sum, fee) => sum + (fee.amountPaid || 0), 0);
    const totalBalance = fees.reduce((sum, fee) => sum + (fee.balance || 0), 0);
    return { totalAmount, totalPaid, totalBalance };
  };

  const summary = calculateSummary();

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">My Fees</h1>
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
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">₦{summary.totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Amount Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-600">₦{summary.totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-red-600">₦{summary.totalBalance.toLocaleString()}</div>
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
          <CardDescription className="text-xs sm:text-sm">Breakdown of all fees for the selected session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {fees.length > 0 ? fees.map((fee) => (
              <div key={fee._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                <div>
                  <p className="font-semibold text-sm sm:text-base">{fee.feeStructure?.name || 'Fee'}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{fee.term?.name || ''}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(fee.status)}`}>
                    {fee.status?.toUpperCase() || 'UNPAID'}
                  </span>
                  <p className="mt-1 text-xs sm:text-sm">
                    ₦{(fee.amountPaid || 0).toLocaleString()} / ₦{(fee.amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-500 py-4 text-sm sm:text-base">
                {selectedSession ? 'No fees found for this session. Please contact the admin.' : 'Please select a session'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {payments.length > 0 ? payments.map((payment) => (
              <div key={payment._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-4 border-b pb-2">
                <div>
                  <p className="font-medium text-sm sm:text-base">{payment.studentFee?.feeStructure?.name || 'Fee Payment'}</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Receipt: {payment.receiptNumber || 'N/A'} | {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : ''}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-semibold text-green-600 text-sm sm:text-base">₦{(payment.amount || 0).toLocaleString()}</p>
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
