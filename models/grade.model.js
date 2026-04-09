import mongoose from 'mongoose'

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    term: {
      type: String,
      enum: ['Term 1', 'Term 2', 'Term 3', 'Mid Term', 'Final'],
      required: true,
    },
    exam: {
      type: String,
      enum: ['Test', 'Assignment', 'Exam'],
      required: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'],
    },
    feedback: {
      type: String,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    academicSession: {
      type: String, // e.g., "2024-2025"
    },
  },
  { timestamps: true }
)

export default mongoose.models.Grade || mongoose.model('Grade', gradeSchema)
