import { Schema, model, models } from "mongoose";

const studentFeeSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  academicSession: {
    type: Schema.Types.ObjectId,
    ref: 'AcademicSession',
    required: true,
  },
  term: {
    type: Schema.Types.ObjectId,
    ref: 'Term',
    required: true,
  },
  feeStructure: {
    type: Schema.Types.ObjectId,
    ref: 'FeeStructure',
    default: null,
    required() {
      return this.feeCategory !== 'arrears';
    },
  },
  feeCategory: {
    type: String,
    enum: ['school_fee', 'arrears'],
    default: 'school_fee',
  },
  title: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
  },
  originalAmount: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'overpaid', 'waived'],
    default: 'unpaid',
  },
  dueDate: {
    type: Date,
  },
  penaltyAmount: {
    type: Number,
    default: 0,
  },
  arrears: {
    type: Number,
    default: 0,
  },
  waiverAmount: {
    type: Number,
    default: 0,
  },
  waiverReason: {
    type: String,
  },
  isWaived: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
  },
}, { timestamps: true });

studentFeeSchema.index(
  { student: 1, academicSession: 1, term: 1, feeStructure: 1 },
  { unique: true, partialFilterExpression: { feeStructure: { $exists: true, $type: 'objectId' } } }
);
studentFeeSchema.index({ student: 1, status: 1 });
studentFeeSchema.index({ academicSession: 1, term: 1, status: 1 });
studentFeeSchema.index({ student: 1, feeCategory: 1, createdAt: -1 });

if (models.StudentFee) {
  delete models.StudentFee;
}

export const StudentFee = model("StudentFee", studentFeeSchema);
