'use client'

import React, { useState } from 'react'
import { IoAddCircleOutline, IoSchool } from "react-icons/io5" 
import { FaChalkboardTeacher, FaTimes } from "react-icons/fa"
import { useRouter } from 'next/navigation'

function ClassForm({Teacher, handleAdd}) {
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
                  <IoSchool className="text-2xl text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Add New Class</h2>
                  <p className="text-purple-100 text-sm">Create a new class for your school</p>
                </div>
              </div>
              <button 
                onClick={() => router.push('/class')}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <FaTimes className="text-white" />
              </button>
            </div>
          </div>

          <form action={async (formData) => {
            setIsSubmitting(true)
            await handleAdd(formData)
            setIsSubmitting(false)
            router.push('/class')
          }} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Class Name</label>
              <input 
                type="text" 
                name="Name" 
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white"
                placeholder="e.g., Primary 1, Nursery 2, Basic 3"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Numeric ID</label>
              <input 
                type="number" 
                name="number" 
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white"
                placeholder="e.g., 1, 2, 3"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2">
                  <FaChalkboardTeacher className="text-gray-400" />
                  Class Teacher
                </span>
              </label>
              <select 
                name="assignedTeacher" 
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
              >
                <option value="">Select a teacher (optional)</option>
                {Teacher?.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.push('/class')}
                className="flex-1 bg-gray-100 text-gray-700 py-3.5 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Class'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ClassForm