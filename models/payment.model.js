import { Schema, model, models } from "mongoose";

const paymentSchema = new Schema({
  studentFee: {
    type: Schema.Types.ObjectId,
    ref: 'StudentFee',
    required: true,
  },
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
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'online', 'card', 'cheque', 'pos', 'other'],
    required: true,
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
  },
  referenceNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  receivedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  paymentChannel: {
    type: String,
  },
  bankName: {
    type: String,
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Index for looking up payments by student with most recent first
paymentSchema.index({ student: 1, paymentDate: -1 });
// Index for filtering payments by session and term
paymentSchema.index({ academicSession: 1, term: 1 });
// Note: transactionId, referenceNumber, receiptNumber already have indexes from unique: true

export const Payment = models.Payment || model("Payment", paymentSchema);
