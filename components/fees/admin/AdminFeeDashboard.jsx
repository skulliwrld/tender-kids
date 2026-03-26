'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminFeeDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchTerms(selectedSession);
    }
  }, [selectedSession]);

  useEffect(() => {
    fetchDashboard();
  }, [selectedSession, selectedTerm, paymentDate]);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/fees/academic');
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
      const active = data?.find(s => s.isActive);
      if (active) {
        setSelectedSession(active._id);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchTerms = async (sessionId) => {
    try {
      const res = await fetch(`/api/fees/academic?type=terms&id=${sessionId}`);
      const data = await res.json();
      setTerms(Array.isArray(data) ? data : []);
      const active = data?.find(t => t.isActive);
      if (active) {
        setSelectedTerm(active._id);
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: 'dashboard' });
      if (selectedSession) params.append('academicSessionId', selectedSession);
      if (selectedTerm) params.append('termId', selectedTerm);
      if (paymentDate) params.append('paymentDate', paymentDate);
      
      const res = await fetch(`/api/fees/reports?${params}`);
      const data = await res.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  const { periodSummary, statusBreakdown, collectionByMethod, recentPayments, topDebtors } = dashboardData || {};

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Fee Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
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
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Expected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">₦{periodSummary?.totalExpected?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-600">₦{periodSummary?.totalPaid?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-red-600">₦{periodSummary?.totalBalance?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {periodSummary?.totalExpected > 0
                ? ((periodSummary.totalPaid / periodSummary.totalExpected) * 100).toFixed(1)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Fee Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {statusBreakdown?.map((item) => (
                <div key={item._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-4">
                  <span className="capitalize text-sm sm:text-base">{item._id}</span>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                    <span>{item.count} fees</span>
                    <span className="font-semibold">₦{item.amount?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Collection by Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {collectionByMethod?.map((item) => (
                <div key={item._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-4">
                  <span className="capitalize text-sm sm:text-base">{item._id}</span>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                    <span>{item.count} txns</span>
                    <span className="font-semibold">₦{item.total?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle className="text-base sm:text-lg">Recent Payments</CardTitle>
                {paymentDate && (
                  <p className="text-xs text-gray-500">
                    {recentPayments?.length || 0} payment(s) on {new Date(paymentDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {paymentDate && (
                  <button
                    onClick={() => setPaymentDate('')}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Clear
                  </button>
                )}
                <input
                  type="date"
                  className="rounded-md border border-gray-300 px-2 py-1 text-xs sm:text-sm"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recentPayments?.length > 0 ? (
              paymentDate ? (
                <div className="max-h-96 overflow-y-auto space-y-2 sm:space-y-3 pr-2">
                  {recentPayments.map((payment) => (
                    <div key={payment._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-4 border-b pb-2">
                      <div>
                        <p className="font-medium text-sm sm:text-base">{payment.student?.Name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {new Date(payment.paymentDate).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-semibold text-green-600 text-sm sm:text-base">₦{payment.amount?.toLocaleString()}</p>
                        <p className="text-xs sm:text-sm text-gray-500 capitalize">{payment.paymentMethod}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {recentPayments.slice(0, 5).map((payment) => (
                    <div key={payment._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-4 border-b pb-2">
                      <div>
                        <p className="font-medium text-sm sm:text-base">{payment.student?.Name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-semibold text-green-600 text-sm sm:text-base">₦{payment.amount?.toLocaleString()}</p>
                        <p className="text-xs sm:text-sm text-gray-500 capitalize">{payment.paymentMethod}</p>
                      </div>
                    </div>
                  ))}
                  {recentPayments.length > 5 && (
                    <p className="text-xs text-center text-gray-500 pt-2">
                      +{recentPayments.length - 5} more payments
                    </p>
                  )}
                </div>
              )
            ) : (
              <p className="text-center text-gray-500 py-4 text-sm">No payments found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Top Debtors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {topDebtors?.slice(0, 5).map((debtor) => (
                <div key={debtor._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-4 border-b pb-2">
                  <div>
                    <p className="font-medium text-sm sm:text-base">{debtor.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{debtor.feesCount} fee(s)</p>
                  </div>
                  <div className="font-semibold text-red-600 text-sm sm:text-base">
                    ₦{debtor.totalOwed?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
