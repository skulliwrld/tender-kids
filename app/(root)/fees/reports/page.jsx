'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FeeReportsPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [terms, setTerms] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState('outstanding');

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchTerms(selectedSession);
    }
  }, [selectedSession]);

  useEffect(() => {
    if (reportType) {
      fetchReport();
    }
  }, [selectedSession, selectedTerm, reportType]);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/fees/academic');
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
      const active = data?.find(s => s.isActive);
      if (active) setSelectedSession(active._id);
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
      if (active) setSelectedTerm(active._id);
    } catch (error) {
      console.error('Error fetching terms:', error);
    }
  };

  const fetchReport = async () => {
    try {
      const params = new URLSearchParams({
        type: reportType,
        academicSessionId: selectedSession,
      });
      if (selectedTerm) params.append('termId', selectedTerm);
      if (reportType === 'outstanding') params.append('minBalance', '0');

      const res = await fetch(`/api/fees/reports?${params}`);
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const exportToCSV = () => {
    if (!reportData || !Array.isArray(reportData)) return;
    
    const headers = Object.keys(reportData[0]);
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => headers.map(h => row[h]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fee Reports</h1>
        <Button onClick={exportToCSV} variant="outline">Export CSV</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Academic Session</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
        <div>
          <label className="text-sm font-medium mb-1 block">Term</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
          >
            <option value="">Select term</option>
            {terms.map((term) => (
              <option key={term._id} value={term._id}>
                {term.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Report Type</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="outstanding">Outstanding Balances</option>
            <option value="collection-stats">Collection Statistics</option>
            <option value="dashboard">Dashboard Summary</option>
          </select>
        </div>
      </div>

      {reportType === 'outstanding' && (
        <Card>
          <CardHeader>
            <CardTitle>Outstanding Balances</CardTitle>
            <CardDescription>Students with unpaid or partial fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Student Name</th>
                    <th className="text-left py-3 px-4">Class</th>
                    <th className="text-right py-3 px-4">Fees Count</th>
                    <th className="text-right py-3 px-4">Total Owed</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData?.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{item.studentName}</td>
                      <td className="py-3 px-4">{item.className}</td>
                      <td className="text-right py-3 px-4">{item.feesCount}</td>
                      <td className="text-right py-3 px-4 font-semibold text-red-600">
                        ₦{item.totalOwed?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {!reportData?.length && (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-gray-500">
                        No outstanding balances found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'collection-stats' && (
        <Card>
          <CardHeader>
            <CardTitle>Collection Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Session</th>
                    <th className="text-left py-3 px-4">Term</th>
                    <th className="text-right py-3 px-4">Expected</th>
                    <th className="text-right py-3 px-4">Collected</th>
                    <th className="text-right py-3 px-4">Balance</th>
                    <th className="text-right py-3 px-4">Collection Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData?.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{item.session?.name}</td>
                      <td className="py-3 px-4">{item.term?.name}</td>
                      <td className="text-right py-3 px-4">₦{item.totalExpected?.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 text-green-600">₦{item.totalPaid?.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 text-red-600">₦{item.totalBalance?.toLocaleString()}</td>
                      <td className="text-right py-3 px-4">
                        {item.totalExpected > 0 
                          ? ((item.totalPaid / item.totalExpected) * 100).toFixed(1) 
                          : 0}%
                      </td>
                    </tr>
                  ))}
                  {!reportData?.length && (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'dashboard' && reportData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Expected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{reportData?.periodSummary?.totalExpected?.toLocaleString() || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₦{reportData?.periodSummary?.totalPaid?.toLocaleString() || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">₦{reportData?.periodSummary?.totalBalance?.toLocaleString() || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData?.periodSummary?.totalExpected > 0
                    ? ((reportData.periodSummary.totalPaid / reportData.periodSummary.totalExpected) * 100).toFixed(1)
                    : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fee Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData?.statusBreakdown?.map((item) => (
                    <div key={item._id} className="flex justify-between items-center">
                      <span className="capitalize">{item._id}</span>
                      <div className="flex gap-4">
                        <span>{item.count} fees</span>
                        <span className="font-semibold">
                          {item._id === 'paid' 
                            ? `₦${item.amountPaid?.toLocaleString()}` 
                            : `₦${item.balance?.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collection by Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData?.collectionByMethod?.map((item) => (
                    <div key={item._id} className="flex justify-between items-center">
                      <span className="capitalize">{item._id}</span>
                      <div className="flex gap-4">
                        <span>{item.count} transactions</span>
                        <span className="font-semibold">₦{item.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
