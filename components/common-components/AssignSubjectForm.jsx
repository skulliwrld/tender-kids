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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.push('/subject')}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-4 transition-colors"
          >
            <FaArrowLeft />
            Back to Subjects
          </button>
          
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <FaLayerGroup className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Assign Subjects to Class</h1>
                <p className="text-purple-200">Select a class and choose subjects from the list</p>
              </div>
            </div>
          </div>
        </div>

        {/* Class Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaLayerGroup className="text-purple-600" />
            Select Class
          </h2>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaBookOpen className="text-purple-600" />
                Select Subjects
                <span className="text-sm font-normal text-gray-500">
                  ({selectedSubjects.length} selected)
                </span>
              </h2>
            </div>

            {subjects && subjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {subjects.map((subject, index) => {
                  const isSelected = selectedSubjects.includes(subject._id)
                  const color = colors[index % colors.length]
                  
                  return (
                    <div
                      key={subject._id}
                      onClick={() => toggleSubject(subject._id)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-50 shadow-md' 
                          : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                      }`}
                    >
                      {/* Checkmark indicator */}
                      <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {isSelected && <FaCheck className="text-xs" />}
                      </div>

                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                        <FaBookOpen className="text-white" />
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-1">{subject.Name}</h3>
                      
                      {subject.assignedTeacher && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <FaChalkboardTeacher className="text-xs" />
                          {subject.assignedTeacher.name}
                        </p>
                      )}
                      
                      {subject.description && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">{subject.description}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaBookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Subjects Available</h3>
                <p className="text-gray-500 mb-4">Create subjects first in the subject list.</p>
                <button
                  onClick={() => router.push('/subject/add-subject')}
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                >
                  <FaPlus />
                  Add New Subject
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <button
                onClick={() => setSelectedSubjects([])}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <FaTimes />
                Clear Selection
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
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
