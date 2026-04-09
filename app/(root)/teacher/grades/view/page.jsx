'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FaBook, FaSearch } from 'react-icons/fa'

export default function TeacherGradesViewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('Term 1')
  const [selectedSession, setSelectedSession] = useState('2025-2026')
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const terms = ['Term 1', 'Term 2', 'Term 3', 'Mid Term', 'Final']

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchClasses() {
      if (!session?.user?.email) return
      
      try {
        const res = await fetch(`/api/teacher/classes?email=${session?.user?.email}`)
        const data = await res.json()
        setClasses(data.classes || [])
      } catch (error) {
        console.error('Error fetching classes:', error)
      }
    }
    fetchClasses()
  }, [session])

  useEffect(() => {
    async function fetchSubjects() {
      if (!selectedClass) {
        setSubjects([])
        return
      }
      
      try {
        const res = await fetch(`/api/teacher/classes/${selectedClass}/subjects`)
        if (res.ok) {
          const data = await res.json()
          setSubjects(data)
        }
      } catch (error) {
        console.error('Error fetching subjects:', error)
      }
    }
    fetchSubjects()
  }, [selectedClass])

  useEffect(() => {
    async function fetchGrades() {
      if (!selectedClass || !selectedSubject) {
        setGrades([])
        return
      }
      
      setLoading(true)
      try {
        const params = new URLSearchParams({
          classId: selectedClass,
          subjectId: selectedSubject,
          term: selectedTerm,
          academicSession: selectedSession
        })
        const res = await fetch(`/api/teacher/grades?${params}`)
        const data = await res.json()
        setGrades(data.grades || [])
      } catch (error) {
        console.error('Error fetching grades:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchGrades()
  }, [selectedClass, selectedSubject, selectedTerm, selectedSession])

  const filteredGrades = grades.filter(g => 
    g.student?.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.student?.Email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getGradeColor = (marks) => {
    if (marks >= 90) return 'bg-green-100 text-green-700'
    if (marks >= 80) return 'bg-blue-100 text-blue-700'
    if (marks >= 70) return 'bg-yellow-100 text-yellow-700'
    if (marks >= 60) return 'bg-orange-100 text-orange-700'
    return 'bg-red-100 text-red-700'
  }

  const getGradeLetter = (marks) => {
    if (marks >= 90) return 'A+'
    if (marks >= 80) return 'A'
    if (marks >= 70) return 'B'
    if (marks >= 60) return 'C'
    return 'F'
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaBook className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">View Student Grades</h1>
              <p className="text-xs sm:text-sm text-black">View grades for your students</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 sm:mb-2 text-black">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value)
                  setSelectedSubject('')
                }}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
              >
                <option value="">Select Class...</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 sm:mb-2 text-black">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedClass}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 text-black"
              >
                <option value="">Select Subject...</option>
                {subjects.map((subj) => (
                  <option key={subj._id} value={subj._id}>{subj.Name || subj.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 sm:mb-2 text-black">Term</label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
              >
                {terms.map((term) => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 sm:mb-2 text-black">Academic Session</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
              >
                <option value="2025-2026">2025-2026</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {selectedClass && selectedSubject && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-3 sm:p-4 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-black">
                    {subjects.find(s => s._id === selectedSubject)?.Name || subjects.find(s => s._id === selectedSubject)?.name || ''} - {selectedTerm}
                  </h2>
                  <p className="text-sm text-black">{grades.length} student records</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 sm:pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="animate-spin w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-sm sm:text-base text-black">Loading grades...</p>
              </div>
            ) : filteredGrades.length > 0 ? (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden">
                  {filteredGrades.map((grade, index) => (
                    <div key={grade._id || index} className="p-3 sm:p-4 border-b">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-black truncate">{grade.student?.Name || 'N/A'}</p>
                          <p className="text-xs sm:text-sm text-black truncate">{grade.student?.Email || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getGradeColor(grade.marks)}`}>
                            {grade.marks}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-black">{grade.exam}</span>
                        <span className="font-medium text-black">Grade: {getGradeLetter(grade.marks)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-black">#</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-black">Student Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-black">Email</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-black">Exam Type</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-black">Marks</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-black">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrades.map((grade, index) => (
                      <tr key={grade._id || index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-black">{index + 1}</td>
                        <td className="py-3 px-4 text-sm font-medium text-black">{grade.student?.Name || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-black">{grade.student?.Email || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-center text-black">{grade.exam}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(grade.marks)}`}>
                            {grade.marks}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm font-medium text-black">
                          {getGradeLetter(grade.marks)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                </>
              ) : (
              <div className="p-8 sm:p-12 text-center">
                <FaBook className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-black mb-2">No Grades Found</h3>
                <p className="text-sm sm:text-base text-black">No grades have been entered for this selection yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
