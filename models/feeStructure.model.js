import { Schema, model, models } from "mongoose";

const feeStructureSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
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
  classLevel: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  feeType: {
    type: String,
    enum: ['tuition', 'registration', 'exam', 'transport', 'hostel', 'library', 'sports', 'uniform', 'other'],
    default: 'tuition',
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'NGN',
  },
  dueDate: {
    type: Date,
  },
  isOptional: {
    type: Boolean,
    default: false,
  },
  penaltyAmount: {
    type: Number,
    default: 0,
  },
  penaltyStartDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

feeStructureSchema.index({ academicSession: 1, term: 1, classLevel: 1, feeType: 1 }, { unique: true });

export const FeeStructure = models.FeeStructure || model("FeeStructure", feeStructureSchema);
