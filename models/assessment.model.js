import mongoose from 'mongoose'

const assessmentSchema = new mongoose.Schema(
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
    assessmentType: {
      type: String,
      enum: ['Exam', 'Quiz', 'Assignment', 'Project', 'Midterm', 'Final'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    weight: {
      type: Number,
      min: 0,
      max: 100,
      default: 10, // Percentage weight in final calculation
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'],
    },
    feedback: {
      type: String,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    academicSession: {
      type: String, // e.g., "2024-2025"
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index to ensure unique assessments
assessmentSchema.index({
  student: 1,
  subject: 1,
  assessmentType: 1,
  title: 1,
  academicSession: 1
}, { unique: true })

// Virtual for percentage
assessmentSchema.virtual('percentage').get(function() {
  return (this.marks / this.totalMarks) * 100
})

// Method to calculate letter grade
assessmentSchema.methods.calculateLetterGrade = function() {
  const percentage = this.percentage

  if (percentage >= 95) return 'A+'
  else if (percentage >= 90) return 'A'
  else if (percentage >= 85) return 'A-'
  else if (percentage >= 80) return 'B+'
  else if (percentage >= 75) return 'B'
  else if (percentage >= 70) return 'B-'
  else if (percentage >= 65) return 'C+'
  else if (percentage >= 60) return 'C'
  else if (percentage >= 55) return 'C-'
  else if (percentage >= 50) return 'D+'
  else if (percentage >= 45) return 'D'
  else if (percentage >= 40) return 'D-'
  else return 'F'
}

const Assessment = mongoose.models.Assessment || mongoose.model('Assessment', assessmentSchema)

export { Assessment }