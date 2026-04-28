import { connectToDB } from '@/lib/Database/connectToDB';
import { FeeStructure } from '@/models/feeStructure.model';
import { Payment } from '@/models/payment.model';
import { Student } from '@/models/student.model';
import { StudentFee } from '@/models/studentFee.model';
import mongoose from 'mongoose';

function getFinalFeeAmount(feeStructure) {
  let finalAmount = feeStructure.amount;

  if (feeStructure.penaltyStartDate && new Date() > feeStructure.penaltyStartDate) {
    finalAmount += feeStructure.penaltyAmount;
  }

  return finalAmount;
}

function getStudentFeeStatus(amountPaid, effectiveAmount) {
  if (amountPaid > effectiveAmount) return 'overpaid';
  if (effectiveAmount <= 0) return 'waived';
  if (amountPaid === 0) return 'unpaid';
  if (amountPaid >= effectiveAmount) return 'paid';
  return 'partial';
}

export async function createFeeStructure(data) {
  await connectToDB();
  
  const existing = await FeeStructure.findOne({
    academicSession: data.academicSession,
    term: data.term,
    classLevel: data.classLevel,
    feeType: data.feeType,
  });
  
  if (existing) {
    throw new Error('Fee structure already exists for this combination');
  }
  
  const feeStructure = await FeeStructure.create(data);
  return feeStructure;
}

export async function getFeeStructures(filters = {}) {
  await connectToDB();
  const query = { isActive: true, ...filters };
  
  return await FeeStructure.find(query)
    .populate('classLevel', 'name numericId')
    .populate('academicSession', 'name')
    .populate('term', 'name termNumber')
    .sort({ createdAt: -1 });
}

export async function getFeeStructureById(id) {
  await connectToDB();
  return await FeeStructure.findById(id)
    .populate('classLevel', 'name numericId')
    .populate('academicSession', 'name')
    .populate('term', 'name termNumber');
}

export async function getFeeStructuresByClass(classId, academicSessionId, termId) {
  await connectToDB();
  return await FeeStructure.find({
    classLevel: classId,
    academicSession: academicSessionId,
    term: termId,
    isActive: true,
  });
}

export async function updateFeeStructure(id, data) {
  await connectToDB();
  return await FeeStructure.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteFeeStructure(id) {
  await connectToDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const feeStructure = await FeeStructure.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true, session }
    );

    if (!feeStructure) {
      throw new Error('Fee structure not found');
    }

    const studentFees = await StudentFee.find({ feeStructure: id }).select('_id').session(session);
    const studentFeeIds = studentFees.map((fee) => fee._id);

    if (studentFeeIds.length > 0) {
      await Payment.updateMany(
        { studentFee: { $in: studentFeeIds } },
        { isDeleted: true },
        { session }
      );

      await StudentFee.deleteMany({ _id: { $in: studentFeeIds } }, { session });
    }

    await session.commitTransaction();
    return feeStructure;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function bulkCreateFeeStructures(feeStructures) {
  await connectToDB();
  
  const created = [];
  const errors = [];
  
  for (const data of feeStructures) {
    try {
      const existing = await FeeStructure.findOne({
        academicSession: data.academicSession,
        term: data.term,
        classLevel: data.classLevel,
        feeType: data.feeType,
      });
      
      if (existing) {
        errors.push({ data, error: 'Already exists' });
        continue;
      }
      
      const feeStructure = await FeeStructure.create(data);
      created.push(feeStructure);
    } catch (error) {
      errors.push({ data, error: error.message });
    }
  }
  
  return { created, errors };
}

export async function assignFeeToStudents(feeStructureId, studentIds = []) {
  await connectToDB();
  
  const feeStructure = await FeeStructure.findById(feeStructureId)
    .populate('classLevel');
  
  if (!feeStructure) {
    throw new Error('Fee structure not found');
  }
  
  let students;
  if (studentIds.length > 0) {
    students = await Student.find({ _id: { $in: studentIds }, Class: feeStructure.classLevel._id });
  } else {
    students = await Student.find({ Class: feeStructure.classLevel._id });
  }
  
  const studentFees = [];
  let updatedCount = 0;
  const finalAmount = getFinalFeeAmount(feeStructure);
  
  for (const student of students) {
    const existingFee = await StudentFee.findOne({
      student: student._id,
      feeStructure: feeStructureId,
    });

    if (existingFee) {
      const waiverAmount = existingFee.isWaived ? (existingFee.waiverAmount || 0) : 0;
      const effectiveAmount = Math.max(0, finalAmount - waiverAmount);
      const balance = Math.max(0, effectiveAmount - (existingFee.amountPaid || 0));
      const status = getStudentFeeStatus(existingFee.amountPaid || 0, effectiveAmount);

      await StudentFee.findByIdAndUpdate(existingFee._id, {
        academicSession: feeStructure.academicSession,
        term: feeStructure.term,
        originalAmount: feeStructure.amount,
        amount: finalAmount,
        balance,
        status,
        dueDate: feeStructure.dueDate,
      });

      updatedCount += 1;
      continue;
    }
    
    studentFees.push({
      student: student._id,
      academicSession: feeStructure.academicSession,
      term: feeStructure.term,
      feeStructure: feeStructureId,
      originalAmount: feeStructure.amount,
      amount: finalAmount,
      amountPaid: 0,
      balance: finalAmount,
      status: 'unpaid',
      dueDate: feeStructure.dueDate,
      penaltyAmount: 0,
    });
  }
  
  if (studentFees.length > 0) {
    await StudentFee.insertMany(studentFees);
  }
  
  return {
    assigned: studentFees.length,
    updated: updatedCount,
    skipped: students.length - studentFees.length - updatedCount,
  };
}

export async function assignFeeToAllStudents(feeStructureId) {
  return assignFeeToStudents(feeStructureId, []);
}
