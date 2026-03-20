'use client'

import React, { useState } from 'react'
import { FaPlus, FaTimes, FaSchool, FaCalendarAlt, FaClock, FaBook, FaCalendar } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { createTimetable } from '@/lib/actions/timetable.action'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

function TimetableForm({ classes, subjects }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDay, setSelectedDay] = useState('')
  const [periods, setPeriods] = useState([
    { subject: '', startTime: '', endTime: '', startPeriod: 'AM', endPeriod: 'AM' },
    { subject: '', startTime: '', endTime: '', startPeriod: 'AM', endPeriod: 'AM' },
    { subject: '', startTime: '', endTime: '', startPeriod: 'AM', endPeriod: 'AM' }
  ])

  const handlePeriodChange = (index, field, value) => {
    const newPeriods = [...periods]
    newPeriods[index] = { ...newPeriods[index], [field]: value }
    setPeriods(newPeriods)
  }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      await createTimetable(formData)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <FaCalendar className="text-xl md:text-2xl text-white" />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-white">Create Timetable</h2>
                  <p className="text-purple-100 text-xs md:text-sm">Set 3 subjects per day (Mon-Fri)</p>
                </div>
              </div>
              <button 
                onClick={() => router.push('/timetable')}
                className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <FaTimes className="text-white text-sm md:text-base" />
              </button>
            </div>
          </div>

          <form action={handleSubmit} className="p-4 md:p-8 space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center gap-2"><FaSchool className="text-gray-400" /> Class</span>
                </label>
                <select 
                  name="Class" 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  required
                  className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white text-sm md:text-base"
                >
                  <option value="">Select a class</option>
                  {classes?.map((cls) => (
                    <option key={cls._id} value={cls._id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center gap-2"><FaCalendarAlt className="text-gray-400" /> Day</span>
                </label>
                <select 
                  name="day" 
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  required
                  className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white text-sm md:text-base"
                >
                  <option value="">Select a day</option>
                  {DAYS.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 md:pt-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                <FaBook className="text-purple-600" />
                Periods (3 subjects per day)
              </h3>
              
              <div className="space-y-4">
                {periods.map((period, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-3 md:p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                        Period {index + 1}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                        <select 
                          name={`subject${index + 1}`}
                          value={period.subject}
                          onChange={(e) => handlePeriodChange(index, 'subject', e.target.value)}
                          required
                          className="w-full px-2 md:px-3 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white text-sm"
                        >
                          <option value="">Select subject</option>
                          {subjects?.map((sub) => (
                            <option key={sub._id} value={sub._id}>{sub.Name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                        <div className="flex gap-1">
                          <input 
                            type="time" 
                            name={`startTime${index + 1}`}
                            value={period.startTime}
                            onChange={(e) => handlePeriodChange(index, 'startTime', e.target.value)}
                            required
                            className="flex-1 px-2 md:px-3 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white text-sm"
                          />
                          <select 
                            name={`startPeriod${index + 1}`}
                            value={period.startPeriod}
                            onChange={(e) => handlePeriodChange(index, 'startPeriod', e.target.value)}
                            className="w-12 md:w-16 px-1 md:px-1 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white text-sm"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                        <div className="flex gap-1">
                          <input 
                            type="time" 
                            name={`endTime${index + 1}`}
                            value={period.endTime}
                            onChange={(e) => handlePeriodChange(index, 'endTime', e.target.value)}
                            required
                            className="flex-1 px-2 md:px-3 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white text-sm"
                          />
                          <select 
                            name={`endPeriod${index + 1}`}
                            value={period.endPeriod}
                            onChange={(e) => handlePeriodChange(index, 'endPeriod', e.target.value)}
                            className="w-12 md:w-16 px-1 md:px-1 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white text-sm"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 md:gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.push('/timetable')}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 md:py-3.5 px-4 md:px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedClass || !selectedDay}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 md:py-3.5 px-4 md:px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {isSubmitting ? 'Saving...' : 'Save Timetable'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TimetableForm
