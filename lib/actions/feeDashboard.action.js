import { connectToDB } from '@/lib/Database/connectToDB';
import { StudentFee } from '@/models/studentFee.model';
import { Payment } from '@/models/payment.model';
import { Student } from '@/models/student.model';
import { FeeStructure } from '@/models/feeStructure.model';
import mongoose from 'mongoose';

export async function getAdminFeeDashboard(academicSessionId = null, termId = null) {
  await connectToDB();
  
  const sessionMatch = academicSessionId ? { academicSession: new mongoose.Types.ObjectId(academicSessionId) } : {};
  const termMatch = termId ? { term: new mongoose.Types.ObjectId(termId) } : {};
  const matchStage = { ...sessionMatch, ...termMatch };
  
  const overallSummary = await StudentFee.aggregate([
    { $match: {} },
    {
      $group: {
        _id: null,
        totalExpected: { $sum: '$amount' },
        totalPaid: { $sum: '$amountPaid' },
        totalBalance: { $sum: '$balance' },
        feesCount: { $sum: 1 },
      },
    },
  ]);
  
  const periodSummary = await StudentFee.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalExpected: { $sum: '$amount' },
        totalPaid: { $sum: '$amountPaid' },
        totalBalance: { $sum: '$balance' },
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
        amount: { $sum: '$amount' },
        amountPaid: { $sum: '$amountPaid' },
        balance: { $sum: '$balance' },
      },
    },
  ]);
  
  const collectionByMethod = await Payment.aggregate([
    { $match: { ...matchStage, status: 'completed' } },
    {
      $group: {
        _id: '$paymentMethod',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);
  
  const recentPayments = await Payment.find({ ...matchStage, status: 'completed' })
    .populate('student', 'Name')
    .sort({ paymentDate: -1 })
    .limit(10);
  
  const topDebtors = await StudentFee.aggregate([
    { $match: { ...matchStage, status: { $in: ['unpaid', 'partial'] } } },
    {
      $group: {
        _id: '$student',
        totalOwed: { $sum: '$balance' },
        feesCount: { $sum: 1 },
      },
    },
    { $sort: { totalOwed: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'students',
        localField: '_id',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: '$student' },
    {
      $project: {
        _id: '$student._id',
        name: '$student.Name',
        class: '$student.Class',
        totalOwed: 1,
        feesCount: 1,
      },
    },
  ]);
  
  return {
    overallSummary: overallSummary[0] || { totalExpected: 0, totalPaid: 0, totalBalance: 0, feesCount: 0 },
    periodSummary: periodSummary[0] || { totalExpected: 0, totalPaid: 0, totalBalance: 0, feesCount: 0 },
    statusBreakdown,
    collectionByMethod,
    recentPayments,
    topDebtors,
  };
}

export async function getClassFeeReport(classId, academicSessionId, termId = null) {
  await connectToDB();
  
  const matchStage = {
    'student.Class': new mongoose.Types.ObjectId(classId),
  };
  if (academicSessionId) matchStage.academicSession = new mongoose.Types.ObjectId(academicSessionId);
  if (termId) matchStage.term = new mongoose.Types.ObjectId(termId);
  
  const classSummary = await StudentFee.aggregate([
    {
      $lookup: {
        from: 'students',
        localField: 'student',
        foreignField: '_id',
        as: 'studentData',
      },
    },
    { $unwind: '$studentData' },
    {
      $match: {
        'studentData.Class': new mongoose.Types.ObjectId(classId),
        ...(academicSessionId && { academicSession: new mongoose.Types.ObjectId(academicSessionId) }),
        ...(termId && { term: new mongoose.Types.ObjectId(termId) }),
      },
    },
    {
      $group: {
        _id: '$student',
        studentName: { $first: '$studentData.Name' },
        totalExpected: { $sum: '$amount' },
        totalPaid: { $sum: '$amountPaid' },
        totalBalance: { $sum: '$balance' },
        feesCount: { $sum: 1 },
      },
    },
    { $sort: { totalBalance: -1 } },
  ]);
  
  const totals = await StudentFee.aggregate([
    {
      $lookup: {
        from: 'students',
        localField: 'student',
        foreignField: '_id',
        as: 'studentData',
      },
    },
    { $unwind: '$studentData' },
    {
      $match: {
        'studentData.Class': new mongoose.Types.ObjectId(classId),
        ...(academicSessionId && { academicSession: new mongoose.Types.ObjectId(academicSessionId) }),
        ...(termId && { term: new mongoose.Types.ObjectId(termId) }),
      },
    },
    {
      $group: {
        _id: null,
        totalExpected: { $sum: '$amount' },
        totalPaid: { $sum: '$amountPaid' },
        totalBalance: { $sum: '$balance' },
        studentCount: { $addToSet: '$student' },
      },
    },
  ]);
  
  return {
    students: classSummary,
    totals: totals[0] || { totalExpected: 0, totalPaid: 0, totalBalance: 0, studentCount: 0 },
  };
}

export async function getPaymentReport(startDate, endDate, academicSessionId = null, termId = null) {
  await connectToDB();
  
  const query = {
    paymentDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    status: 'completed',
  };
  if (academicSessionId) query.academicSession = new mongoose.Types.ObjectId(academicSessionId);
  if (termId) query.term = new mongoose.Types.ObjectId(termId);
  
  const dailyCollections = await Payment.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' },
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  
  const totalCollection = await Payment.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);
  
  return {
    dailyCollections,
    totalCollection: totalCollection[0] || { total: 0, count: 0 },
  };
}

export async function getOutstandingBalances(academicSessionId = null, termId = null, minBalance = 0) {
  await connectToDB();
  
  const matchStage = { status: { $in: ['unpaid', 'partial'] }, balance: { $gte: minBalance } };
  if (academicSessionId) matchStage.academicSession = new mongoose.Types.ObjectId(academicSessionId);
  if (termId) matchStage.term = new mongoose.Types.ObjectId(termId);
  
  const outstanding = await StudentFee.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'students',
        localField: 'student',
        foreignField: '_id',
        as: 'studentData',
      },
    },
    { $unwind: '$studentData' },
    {
      $lookup: {
        from: 'classes',
        localField: 'studentData.Class',
        foreignField: '_id',
        as: 'classData',
      },
    },
    { $unwind: '$classData' },
    {
      $group: {
        _id: '$student',
        studentName: { $first: '$studentData.Name' },
        className: { $first: '$classData.name' },
        totalOwed: { $sum: '$balance' },
        feesCount: { $sum: 1 },
      },
    },
    { $sort: { totalOwed: -1 } },
  ]);
  
  return outstanding;
}

export async function getFeeCollectionStats(academicSessionId) {
  await connectToDB();
  
  const sessions = academicSessionId 
    ? [new mongoose.Types.ObjectId(academicSessionId)] 
    : await mongoose.model('AcademicSession').distinct('_id');
  
  const stats = await StudentFee.aggregate([
    { $match: { academicSession: { $in: sessions } } },
    {
      $group: {
        _id: {
          session: '$academicSession',
          term: '$term',
        },
        totalExpected: { $sum: '$amount' },
        totalPaid: { $sum: '$amountPaid' },
        totalBalance: { $sum: '$balance' },
        feesCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'academicsessions',
        localField: '_id.session',
        foreignField: '_id',
        as: 'session',
      },
    },
    { $unwind: '$session' },
    {
      $lookup: {
        from: 'terms',
        localField: '_id.term',
        foreignField: '_id',
        as: 'term',
      },
    },
    { $unwind: '$term' },
    { $sort: { 'session.startDate': -1, 'term.termNumber': 1 } },
  ]);
  
  return stats;
}
