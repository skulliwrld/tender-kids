import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema(
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
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Leave', 'Half Day'],
      required: true,
      default: 'Present',
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    remarks: {
      type: String,
    },
    academicSession: {
      type: String, // e.g., "2024-2025"
    },
  },
  { timestamps: true }
)

// Index for faster queries
attendanceSchema.index({ student: 1, date: 1 })
attendanceSchema.index({ class: 1, date: 1 })

export default mongoose.models.Attendance ||
  mongoose.model('Attendance', attendanceSchema)
