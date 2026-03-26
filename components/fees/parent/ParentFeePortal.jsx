'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ParentFeePortal() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [allChildrenFees, setAllChildrenFees] = useState([]);
  const [allChildrenPayments, setAllChildrenPayments] = useState([]);
  const [childFees, setChildFees] = useState([]);
  const [childPayments, setChildPayments] = useState([]);
  const [feeSummary, setFeeSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAllChildren, setShowAllChildren] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (children.length > 0) {
      const childParam = searchParams.get('child');
      if (childParam && children.some(c => c._id === childParam)) {
        setSelectedChild(childParam);
        setShowAllChildren(false);
      }
    }
  }, [children, searchParams]);

  useEffect(() => {
    if (selectedSession && children.length > 0) {
      if (!showAllChildren && selectedChild) {
        fetchChildFees();
        fetchChildPayments();
      } else {
        fetchAllChildrenTotals();
      }
    }
  }, [selectedSession, children, showAllChildren, selectedChild, paymentDate]);

  useEffect(() => {
    if (selectedChild && selectedSession && !showAllChildren) {
      fetchChildFees();
      fetchChildPayments();
    }
  }, [selectedChild, selectedSession, showAllChildren]);

  const fetchInitialData = async () => {
    try {
      const [sessionsRes, childrenRes] = await Promise.all([
        fetch('/api/fees/academic'),
        fetch('/api/parent/children'),
      ]);
      
      const sessionsData = await sessionsRes.json();
      const childrenData = await childrenRes.json();
      
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setChildren(Array.isArray(childrenData) ? childrenData : []);
      
      const active = sessionsData?.find(s => s.isActive);
      if (active) {
        setSelectedSession(active._id);
      } else if (sessionsData?.length > 0) {
        setSelectedSession(sessionsData[0]._id);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllChildrenTotals = async () => {
    if (!selectedSession || children.length === 0) return;

    try {
      const childIds = children.map(c => c._id);
      let totalFees = 0;
      let totalPaid = 0;
      let totalBalance = 0;
      let allFeesData = [];
      let allPaymentsData = [];

      for (const childId of childIds) {
        let feesUrl = `/api/fees/student-fees?studentId=${childId}&academicSessionId=${selectedSession}`;
        const feesRes = await fetch(feesUrl);
        const feesData = await feesRes.json();
        
        if (Array.isArray(feesData)) {
          allFeesData = [...allFeesData, ...feesData];
          feesData.forEach(fee => {
            totalFees += fee.amount || 0;
            totalPaid += fee.amountPaid || 0;
            totalBalance += fee.balance || 0;
          });
        }

        let paymentsUrl = `/api/fees/payments?studentId=${childId}&academicSessionId=${selectedSession}`;
        if (paymentDate) paymentsUrl += `&paymentDate=${paymentDate}`;
        const paymentsRes = await fetch(paymentsUrl);
        const paymentsData = await paymentsRes.json();
        
        if (Array.isArray(paymentsData)) {
          allPaymentsData = [...allPaymentsData, ...paymentsData];
        }
      }

      setAllChildrenFees(allFeesData);
      setAllChildrenPayments(allPaymentsData);
      setFeeSummary({
        totalAmount: totalFees,
        totalPaid: totalPaid,
        totalBalance: totalBalance,
        feesCount: allFeesData.length
      });
    } catch (error) {
      console.error('Error fetching all children totals:', error);
    }
  };

  const fetchChildFees = async () => {
    if (!selectedChild || !selectedSession) return;
    
    try {
      const res = await fetch(`/api/fees/student-fees?studentId=${selectedChild}&academicSessionId=${selectedSession}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setChildFees(data);
        
        const totalAmount = data.reduce((sum, f) => sum + (f.amount || 0), 0);
        const totalPaid = data.reduce((sum, f) => sum + (f.amountPaid || 0), 0);
        const totalBalance = data.reduce((sum, f) => sum + (f.balance || 0), 0);
        
        setFeeSummary({
          totalAmount,
          totalPaid,
          totalBalance,
          feesCount: data.length
        });
      }
    } catch (error) {
      console.error('Error fetching child fees:', error);
    }
  };

  const fetchChildPayments = async () => {
    if (!selectedChild || !selectedSession) return;
    
    try {
      let url = `/api/fees/payments?studentId=${selectedChild}&academicSessionId=${selectedSession}`;
      if (paymentDate) url += `&paymentDate=${paymentDate}`;
      const res = await fetch(url);
      const data = await res.json();
      setChildPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching child payments:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'partial': return 'text-yellow-600';
      case 'unpaid': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) return <div className="p-3 sm:p-6">Loading...</div>;

  const selectedChildData = children.find(c => c._id === selectedChild);
  const displayFees = showAllChildren ? allChildrenFees : childFees;
  const displayPayments = showAllChildren ? allChildrenPayments : childPayments;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold">Children's Fees</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Academic Session</label>
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
          <label className="block text-sm font-medium mb-1">View</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={showAllChildren ? 'all' : selectedChild}
            onChange={(e) => {
              if (e.target.value === 'all') {
                setShowAllChildren(true);
                setSelectedChild('');
              } else {
                setShowAllChildren(false);
                setSelectedChild(e.target.value);
              }
            }}
          >
            <option value="all">All Children Combined</option>
            {children.map((child) => (
              <option key={child._id} value={child._id}>
                {child.Name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedSession && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <Card>
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  {showAllChildren ? 'Total Expected' : `Total Fees`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">₦{(feeSummary?.totalAmount || 0).toLocaleString()}</div>
                {showAllChildren && <p className="text-xs text-gray-500">{children.length} child(ren)</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Amount Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-green-600">₦{(feeSummary?.totalPaid || 0).toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-red-600">₦{(feeSummary?.totalBalance || 0).toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">
                  {feeSummary?.totalAmount > 0
                    ? ((feeSummary.totalPaid / feeSummary.totalAmount) * 100).toFixed(0)
                    : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Fee Details</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {showAllChildren 
                  ? `All fees for ${children.length} children in this session`
                  : `Fees for ${selectedChildData?.Name}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-3">
                {displayFees.length > 0 ? displayFees.map((fee, index) => (
                  <div key={fee._id || index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold text-sm sm:text-base">{fee.feeStructure?.name || 'Fee'}</p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {showAllChildren && fee.student?.Name && `(${fee.student.Name}) - `}
                        {fee.term?.name || ''}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(fee.status)} bg-gray-100`}>
                        {fee.status?.toUpperCase() || 'UNPAID'}
                      </span>
                      <p className="mt-1 text-xs sm:text-sm">
                        ₦{(fee.amountPaid || 0).toLocaleString()} / ₦{(fee.amount || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-gray-500 py-4 text-sm sm:text-base">No fees found</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg">Payment History</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {showAllChildren 
                      ? `All payments for ${children.length} children`
                      : `Payments for ${selectedChildData?.Name}`
                    }
                  </CardDescription>
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
              {displayPayments.length > 0 ? (
                paymentDate ? (
                  <div className="max-h-96 overflow-y-auto space-y-2 sm:space-y-3 pr-2">
                    {displayPayments.map((payment) => (
                      <div key={payment._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-4 border-b pb-2">
                        <div>
                          <p className="font-medium text-sm sm:text-base">
                            {showAllChildren && payment.student?.Name && `${payment.student.Name} - `}
                            {payment.studentFee?.feeStructure?.name || 'Fee Payment'}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Receipt: {payment.receiptNumber || 'N/A'} | {payment.paymentDate ? new Date(payment.paymentDate).toLocaleTimeString() : ''}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-semibold text-green-600 text-sm sm:text-base">₦{(payment.amount || 0).toLocaleString()}</p>
                          <p className="text-xs sm:text-sm text-gray-500 capitalize">{payment.paymentMethod || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {displayPayments.map((payment) => (
                      <div key={payment._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-4 border-b pb-2">
                        <div>
                          <p className="font-medium text-sm sm:text-base">
                            {showAllChildren && payment.student?.Name && `${payment.student.Name} - `}
                            {payment.studentFee?.feeStructure?.name || 'Fee Payment'}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Receipt: {payment.receiptNumber || 'N/A'} | {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : ''}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-semibold text-green-600 text-sm sm:text-base">₦{(payment.amount || 0).toLocaleString()}</p>
                          <p className="text-xs sm:text-sm text-gray-500 capitalize">{payment.paymentMethod || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <p className="text-center text-gray-500 py-4 text-sm sm:text-base">No payment history</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedSession && (
        <div className="text-center py-8 text-gray-500">
          Please select an academic session to view fees.
        </div>
      )}
    </div>
  );
}
