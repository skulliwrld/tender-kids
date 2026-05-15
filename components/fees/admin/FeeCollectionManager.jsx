'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FeeCollectionManager() {
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [studentFees, setStudentFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState(null);
  const [arrearsForm, setArrearsForm] = useState({
    title: 'Student Arrears',
    amount: '',
    description: '',
    notes: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'cash',
    bankName: '',
    transactionId: '',
    notes: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchTerms(selectedSession);
    } else {
      setTerms([]);
      setSelectedTerm('');
    }
  }, [selectedSession]);

  const fetchInitialData = async () => {
    try {
      await Promise.all([fetchStudents(), fetchSessions()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/student?all=true');
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/fees/academic');
      const data = await res.json();
      const nextSessions = Array.isArray(data) ? data : [];
      setSessions(nextSessions);

      const activeSession = nextSessions.find((session) => session.isActive);
      if (activeSession) {
        setSelectedSession(activeSession._id);
      } else if (nextSessions[0]) {
        setSelectedSession(nextSessions[0]._id);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchTerms = async (sessionId) => {
    try {
      const res = await fetch(`/api/fees/academic?type=terms&id=${sessionId}`);
      const data = await res.json();
      const nextTerms = Array.isArray(data) ? data : [];
      setTerms(nextTerms);

      const activeTerm = nextTerms.find((term) => term.isActive);
      if (activeTerm) {
        setSelectedTerm(activeTerm._id);
      } else if (nextTerms[0]) {
        setSelectedTerm(nextTerms[0]._id);
      } else {
        setSelectedTerm('');
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
      setTerms([]);
      setSelectedTerm('');
    }
  };

  const handleStudentSelect = async (studentId) => {
    setSelectedStudent(studentId);
    setShowPaymentForm(false);
    setSelectedFeeForPayment(null);

    if (!studentId) {
      setStudentFees([]);
      return;
    }

    try {
      const res = await fetch(`/api/fees/student-fees?studentId=${studentId}`);
      const data = await res.json();
      setStudentFees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching student fees:', error);
      setStudentFees([]);
    }
  };

  const handleArrearsSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStudent) {
      alert('Please select a student first');
      return;
    }

    if (!selectedSession || !selectedTerm) {
      alert('Please select academic session and term for this arrears entry');
      return;
    }

    try {
      const res = await fetch('/api/fees/student-fees?action=standalone-arrears', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student: selectedStudent,
          academicSession: selectedSession,
          term: selectedTerm,
          title: arrearsForm.title,
          amount: Number(arrearsForm.amount || 0),
          description: arrearsForm.description,
          notes: arrearsForm.notes,
        }),
      });

      if (res.ok) {
        alert('Arrears created successfully');
        setArrearsForm({
          title: 'Student Arrears',
          amount: '',
          description: '',
          notes: '',
        });
        handleStudentSelect(selectedStudent);
      } else {
        const err = await res.json();
        alert(`Error: ${err?.error || 'Failed to create arrears'}`);
      }
    } catch (error) {
      console.error('Error creating arrears:', error);
      alert('Error creating arrears');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/fees/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentForm,
          studentFee: selectedFeeForPayment._id,
          student: selectedStudent,
          academicSession: selectedFeeForPayment.academicSession?._id,
          term: selectedFeeForPayment.term?._id,
        }),
      });

      if (res.ok) {
        alert('Payment recorded successfully');
        setShowPaymentForm(false);
        setSelectedFeeForPayment(null);
        setPaymentForm({
          amount: '',
          paymentMethod: 'cash',
          bankName: '',
          transactionId: '',
          notes: '',
        });
        handleStudentSelect(selectedStudent);
      } else {
        const err = await res.json();
        alert(`Error: ${err?.error || 'Failed to record payment'}`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const openPaymentForm = (fee) => {
    setSelectedFeeForPayment(fee);
    setPaymentForm((prev) => ({
      ...prev,
      amount: fee.balance.toString(),
    }));
    setShowPaymentForm(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-600';
      case 'partial':
        return 'text-yellow-600';
      case 'unpaid':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = (amount) => `N ${(amount || 0).toLocaleString()}`;
  const selectedStudentData = students.find((student) => student._id === selectedStudent);
  const feeSummary = studentFees.reduce(
    (acc, fee) => {
      acc.totalExpected += (fee.amount || 0) + (fee.arrears || 0);
      acc.totalPaid += fee.amountPaid || 0;
      acc.totalBalance += fee.balance || 0;
      acc.totalArrears += fee.feeCategory === 'arrears' ? (fee.balance || 0) : (fee.arrears || 0);
      return acc;
    },
    { totalExpected: 0, totalPaid: 0, totalBalance: 0, totalArrears: 0 }
  );

  if (loading) return <div className="p-3 sm:p-6">Loading...</div>;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Fee Collection</h1>
      </div>

      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Select Student</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={selectedStudent}
            onChange={(e) => handleStudentSelect(e.target.value)}
          >
            <option value="">Select a student</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.Name} {student.Class ? `- ${student.Class.name}` : ''}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              disabled={!selectedSession}
            >
              <option value="">Select term</option>
              {terms.map((term) => (
                <option key={term._id} value={term._id}>
                  {term.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {selectedStudent && (
        <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <Card>
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Selected Student</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm sm:text-base font-semibold break-words">{selectedStudentData?.Name || 'Student'}</div>
                <div className="text-xs text-gray-500 break-words">{selectedStudentData?.Class?.name || 'No class'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Expected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">{formatCurrency(feeSummary.totalExpected)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-red-600">{formatCurrency(feeSummary.totalBalance)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Student Arrears</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-amber-600">{formatCurrency(feeSummary.totalArrears)}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Add Separate Arrears</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Create a student-specific arrears charge that is separate from normal school fees. It can be paid later, including partial payments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleArrearsSubmit} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input
                      value={arrearsForm.title}
                      onChange={(e) => setArrearsForm({ ...arrearsForm, title: e.target.value })}
                      placeholder="Student Arrears"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount</label>
                    <Input
                      type="number"
                      min="0"
                      value={arrearsForm.amount}
                      onChange={(e) => setArrearsForm({ ...arrearsForm, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input
                    value={arrearsForm.description}
                    onChange={(e) => setArrearsForm({ ...arrearsForm, description: e.target.value })}
                    placeholder="Reason for this arrears"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <Input
                    value={arrearsForm.notes}
                    onChange={(e) => setArrearsForm({ ...arrearsForm, notes: e.target.value })}
                    placeholder="Optional admin note"
                  />
                </div>
                <div className="flex justify-stretch sm:justify-end">
                  <Button type="submit" className="w-full sm:w-auto">Add Arrears</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Student Charges</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Regular fees and standalone arrears for this student.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {studentFees.map((fee) => {
                  const feeName = fee.feeCategory === 'arrears'
                    ? fee.title || 'Student Arrears'
                    : fee.feeStructure?.name || fee.title || 'Fee';

                  const totalCharge = (fee.amount || 0) + (fee.arrears || 0);

                  return (
                    <div key={fee._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                      <div className="min-w-0 w-full sm:w-auto">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-sm sm:text-base break-words">{feeName}</p>
                          {fee.feeCategory === 'arrears' && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                              Arrears
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Session: {fee.academicSession?.name || 'N/A'} | Term: {fee.term?.name || 'N/A'}
                        </p>
                        {fee.feeCategory === 'arrears' ? (
                          <p className="text-xs sm:text-sm text-gray-500">
                            Total Arrears: {formatCurrency(fee.amount)}
                          </p>
                        ) : (
                          <>
                            <p className="text-xs sm:text-sm text-gray-500">
                              Original: {formatCurrency(fee.originalAmount)} | Current Fee: {formatCurrency(fee.amount)}
                            </p>
                            {fee.arrears > 0 && (
                              <p className="text-xs sm:text-sm text-gray-500">Legacy Arrears: {formatCurrency(fee.arrears)}</p>
                            )}
                          </>
                        )}
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <p className={`font-bold text-sm sm:text-base ${getStatusColor(fee.status)}`}>
                          {fee.status.toUpperCase()}
                        </p>
                        <p className="text-xs sm:text-sm">
                          Paid: {formatCurrency(fee.amountPaid)} | Balance: {formatCurrency(fee.balance)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">Charge: {formatCurrency(totalCharge)}</p>
                      </div>
                      {fee.balance > 0 && (
                        <Button variant="outline" onClick={() => openPaymentForm(fee)} className="w-full sm:w-auto text-xs sm:text-sm">
                          Record {fee.feeCategory === 'arrears' ? 'Arrears' : 'Payment'}
                        </Button>
                      )}
                    </div>
                  );
                })}
                {studentFees.length === 0 && (
                  <p className="text-center text-gray-500 py-4 text-sm sm:text-base">No fees or arrears found for this student</p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {showPaymentForm && selectedFeeForPayment && (
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">
              Record {selectedFeeForPayment.feeCategory === 'arrears' ? 'Arrears Payment' : 'Payment'}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm break-words">
              Charge: {selectedFeeForPayment.feeCategory === 'arrears'
                ? selectedFeeForPayment.title || 'Student Arrears'
                : selectedFeeForPayment.feeStructure?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePaymentSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <Input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  max={selectedFeeForPayment.balance}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Maximum payable: {formatCurrency(selectedFeeForPayment.balance)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="online">Online</option>
                  <option value="pos">POS</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              {paymentForm.paymentMethod === 'bank_transfer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bank Name</label>
                    <Input
                      value={paymentForm.bankName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Transaction ID</label>
                    <Input
                      value={paymentForm.transactionId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Input
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowPaymentForm(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Record Payment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
