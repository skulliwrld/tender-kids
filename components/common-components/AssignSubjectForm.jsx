'use client'

import React, { useState, useEffect } from 'react'
import { FaBookOpen, FaLayerGroup, FaChalkboardTeacher, FaCheck, FaTimes, FaPlus, FaArrowLeft } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { assignSubjectsToClass } from '@/lib/actions/subject.action'

function AssignSubjectForm({ classes, subjects, teachers }) {
  const router = useRouter()
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Get current subjects for selected class
  const currentClass = classes.find(c => c._id === selectedClass)
  const assignedSubjectIds = currentClass?.subjects || []

  // Initialize selected subjects with already assigned ones
  useEffect(() => {
    if (selectedClass && subjects) {
      const assigned = subjects.filter(s => 
        s.classes && s.classes.some(c => c._id === selectedClass || c === selectedClass)
      ).map(s => s._id)
      setSelectedSubjects(assigned)
    }
  }, [selectedClass, subjects])

  const toggleSubject = (subjectId) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    )
  }

  const handleSubmit = async () => {
    if (!selectedClass) {
      alert('Please select a class')
      return
    }

    setIsSubmitting(true)
    try {
      await assignSubjectsToClass(selectedClass, selectedSubjects)
      setSuccess(true)
      setTimeout(() => {
        router.push(`/subject/${selectedClass}`)
      }, 1000)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to assign subjects')
    } finally {
      setIsSubmitting(false)
    }
  }

  const colors = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-blue-500',
    'from-rose-500 to-pink-500',
    'from-violet-500 to-purple-500',
    'from-teal-500 to-green-500',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 p-3 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <button 
            onClick={() => router.push('/subject')}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
          >
            <FaArrowLeft />
            <span className="hidden sm:inline">Back to Subjects</span>
            <span className="sm:hidden">Back</span>
          </button>
          
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 sm:p-6 text-white">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <FaLayerGroup className="text-xl sm:text-2xl" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">Assign Subjects to Class</h1>
                <p className="text-purple-200 text-xs sm:text-sm">Select a class and choose subjects from the list</p>
              </div>
            </div>
          </div>
        </div>

        {/* Class Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <FaLayerGroup className="text-purple-600" />
            Select Class
          </h2>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 text-sm sm:text-base"
          >
            <option value="">Choose a class...</option>
            {classes?.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name} {cls.numericId ? `(ID: ${cls.numericId})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Selection */}
        {selectedClass && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaBookOpen className="text-purple-600" />
                Select Subjects
                <span className="text-sm font-normal text-gray-500">
                  ({selectedSubjects.length} selected)
                </span>
              </h2>
            </div>

            {subjects && subjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {subjects.map((subject, index) => {
                  const isSelected = selectedSubjects.includes(subject._id)
                  const color = colors[index % colors.length]
                  
                  return (
                    <div
                      key={subject._id}
                      onClick={() => toggleSubject(subject._id)}
                      className={`relative p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-50 shadow-md' 
                          : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                      }`}
                    >
                      {/* Checkmark indicator */}
                      <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 w-5 sm:w-6 h-5 sm:h-6 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {isSelected && <FaCheck className="text-xs" />}
                      </div>

                      <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-2 sm:mb-3`}>
                        <FaBookOpen className="text-white text-sm sm:text-base" />
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">{subject.Name}</h3>
                      
                      {subject.assignedTeacher && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <FaChalkboardTeacher className="text-xs" />
                          {subject.assignedTeacher.name}
                        </p>
                      )}
                      
                      {subject.description && (
                        <p className="text-xs text-gray-400 mt-1 sm:mt-2 line-clamp-2">{subject.description}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <FaBookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">No Subjects Available</h3>
                <p className="text-gray-500 mb-3 sm:mb-4 text-sm">Create subjects first in the subject list.</p>
                <button
                  onClick={() => router.push('/subject/add-subject')}
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm"
                >
                  <FaPlus />
                  Add New Subject
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
              <button
                onClick={() => setSelectedSubjects([])}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                <FaTimes />
                Clear Selection
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base w-full sm:w-auto justify-center ${
                  success
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
                } disabled:opacity-70`}
              >
                {success ? (
                  <>
                    <FaCheck />
                    Saved Successfully!
                  </>
                ) : isSubmitting ? (
                  'Saving...'
                ) : (
                  <>
                    <FaCheck />
                    Save Assignments
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AssignSubjectForm
