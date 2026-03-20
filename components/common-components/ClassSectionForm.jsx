'use client'

import React, { useState } from 'react'
import { IoAddCircleOutline, IoLayers } from "react-icons/io5" 
import { FaChalkboardTeacher, FaTimes, FaSchool, FaTag } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { addClassSection } from '@/lib/actions/classsection.action'

function ClassSectionForm({Classes, Teacher}) {
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
                  <IoLayers className="text-2xl text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Add Class Section</h2>
                  <p className="text-purple-100 text-sm">Create a new section for a class</p>
                </div>
              </div>
              <button 
                onClick={() => router.push('/class/manage-section')}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <FaTimes className="text-white" />
              </button>
            </div>
          </div>

          <form action={async (formData) => {
            setIsSubmitting(true)
            await addClassSection(formData)
            setIsSubmitting(false)
            router.push('/class/manage-section')
          }} className="p-8 space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaTag className="text-gray-400" /> Section Name</span>
              </label>
              <input 
                type="text" 
                name="Name" 
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
                placeholder="e.g., Section A, Section B"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Nick Name</label>
              <input 
                type="text" 
                name="NickName" 
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
                placeholder="e.g., A, B (optional)"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaSchool className="text-gray-400" /> Class</span>
              </label>
              <select 
                name="CLASS" 
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
              >
                <option value="">Select a class</option>
                {Classes?.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaChalkboardTeacher className="text-gray-400" /> Section Teacher</span>
              </label>
              <select 
                name="sectionTeacher" 
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
              >
                <option value="">Select a teacher (optional)</option>
                {Teacher?.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.push('/class/manage-section')}
                className="flex-1 bg-gray-100 text-gray-700 py-3.5 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Section'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ClassSectionForm