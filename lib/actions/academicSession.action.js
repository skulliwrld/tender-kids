import { connectToDB } from '@/lib/Database/connectToDB';
import { AcademicSession } from '@/models/academicSession.model';
import { Term } from '@/models/term.model';

export async function createAcademicSession(data) {
  await connectToDB();
  
  if (data.isActive) {
    await AcademicSession.updateMany({ isActive: true }, { isActive: false });
  }
  
  const session = await AcademicSession.create(data);
  return session;
}

export async function getAcademicSessions() {
  await connectToDB();
  return await AcademicSession.find({ isArchived: false }).sort({ startDate: -1 });
}

export async function getActiveAcademicSession() {
  await connectToDB();
  return await AcademicSession.findOne({ isActive: true });
}

export async function getAcademicSessionById(id) {
  await connectToDB();
  return await AcademicSession.findById(id);
}

export async function updateAcademicSession(id, data) {
  await connectToDB();
  
  if (data.isActive) {
    await AcademicSession.updateMany({ isActive: true }, { isActive: false });
  }
  
  return await AcademicSession.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteAcademicSession(id) {
  await connectToDB();
  return await AcademicSession.findByIdAndUpdate(id, { isArchived: true }, { new: true });
}

export async function createTerm(data) {
  await connectToDB();
  
  if (data.isActive) {
    await Term.updateMany({ academicSession: data.academicSession, isActive: true }, { isActive: false });
  }
  
  const term = await Term.create(data);
  return term;
}

export async function getTermsBySession(sessionId) {
  await connectToDB();
  return await Term.find({ academicSession: sessionId }).sort({ termNumber: 1 });
}

export async function getActiveTerm() {
  await connectToDB();
  return await Term.findOne({ isActive: true }).populate('academicSession');
}

export async function getTermById(id) {
  await connectToDB();
  return await Term.findById(id);
}

export async function updateTerm(id, data) {
  await connectToDB();
  
  if (data.isActive) {
    const term = await Term.findById(id);
    await Term.updateMany({ academicSession: term.academicSession, isActive: true }, { isActive: false });
  }
  
  return await Term.findByIdAndUpdate(id, data, { new: true });
}
