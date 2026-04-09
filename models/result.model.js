import mongoose from 'mongoose'

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
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
    academicSession: {
      type: String, // e.g., "2024-2025"
      required: true,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    obtainedMarks: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4,
    },
    overallGrade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'],
    },
    position: {
      type: Number, // Class rank/position
    },
    totalStudentsInClass: {
      type: Number,
    },
    remarks: {
      type: String,
      enum: ['Excellent', 'Very Good', 'Good', 'Average', 'Below Average', 'Poor'],
    },
    gradeDetails: [
      {
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
        },
        testScore: {
          type: Number,
          min: 0,
          max: 20,
          default: 0,
        },
        assignmentScore: {
          type: Number,
          min: 0,
          max: 10,
          default: 0,
        },
        examScore: {
          type: Number,
          min: 0,
          max: 70,
          default: 0,
        },
        total: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        grade: String,
        remarks: String,
      },
    ],
    promoted: {
      type: Boolean,
      default: true,
    },
    promotionRemarks: {
      type: String,
    },
  },
  { timestamps: true }
)

export const Result = mongoose.models.Result || mongoose.model('Result', resultSchema)
