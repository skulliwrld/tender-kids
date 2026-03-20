'use client'

import React, { useState } from 'react'
import { IoAddCircleOutline, IoBook } from "react-icons/io5" 
import { FaChalkboardTeacher, FaTimes, FaSchool, FaAlignLeft, FaArrowLeft } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { addSubject } from '@/lib/actions/subject.action'

function SubjectForm({classes, Teachers}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <button 
            onClick={() => router.push('/subject')}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-4 transition-colors"
          >
            <FaArrowLeft />
            Back to Subjects
        </button>
        
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <IoBook className="text-2xl text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Add New Subject</h2>
                  <p className="text-purple-100 text-sm">Create a new subject for your school</p>
                </div>
              </div>
              <button 
                onClick={() => router.push('/subject')}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <FaTimes className="text-white" />
              </button>
            </div>
          </div>

          <form action={async (formData) => {
            setIsSubmitting(true)
            await addSubject(formData)
            setIsSubmitting(false)
            router.push('/subject')
          }} className="p-8 space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Subject Name</label>
              <input 
                type="text" 
                name="name" 
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
                placeholder="e.g., Mathematics, English, Science"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaChalkboardTeacher className="text-gray-400" /> Assigned Teacher (Optional)</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">You can assign a teacher now or later when assigning to classes</p>
              <select 
                name="teacher" 
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
              >
                <option value="">Select a teacher (optional)</option>
                {Teachers?.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaAlignLeft className="text-gray-400" /> Description</span>
              </label>
              <textarea 
                name="desc" 
                rows={4}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white resize-none"
                placeholder="Enter subject description (optional)"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> After creating the subject, go to "Assign to Classes" to add this subject to specific classes.
              </p>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.push('/subject')}
                className="flex-1 bg-gray-100 text-gray-700 py-3.5 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Subject'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SubjectForm
