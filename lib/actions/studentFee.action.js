import { connectToDB } from '@/lib/Database/connectToDB';
import { StudentFee } from '@/models/studentFee.model';
import { Payment } from '@/models/payment.model';
import mongoose from 'mongoose';

export async function getStudentFees(studentId, academicSessionId = null, termId = null) {
  await connectToDB();
  
  const query = {};
  
  if (studentId) {
    try {
      query.student = new mongoose.Types.ObjectId(studentId);
    } catch (e) {
      query.student = studentId;
    }
  }
  
  if (academicSessionId) {
    try {
      query.academicSession = new mongoose.Types.ObjectId(academicSessionId);
    } catch (e) {
      query.academicSession = academicSessionId;
    }
  }
  
  if (termId) {
    try {
      query.term = new mongoose.Types.ObjectId(termId);
    } catch (e) {
      query.term = termId;
    }
  }
  
  return await StudentFee.find(query)
    .populate('student', 'Name')
    .populate('feeStructure', 'name feeType amount')
    .populate('academicSession', 'name')
    .populate('term', 'name termNumber')
    .sort({ createdAt: -1 });
}

export async function getStudentFeeSummary(studentId, academicSessionId = null, termId = null) {
  await connectToDB();
  
  const matchStage = { student: new mongoose.Types.ObjectId(studentId) };
  if (academicSessionId) matchStage.academicSession = new mongoose.Types.ObjectId(academicSessionId);
  if (termId) matchStage.term = new mongoose.Types.ObjectId(termId);
  
  const result = await StudentFee.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOriginalAmount: { $sum: '$originalAmount' },
        totalAmount: { $sum: '$amount' },
        totalPaid: { $sum: '$amountPaid' },
        totalBalance: { $sum: '$balance' },
        totalWaived: { $sum: '$waiverAmount' },
        feesCount: { $sum: 1 },
      },
    },
  ]);
  
  const statusBreakdown = await StudentFee.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        amount: { $sum: '$balance' },
      },
    },
  ]);
  
  return {
    summary: result[0] || { totalOriginalAmount: 0, totalAmount: 0, totalPaid: 0, totalBalance: 0, totalWaived: 0, feesCount: 0 },
    statusBreakdown,
  };
}

export async function getStudentFeeById(id) {
  await connectToDB();
  return await StudentFee.findById(id)
    .populate('feeStructure')
    .populate('student', 'Name Class section')
    .populate('academicSession', 'name')
    .populate('term', 'name termNumber');
}

export async function updateStudentFee(id, data) {
  await connectToDB();
  return await StudentFee.findByIdAndUpdate(id, data, { new: true });
}

export async function waiveStudentFee(id, waiverAmount, waiverReason) {
  await connectToDB();
  
  const studentFee = await StudentFee.findById(id);
  if (!studentFee) throw new Error('Student fee not found');
  
  const actualWaiver = Math.min(waiverAmount, studentFee.balance);
  
  const newBalance = studentFee.balance - actualWaiver;
  const newStatus = newBalance <= 0 ? 'waived' : 'partial';
  
  return await StudentFee.findByIdAndUpdate(id, {
    waiverAmount: actualWaiver,
    waiverReason,
    isWaived: true,
    balance: newBalance,
    status: newStatus,
  }, { new: true });
}

export async function deleteStudentFee(id) {
  await connectToDB();
  
  const hasPayments = await Payment.findOne({ studentFee: id });
  if (hasPayments) {
    throw new Error('Cannot delete fee with existing payments');
  }
  
  return await StudentFee.findByIdAndDelete(id);
}

export async function recalculateFeeBalance(studentFeeId) {
  await connectToDB();
  
  const studentFee = await StudentFee.findById(studentFeeId);
  if (!studentFee) throw new Error('Student fee not found');
  
  const payments = await Payment.find({ studentFee: studentFeeId, status: 'completed' });
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
  }, { new: true });
}
