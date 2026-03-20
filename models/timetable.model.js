import { Schema, model, models } from "mongoose"

const PeriodSchema = new Schema({
  subject: {
    type: Schema.Types.ObjectId,
    ref: "Subject"
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  startPeriod: {
    type: String,
    enum: ['AM', 'PM'],
    default: 'AM'
  },
  endPeriod: {
    type: String,
    enum: ['AM', 'PM'],
    default: 'PM'
  }
}, { _id: false })

const TimetableSchema = new Schema({
  Class: {
    type: Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  periods: {
    type: [PeriodSchema],
    validate: {
      validator: function(v) {
        return v.length === 3
      },
      message: 'Each day must have exactly 3 periods'
    }
  }
}, { timestamps: true })

TimetableSchema.index({ Class: 1, day: 1 }, { unique: true })

export const Timetable = models.Timetable || model("Timetable", TimetableSchema)
