'use client'

import React, { useState } from 'react'
import { IoAddCircleOutline, IoBook } from "react-icons/io5" 
import { FaChalkboardTeacher, FaTimes, FaSchool, FaAlignLeft } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { SubjectUpdate } from '@/lib/actions/subject.action'

function SubjectUpdateForm({content, Teacher, classes, role = 'admin'}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isTeacher = role === 'teacher'

  if (!content) {
    return <div>Loading or subject not found</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <IoBook className="text-xl sm:text-2xl text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-white">View Subject</h2>
                  <p className="text-purple-100 text-xs sm:text-sm">Subject details</p>
                </div>
              </div>
              <button 
                onClick={() => router.push('/subject')}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <FaTimes className="text-white text-sm sm:text-base" />
              </button>
            </div>
          </div>

          <form action={async (formData) => {
            setIsSubmitting(true)
            await SubjectUpdate(formData)
            setIsSubmitting(false)
            router.push('/subject')
          }} className="p-4 sm:p-8 space-y-4 sm:space-y-5">
            <input type="hidden" name="id" value={content._id} />

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Subject Name</label>
              <input 
                type="text" 
                name="Name" 
                defaultValue={content.Name}
                readOnly={isTeacher}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaSchool className="text-gray-400" /> Class</span>
              </label>
              <select 
                name="class" 
                defaultValue={content.class?._id || content.class}
                disabled={isTeacher}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 text-sm sm:text-base"
              >
                {classes?.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaChalkboardTeacher className="text-gray-400" /> Assigned Teacher</span>
              </label>
              <select 
                name="assignedTeacher" 
                defaultValue={content.assignedTeacher?._id || content.assignedTeacher}
                disabled={isTeacher}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 text-sm sm:text-base"
              >
                {Teacher?.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaAlignLeft className="text-gray-400" /> Description</span>
              </label>
              <textarea 
                name="description" 
                rows={3}
                defaultValue={content.description}
                readOnly={isTeacher}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 resize-none text-sm sm:text-base"
              />
            </div>

            {!isTeacher && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/subject')}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isSubmitting ? 'Updating...' : 'Update Subject'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default SubjectUpdateForm