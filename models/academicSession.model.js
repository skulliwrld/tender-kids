import { Schema, model, models } from "mongoose";

const academicSessionSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
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
  isArchived: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export const AcademicSession = models.AcademicSession || model("AcademicSession", academicSessionSchema);
