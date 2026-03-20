'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaCalendar, FaVenusMars, FaMapMarkerAlt, FaGraduationCap, FaCheckCircle, FaTimesCircle, FaBook, FaClipboardList, FaStar, FaChevronDown, FaChevronUp, FaExternalLinkAlt } from 'react-icons/fa'

function ResultsSection({ grades }) {
  const averageGrade = grades.length > 0 
    ? Math.round(grades.reduce((acc, g) => acc + g.marks, 0) / grades.length)
    : null

  if (grades.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No results recorded yet</p>
      </div>
    )
  }

  const gradesByTerm = grades.reduce((acc, grade) => {
    const term = grade.term || 'Unknown Term'
    if (!acc[term]) acc[term] = []
    acc[term].push(grade)
    return acc
  }, {})

  return (
    <div className="p-6 space-y-6">
      {averageGrade && (
        <div className="mb-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall Average</p>
              <p className="text-3xl font-bold text-indigo-600">{averageGrade}%</p>
            </div>
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <FaStar className="text-2xl text-indigo-600" />
            </div>
          </div>
        </div>
      )}

      {Object.entries(gradesByTerm).map(([term, termGrades]) => {
        const termAvg = termGrades.length > 0 
          ? Math.round(termGrades.reduce((sum, g) => sum + g.marks, 0) / termGrades.length)
          : 0
        
        return (
          <div key={term} className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{term}</h3>
                <p className="text-xs text-gray-500">{termGrades.length} subject{termGrades.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Term Average</p>
                <p className="text-lg font-bold text-indigo-600">{termAvg}%</p>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {termGrades.map((grade) => (
                  <div key={grade._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                        grade.marks >= 75 ? 'bg-green-500' :
                        grade.marks >= 60 ? 'bg-blue-500' :
                        grade.marks >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}>
                        {grade.marks}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{grade.subject?.Name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{grade.exam || 'Exam'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        grade.marks >= 75 ? 'text-green-600' :
                        grade.marks >= 60 ? 'text-blue-600' :
                        grade.marks >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {grade.marks >= 75 ? 'Excellent' :
                         grade.marks >= 60 ? 'Good' :
                         grade.marks >= 50 ? 'Pass' : 'Needs Improvement'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ParentChildDetailPage() {
  const params = useParams()
  const studentId = params.studentId
  const [student, setStudent] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [showResults, setShowResults] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/parent-portal/student/${studentId}`)
        const data = await response.json()
        
        if (data.success) {
          setStudent(data.student)
          setAttendance(data.attendance || [])
          setGrades(data.grades || [])
        } else {
          setError(data.message || 'Failed to load student data')
        }
      } catch (err) {
        setError('An error occurred while loading data')
      } finally {
        setLoading(false)
      }
    }

    if (studentId) {
      fetchData()
    }
  }, [studentId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">{error || 'Student not found'}</h1>
          <Link href="/parent-portal" className="text-indigo-600 hover:underline mt-2 inline-block">
            Back to Search
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Link 
          href="/parent-portal" 
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium"
        >
          <FaArrowLeft /> Back to Search
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 h-32"></div>
          
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6 flex flex-col md:flex-row items-center md:items-end gap-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                {student.photo ? (
                  <Image 
                    src={student.photo} 
                    alt={student.Name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-4xl font-bold">
                    {student.Name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{student.Name}</h1>
                <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 mt-1">
                  <FaGraduationCap className="text-indigo-600" />
                  {student.Class?.name || 'No Class Assigned'}
                </p>
              </div>

              <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                student.hasPaid 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {student.hasPaid ? <FaCheckCircle /> : <FaTimesCircle />}
                <span className="font-medium">{student.hasPaid ? 'Fee Paid' : 'Fee Not Paid'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase">Gender</p>
                <p className="font-semibold text-gray-900">{student.Gender || 'Not Specified'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase">Date of Birth</p>
                <p className="font-semibold text-gray-900">{student.DOB || 'Not Specified'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase">Email</p>
                <p className="font-semibold text-gray-900">{student.Email || 'Not Specified'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase">Phone</p>
                <p className="font-semibold text-gray-900">{student.Phone || 'Not Specified'}</p>
              </div>
            </div>

            {student.Address && (
              <div className="mt-4 bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase">Address</p>
                <p className="font-semibold text-gray-900">{student.Address}</p>
              </div>
            )}

            {student.Bio && (
              <div className="mt-4 bg-teal-50 rounded-xl p-4 border border-teal-200">
                <p className="text-xs text-teal-600 uppercase">Bio</p>
                <p className="font-semibold text-gray-900">{student.Bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 px-8 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaClipboardList /> Attendance Record
            </h2>
            <p className="text-green-100 text-sm">Recent attendance history</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{presentDays}</p>
                <p className="text-sm text-gray-600">Present</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{absentDays}</p>
                <p className="text-sm text-gray-600">Absent</p>
              </div>
              <div className={`rounded-xl p-4 text-center ${
                attendancePercentage >= 75 ? 'bg-green-50' : 'bg-yellow-50'
              }`}>
                <p className={`text-2xl font-bold ${attendancePercentage >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {attendancePercentage}%
                </p>
                <p className="text-sm text-gray-600">Attendance</p>
              </div>
            </div>

            {attendance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attendance.slice(0, 10).map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'Present' || record.status === 'present'
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{record.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No attendance records found</p>
            )}
          </div>
        </div>

        {/* Results Card - Only show if fee is paid */}
        {student.hasPaid ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <button 
              onClick={() => setShowResults(!showResults)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 flex items-center justify-between hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaStar /> Academic Results
                </h2>
                <p className="text-purple-100 text-sm">Click to {showResults ? 'hide' : 'view'} results for {student.Name}</p>
              </div>
              {showResults ? (
                <FaChevronUp className="text-white text-xl" />
              ) : (
                <FaChevronDown className="text-white text-xl" />
              )}
            </button>
            
            {showResults && <ResultsSection grades={grades} />}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-8 py-6 text-center">
              <FaTimesCircle className="w-12 h-12 text-white mx-auto mb-2" />
              <h2 className="text-xl font-bold text-white">Results Not Available</h2>
              <p className="text-red-100 mt-1">Please pay school fees to view academic results</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
