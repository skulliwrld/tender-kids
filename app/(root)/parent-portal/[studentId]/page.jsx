'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FaArrowLeft, FaGraduationCap, FaCheckCircle, FaTimesCircle, FaBook, FaStar, FaCalendar, FaTrophy, FaMedal, FaChartLine, FaClock, FaClipboardList } from 'react-icons/fa'

export default function ParentChildDetailPage() {
  const params = useParams()
  const studentId = params.studentId
  const [student, setStudent] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [grades, setGrades] = useState([])
  const [subjects, setSubjects] = useState([])
  const [terms, setTerms] = useState([])
  const [sessions, setSessions] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentTerm, setCurrentTerm] = useState('')
  const [currentSession, setCurrentSession] = useState('')
  const [selectedAssignment, setSelectedAssignment] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentResponse, assignmentsResponse] = await Promise.all([
          fetch(`/api/parent-portal/student/${studentId}`),
          fetch(`/api/assignment?student=${studentId}`)
        ])
        
        const data = await studentResponse.json()
        const assignmentsData = await assignmentsResponse.json()
        
        if (data.success) {
          setStudent(data.student)
          setAttendance(data.attendance || [])
          setGrades(data.results || [])
          
          const uniqueTerms = [...new Set(data.results.map(g => g.term))]
          const uniqueSessions = [...new Set(data.results.map(g => g.academicSession))]
          setTerms(uniqueTerms)
          setSessions(uniqueSessions)
          setCurrentTerm(uniqueTerms[0] || 'Term 1')
          setCurrentSession(uniqueSessions[0] || '2025-2026')
        } else {
          setError(data.message || 'Failed to load student data')
        }

        if (assignmentsData.success) {
          setAssignments(assignmentsData.assignments || [])
        }
      } catch (err) {
        setError(err.message || 'An error occurred while loading data')
      } finally {
        setLoading(false)
      }
    }

    if (studentId) {
      fetchData()
    }
  }, [studentId])

  const getSubjectScore = (subjectId, examType) => {
    const subjectIdStr = subjectId?.toString()
    const grade = currentGrades.find(g => 
      (g.subject?._id?.toString() === subjectIdStr || g.subject?._id === subjectId) && g.exam === examType
    )
    return grade?.marks ?? '-'
  }

  const getAverageForSubject = (subjectId) => {
    const subjectIdStr = subjectId?.toString()
    const subjectGrades = currentGrades.filter(g => 
      g.subject?._id?.toString() === subjectIdStr || g.subject?._id === subjectId
    )
    if (subjectGrades.length === 0) return '-'
    const sum = subjectGrades.reduce((acc, g) => acc + g.marks, 0)
    return Math.round(sum / subjectGrades.length)
  }

  const getGradeLetter = (score) => {
    if (score === '-') return '-'
    if (score >= 90) return 'A+'
    if (score >= 80) return 'A'
    if (score >= 70) return 'B'
    if (score >= 60) return 'C'
    if (score >= 50) return 'D'
    return 'F'
  }

  const currentGrades = grades.filter(g => g.term === currentTerm && g.academicSession === currentSession)
  const subjectsList = subjects.length > 0 ? subjects : (() => {
    const uniqueSubjects = []
    const seen = new Set()
    grades.forEach(g => {
      if (g.subject && !seen.has(g.subject._id?.toString())) {
        seen.add(g.subject._id?.toString())
        uniqueSubjects.push(g.subject)
      }
    })
    return uniqueSubjects
  })()

  const overallAverage = currentGrades.length > 0 
    ? Math.round(currentGrades.reduce((acc, g) => acc + g.marks, 0) / currentGrades.length)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 sm:border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">{error || 'Student not found'}</h1>
          <Link href="/parent-portal" className="text-purple-600 hover:underline mt-2 sm:mt-4 inline-block text-sm sm:text-base">
            Back to My Children
          </Link>
        </div>
      </div>
    )
  }

  const totalDays = attendance.length
  const presentDays = attendance.filter(a => a.status === 'Present').length
  const absentDays = attendance.filter(a => a.status === 'Absent').length
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-indigo-100 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Link 
          href="/parent-portal" 
          className="inline-flex items-center gap-1 sm:gap-2 text-purple-700 hover:text-purple-900 mb-3 sm:mb-4 font-semibold transition-colors text-sm sm:text-base"
        >
          <FaArrowLeft className="text-xs sm:text-sm" /> Back to My Children
        </Link>

        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 text-white shadow-xl lg:shadow-2xl">
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden border-2 sm:border-4 border-white/30 shadow-xl flex-shrink-0">
                  {student.photo ? (
                    <img src={student.photo} alt={student.Name} className="w-full h-full object-cover" />
                  ) : (
                    <FaGraduationCap className="text-2xl sm:text-3xl lg:text-5xl text-white/80" />
                  )}
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold">{student.Name}</h1>
                  <p className="text-purple-200 text-sm sm:text-base lg:text-xl mt-1">{student.Class?.name || 'No Class'}</p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-4 mt-2 sm:mt-3 text-purple-200">
                    <span className="flex items-center gap-1 sm:gap-2 bg-white/10 px-2 sm:px-3 lg:px-4 py-1 rounded-full text-xs sm:text-sm"><FaCalendar className="text-xs" /> {currentTerm} - {currentSession}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-white/20 w-full md:w-auto">
                <p className="text-purple-200 mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">Overall Average</p>
                <p className="text-3xl sm:text-4xl lg:text-6xl font-bold">{overallAverage}%</p>
                <p className="text-purple-200 mt-1 sm:mt-2 font-bold text-lg sm:text-xl lg:text-xl">{getGradeLetter(overallAverage)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
              <FaCheckCircle className="text-sm sm:text-lg" /> Attendance Record
            </h2>
          </div>
          
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-green-50 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center">
                <p className="text-lg sm:text-2xl font-bold text-green-600">{presentDays}</p>
                <p className="text-xs sm:text-sm text-gray-600">Present</p>
              </div>
              <div className="bg-red-50 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center">
                <p className="text-lg sm:text-2xl font-bold text-red-600">{absentDays}</p>
                <p className="text-xs sm:text-sm text-gray-600">Absent</p>
              </div>
              <div className={`rounded-lg sm:rounded-xl p-2 sm:p-4 text-center ${
                attendancePercentage >= 75 ? 'bg-green-50' : 'bg-yellow-50'
              }`}>
                <p className={`text-lg sm:text-2xl font-bold ${attendancePercentage >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {attendancePercentage}%
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Attendance</p>
              </div>
            </div>

            {attendance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-600">Date</th>
                      <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-600">Status</th>
                      <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-600 hidden sm:table-cell">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attendance.slice(0, 10).map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                            record.status === 'Present' || record.status === 'present'
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">{record.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-3 sm:py-4 text-sm">No attendance records found</p>
            )}
          </div>
        </div>

        {/* Results Section - Only show if fee is paid */}
        {student.hasPaid ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-xs sm:text-sm">Total Subjects</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2">{subjectsList.length}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <FaBook className="text-sm sm:text-xl lg:text-3xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-700 to-indigo-700 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-xs sm:text-sm">Grades Entered</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2">{currentGrades.length}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <FaChartLine className="text-sm sm:text-xl lg:text-3xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-200 text-xs sm:text-sm">Highest Score</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2">
                      {currentGrades.length > 0 ? Math.max(...currentGrades.map(g => g.marks)) : 0}%
                    </p>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <FaTrophy className="text-sm sm:text-xl lg:text-3xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-200 text-xs sm:text-sm">Lowest Score</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2">
                      {currentGrades.length > 0 ? Math.min(...currentGrades.map(g => g.marks)) : 0}%
                    </p>
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <FaMedal className="text-sm sm:text-xl lg:text-3xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Result Sheet */}
            <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl overflow-hidden border-2 border-purple-600">
              <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
                  <FaStar className="text-yellow-300 text-sm sm:text-lg lg:text-xl" />
                  Result Sheet
                </h2>
                <p className="text-purple-200 mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg">{currentTerm} - {currentSession} Academic Session</p>
              </div>

              {currentGrades.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-purple-50">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 lg:py-5 text-left text-xs sm:text-sm lg:text-base font-bold text-purple-900 border-b-2 border-r border-purple-300">Subject</th>
                        <th className="px-1 sm:px-2 py-2 sm:py-3 lg:py-5 text-center text-xs sm:text-sm lg:text-base font-bold text-purple-900 border-b-2 border-r border-purple-300">Test</th>
                        <th className="px-1 sm:px-2 py-2 sm:py-3 lg:py-5 text-center text-xs sm:text-sm lg:text-base font-bold text-purple-900 border-b-2 border-r border-purple-300">Assign</th>
                        <th className="px-1 sm:px-2 py-2 sm:py-3 lg:py-5 text-center text-xs sm:text-sm lg:text-base font-bold text-purple-900 border-b-2 border-r border-purple-300">Exam</th>
                        <th className="px-1 sm:px-2 py-2 sm:py-3 lg:py-5 text-center text-xs sm:text-sm lg:text-base font-bold text-purple-900 border-b-2 border-r border-purple-300">Avg</th>
                        <th className="px-1 sm:px-2 py-2 sm:py-3 lg:py-5 text-center text-xs sm:text-sm lg:text-base font-bold text-purple-900 border-b-2 border-purple-300">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-100">
                      {subjectsList.map((subject, index) => {
                        const avg = getAverageForSubject(subject._id)
                        const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-purple-50/50'
                        return (
                          <tr key={subject._id} className={`${rowBg} hover:bg-purple-100 transition-colors`}>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 lg:py-4 border-r border-purple-200">
                              <p className="font-bold text-purple-900 text-xs sm:text-base lg:text-lg">{subject.Name || 'Unknown'}</p>
                            </td>
                            <td className="px-1 sm:px-2 py-2 sm:py-3 lg:py-4 text-center border-r border-purple-200">
                              <span className="inline-block px-1 sm:px-2 py-1 rounded-lg font-bold bg-purple-100 text-purple-800 border border-purple-300 text-xs sm:text-sm">
                                {getSubjectScore(subject._id, 'Test')}
                              </span>
                            </td>
                            <td className="px-1 sm:px-2 py-2 sm:py-3 lg:py-4 text-center border-r border-purple-200">
                              <span className="inline-block px-1 sm:px-2 py-1 rounded-lg font-bold bg-purple-100 text-purple-800 border border-purple-300 text-xs sm:text-sm">
                                {getSubjectScore(subject._id, 'Assignment')}
                              </span>
                            </td>
                            <td className="px-1 sm:px-2 py-2 sm:py-3 lg:py-4 text-center border-r border-purple-200">
                              <span className="inline-block px-1 sm:px-2 py-1 rounded-lg font-bold bg-purple-100 text-purple-800 border border-purple-300 text-xs sm:text-sm">
                                {getSubjectScore(subject._id, 'Final Exam')}
                              </span>
                            </td>
                            <td className="px-1 sm:px-2 py-2 sm:py-3 lg:py-4 text-center border-r border-purple-200">
                              <span className="inline-block px-1 sm:px-2 lg:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm lg:text-lg bg-purple-600 text-white border border-purple-800">
                                {avg}
                              </span>
                            </td>
                            <td className="px-1 sm:px-2 py-2 sm:py-3 lg:py-4 text-center">
                              <span className={`inline-block px-1 sm:px-2 lg:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm lg:text-lg border-2 ${
                                avg === '-' ? 'bg-gray-100 text-gray-500 border-gray-300' :
                                avg >= 90 ? 'bg-yellow-400 text-yellow-900 border-yellow-600' :
                                avg >= 80 ? 'bg-green-500 text-white border-green-700' :
                                avg >= 70 ? 'bg-blue-500 text-white border-blue-700' :
                                avg >= 60 ? 'bg-orange-400 text-white border-orange-600' :
                                'bg-red-500 text-white border-red-700'
                              }`}>
                                {getGradeLetter(avg)}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 lg:py-20">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <FaBook className="text-2xl sm:text-3xl lg:text-5xl text-purple-400" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-purple-900 mb-2 sm:mb-3">No Results Yet</h3>
                  <p className="text-purple-600 text-sm sm:text-lg">Grades have not been entered yet.</p>
                </div>
              )}
            </div>

            {/* Term Selector */}
            {terms.length > 1 && (
              <div className="mt-4 sm:mt-6 lg:mt-8 flex justify-center">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-800 rounded-xl sm:rounded-2xl p-1 sm:p-2 flex gap-1 sm:gap-2 shadow-xl">
                  {terms.map(term => (
                    <button
                      key={term}
                      onClick={() => setCurrentTerm(term)}
                      className={`px-3 sm:px-5 lg:px-8 py-2 sm:py-2 lg:py-3 rounded-lg sm:rounded-xl font-bold transition-all text-xs sm:text-sm lg:text-base ${
                        term === currentTerm 
                          ? 'bg-white text-purple-800 shadow-lg' 
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-center">
              <FaTimesCircle className="w-8 sm:w-10 lg:w-12 text-white mx-auto mb-2" />
              <h2 className="text-base sm:text-xl font-bold text-white">Results Not Available</h2>
              <p className="text-red-100 mt-1 text-sm sm:text-base">Please pay school fees to view academic results</p>
            </div>
          </div>
        )}

        {/* Assignments Section */}
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaClipboardList className="text-purple-600" />
            Assignments
          </h2>
          
          {assignments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
              <FaClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No assignments available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {assignments.map(assignment => {
                const submission = assignment.submissions?.find(
                  s => s.student?._id?.toString() === studentId || s.student?.toString() === studentId || s.student === studentId
                )
                const deadlineDate = new Date(assignment.deadline)
                const now = new Date()
                const isPast = now > deadlineDate
                
                return (
                  <div 
                    key={assignment._id} 
                    className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${
                      selectedAssignment?._id === assignment._id ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => setSelectedAssignment(
                      selectedAssignment?._id === assignment._id ? null : assignment
                    )}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                          <p className="text-sm text-gray-600">{assignment.topic}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FaBook /> {assignment.subject?.Name}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaClock className={isPast ? 'text-red-500' : ''} /> 
                              {isPast ? 'Expired' : deadlineDate.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          {submission?.score !== null && submission?.score !== undefined ? (
                            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg">
                              <span className="font-bold">{submission.score}</span>
                              <span className="text-xs">/{submission.totalPoints}</span>
                            </div>
                          ) : isPast ? (
                            <span className="text-red-500 text-sm">Not Submitted</span>
                          ) : (
                            <span className="text-blue-600 text-sm">Pending</span>
                          )}
                        </div>
                      </div>
                      
                      {selectedAssignment?._id === assignment._id && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium text-gray-900 mb-2">Questions & Answers:</h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {assignment.questions?.map((q, qIndex) => {
                              const studentAnswer = submission?.answers?.find(
                                a => a.questionIndex === qIndex
                              )
                              
                              return (
                              <div key={qIndex} className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm font-medium text-gray-900">
                                  {qIndex + 1}. {q.question}
                                  <span className="text-xs text-gray-500 ml-2">({q.points} pts)</span>
                                </p>
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500">Student's Answer:</p>
                                  <p className="text-sm text-gray-700 bg-white p-2 rounded border mt-1">
                                    {studentAnswer?.answer || 'No answer provided'}
                                  </p>
                                </div>
                              </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
