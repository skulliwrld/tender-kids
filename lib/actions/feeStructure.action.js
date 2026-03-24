import { connectToDB } from '@/lib/Database/connectToDB';
import { FeeStructure } from '@/models/feeStructure.model';
import { Student } from '@/models/student.model';
import { StudentFee } from '@/models/studentFee.model';

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
  return await FeeStructure.findByIdAndUpdate(id, { isActive: false }, { new: true });
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
  
  for (const student of students) {
    const existingFee = await StudentFee.findOne({
      student: student._id,
      feeStructure: feeStructureId,
    });
    
    if (existingFee) {
      continue;
    }
    
    let finalAmount = feeStructure.amount;
    let dueDate = feeStructure.dueDate;
    
    if (feeStructure.penaltyStartDate && new Date() > feeStructure.penaltyStartDate) {
      finalAmount += feeStructure.penaltyAmount;
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
      dueDate,
      penaltyAmount: 0,
    });
  }
  
  if (studentFees.length > 0) {
    await StudentFee.insertMany(studentFees);
  }
  
  return { assigned: studentFees.length, skipped: students.length - studentFees.length };
}

export async function assignFeeToAllStudents(feeStructureId) {
  return assignFeeToStudents(feeStructureId, []);
}
