'use client'

import React, { useState } from 'react'
import { IoAddCircleOutline, IoTime } from "react-icons/io5" 
import { FaChalkboardTeacher, FaTimes, FaSchool, FaCalendarAlt, FaClock } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { addRoutine } from '@/lib/actions/classroutine.action'

function ClassRoutineForm({Class, Subject, Days}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <IoTime className="text-2xl text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Add Class Routine</h2>
                  <p className="text-purple-100 text-sm">Create a new class schedule</p>
                </div>
              </div>
              <button 
                onClick={() => router.push('/classroutine')}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <FaTimes className="text-white" />
              </button>
            </div>
          </div>

          <form action={async (formData) => {
            setIsSubmitting(true)
            await addRoutine(formData)
            setIsSubmitting(false)
            router.push('/classroutine')
          }} className="p-8 space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaSchool className="text-gray-400" /> Class</span>
              </label>
              <select 
                name="Class" 
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
              >
                <option value="">Select a class</option>
                {Class?.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaChalkboardTeacher className="text-gray-400" /> Subject</span>
              </label>
              <select 
                name="Subject" 
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
              >
                <option value="">Select a subject</option>
                {Subject?.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.Name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaCalendarAlt className="text-gray-400" /> Day</span>
              </label>
              <select 
                name="Day" 
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
              >
                <option value="">Select a day</option>
                {Days?.map((day) => (
                  <option key={day._id} value={day._id}>{day.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center gap-2"><FaClock className="text-gray-400" /> Start Time</span>
                </label>
                <div className="flex gap-2">
                  <input 
                    type="time" 
                    name="startingTime" 
                    required
                    className="flex-1 px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
                  />
                  <select 
                    name="startPeriod" 
                    className="w-20 px-2 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center gap-2"><FaClock className="text-gray-400" /> End Time</span>
                </label>
                <div className="flex gap-2">
                  <input 
                    type="time" 
                    name="endingTime" 
                    required
                    className="flex-1 px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
                  />
                  <select 
                    name="endPeriod" 
                    className="w-20 px-2 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.push('/classroutine')}
                className="flex-1 bg-gray-100 text-gray-700 py-3.5 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Routine'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ClassRoutineForm