import { connectToDB } from '@/lib/Database/connectToDB';
import { Payment } from '@/models/payment.model';
import { StudentFee } from '@/models/studentFee.model';
import mongoose from 'mongoose';

function generateReceiptNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RCP-${timestamp}-${random}`;
}

function generateTransactionId() {
  return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

export async function createPayment(data) {
  await connectToDB();
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const studentFee = await StudentFee.findById(data.studentFee);
    if (!studentFee) {
      throw new Error('Student fee not found');
    }
    
    const maxPayable = studentFee.balance;
    if (data.amount > maxPayable) {
      throw new Error(`Payment cannot exceed balance of ${maxPayable}`);
    }
    
    const payment = await Payment.create([{
      ...data,
      transactionId: data.transactionId || generateTransactionId(),
      referenceNumber: data.referenceNumber || generateTransactionId(),
      receiptNumber: generateReceiptNumber(),
      status: 'completed',
    }], { session });
    
    const payments = await Payment.find({ 
      studentFee: data.studentFee, 
      status: 'completed' 
    }).session(session);
    
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    let finalAmount = studentFee.amount;
    if (studentFee.isWaived) {
      finalAmount -= studentFee.waiverAmount;
    }
    
    const balance = Math.max(0, finalAmount - totalPaid);
    const status = balance <= 0 ? 'paid' : 'partial';
    
    await StudentFee.findByIdAndUpdate(data.studentFee, {
      amountPaid: totalPaid,
      balance,
      status,
    }, { session });
    
    await session.commitTransaction();
    
    return payment[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function getPayments(filters = {}) {
  await connectToDB();
  
  const query = { isDeleted: false };
  
  if (filters.academicSessionId) query.academicSession = filters.academicSessionId;
  if (filters.termId) query.term = filters.termId;
  if (filters.paymentDate) {
    query.paymentDate = {
      $gte: new Date(filters.paymentDate),
      $lt: new Date(new Date(filters.paymentDate).getTime() + 24 * 60 * 60 * 1000)
    };
  }
  
  return await Payment.find(query)
    .populate('student', 'Name Class section')
    .populate('academicSession', 'name')
    .populate('term', 'name termNumber')
    .populate('receivedBy', 'name email')
    .sort({ paymentDate: -1 });
}

export async function getStudentPayments(studentId, academicSessionId = null, termId = null, paymentDate = null) {
  await connectToDB();
  
  const query = { isDeleted: false };
  
  if (Array.isArray(studentId)) {
    query.student = { $in: studentId };
  } else if (studentId) {
    query.student = studentId;
  }
  
  if (academicSessionId) query.academicSession = academicSessionId;
  if (termId) query.term = termId;
  if (paymentDate) {
    query.paymentDate = {
      $gte: new Date(paymentDate),
      $lt: new Date(new Date(paymentDate).getTime() + 24 * 60 * 60 * 1000)
    };
  }
  
  return await Payment.find(query)
    .populate('student', 'Name')
    .populate('studentFee', 'feeStructure amount')
    .populate('studentFee.feeStructure', 'name')
    .populate('academicSession', 'name')
    .populate('term', 'name termNumber')
    .sort({ paymentDate: -1 });
}

export async function getPaymentById(id) {
  await connectToDB();
  return await Payment.findById(id)
    .populate('studentFee')
    .populate('student', 'Name Class section')
    .populate('academicSession', 'name')
    .populate('term', 'name termNumber')
    .populate('receivedBy', 'name email');
}

export async function reversePayment(paymentId, reason) {
  await connectToDB();
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    if (payment.status === 'refunded') {
      throw new Error('Payment already refunded');
    }
    
    await Payment.findByIdAndUpdate(paymentId, {
      status: 'refunded',
      notes: `${payment.notes || ''}\nRefunded: ${reason}`,
    }, { session });
    
    await recalculateFeeBalanceAfterPaymentReversal(payment.studentFee, session);
    
    await session.commitTransaction();
    
    return await Payment.findById(paymentId);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function recalculateFeeBalanceAfterPaymentReversal(studentFeeId, session) {
  const studentFee = await StudentFee.findById(studentFeeId).session(session);
  
  const payments = await Payment.find({
    studentFee: studentFeeId,
    status: 'completed',
  }).session(session);
  
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  let finalAmount = studentFee.amount;
  if (studentFee.isWaived) {
    finalAmount -= studentFee.waiverAmount;
  }
  
  const balance = Math.max(0, finalAmount - totalPaid);
  const status = balance <= 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';
  
  return await StudentFee.findByIdAndUpdate(studentFeeId, {
    amountPaid: totalPaid,
    balance,
    status,
  }, { session });
}

export async function getPaymentHistory(studentFeeId) {
  await connectToDB();
  return await Payment.find({ studentFee: studentFeeId, status: 'completed' })
    .populate('studentFee', 'feeStructure amount')
    .populate('studentFee.feeStructure', 'name')
    .sort({ paymentDate: -1 });
}

export async function bulkCreatePayments(paymentsData) {
  const results = { successful: [], failed: [] };
  
  for (const data of paymentsData) {
    try {
      const payment = await createPayment(data);
      results.successful.push(payment);
    } catch (error) {
      results.failed.push({ data, error: error.message });
    }
  }
  
  return results;
}
