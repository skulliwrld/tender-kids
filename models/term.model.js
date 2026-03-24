import { Schema, model, models } from "mongoose";

const termSchema = new Schema({
  name: {
    type: String,
    required: true,
    enum: ['First Term', 'Second Term', 'Third Term', 'Summer Term', 'Winter Term'],
  },
  academicSession: {
    type: Schema.Types.ObjectId,
    ref: 'AcademicSession',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  termNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
  },
}, { timestamps: true });

termSchema.index({ academicSession: 1, termNumber: 1 }, { unique: true });

export const Term = models.Term || model("Term", termSchema);
