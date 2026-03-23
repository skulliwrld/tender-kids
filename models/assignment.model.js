import { Schema, model, models } from 'mongoose'

const questionSchema = new Schema({
  question: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 1
  }
})

const submissionSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  answers: [{
    questionIndex: Number,
    answer: String
  }],
  score: {
    type: Number,
    default: null
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: null
  },
  gradedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true })

const assignmentSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  subject: {
    type: Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  class: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  questions: [questionSchema],
  deadline: {
    type: Date,
    required: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  submissions: [submissionSchema],
  isPublished: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

export const Assignment = models.Assignment || model('Assignment', assignmentSchema)
