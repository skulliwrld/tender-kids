'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FeeCollectionManager() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentFees, setStudentFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'cash',
    bankName: '',
    transactionId: '',
    notes: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/student?all=true');
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = async (studentId) => {
    setSelectedStudent(studentId);
    setShowPaymentForm(false);
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
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const openPaymentForm = (fee) => {
    setSelectedFeeForPayment(fee);
    setPaymentForm({
      ...paymentForm,
      amount: fee.balance.toString(),
    });
    setShowPaymentForm(true);
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

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Fee Collection</h1>
      </div>

      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Select Student</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {selectedStudent && (
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Student Fees</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {studentFees.length} fee(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {studentFees.map((fee) => (
                <div key={fee._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold text-sm sm:text-base">{fee.feeStructure?.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Original: ₦{fee.originalAmount?.toLocaleString()} | 
                      Current: ₦{fee.amount?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className={`font-bold text-sm sm:text-base ${getStatusColor(fee.status)}`}>
                      {fee.status.toUpperCase()}
                    </p>
                    <p className="text-xs sm:text-sm">
                      Paid: ₦{fee.amountPaid?.toLocaleString()} | 
                      Balance: ₦{fee.balance?.toLocaleString()}
                    </p>
                  </div>
                  {fee.balance > 0 && (
                    <Button variant="outline" onClick={() => openPaymentForm(fee)} className="w-full sm:w-auto text-xs sm:text-sm">
                      Record Payment
                    </Button>
                  )}
                </div>
              ))}
              {studentFees.length === 0 && (
                <p className="text-center text-gray-500 py-4 text-sm sm:text-base">No fees found for this student</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {showPaymentForm && selectedFeeForPayment && (
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Record Payment</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Fee: {selectedFeeForPayment.feeStructure?.name}</CardDescription>
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
                <Button type="submit" className="w-full sm:w-auto">Record Payment</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
