'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'
//import TeacherSidebar from '@/components/TeacherSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Users, BookOpen, Calculator, CheckCircle, AlertCircle } from 'lucide-react'
import { createGrade } from '@/lib/actions/gradeResult.action'

function InputGradesContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [classesList, setClassesList] = useState([])
  const [studentsList, setStudentsList] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [term, setTerm] = useState('Term 1')
  const [academicSession, setAcademicSession] = useState('2025-2026')
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [studentScores, setStudentScores] = useState({})

  const terms = ['Term 1', 'Term 2', 'Term 3', 'Mid Term', 'Final']
  const examTypes = ['Test', 'Assignment', 'Exam']
  const scoreLimits = {
    Test: 20,
    Assignment: 10,
    Exam: 70
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/signin')
    }
  }, [status])

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch(`/api/teacher/classes?email=${session?.user?.email}`)
        if (res.ok) {
          const data = await res.json()
          setClassesList(data.classes || [])
          
          const classParam = searchParams.get('class')
          if (classParam && data.classes?.some(c => c._id === classParam)) {
            setSelectedClass(classParam)
          }
        }
      } catch (err) {
        console.error('Failed to load classes', err)
      }
    }
    if (session) fetchClasses()
  }, [session, searchParams])

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedClass) return
      setLoading(true)
      try {
        const res = await fetch(`/api/teacher/classes/${selectedClass}/subjects`)
        if (res.ok) {
          const data = await res.json()
          setSubjects(data)
        }
      } catch (err) {
        console.error('Failed to load subjects', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSubjects()
  }, [selectedClass])

  useEffect(() => {
    if (!selectedClass) return
    const fetchStudents = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/teacher/classes/${selectedClass}/students`)
        if (res.ok) {
          const data = await res.json()
          setStudentsList(data)
          const initialScores = {}
          data.forEach(student => {
            initialScores[student._id] = {
              Test: '',
              Assignment: '',
              Exam: ''
            }
          })
          setStudentScores(initialScores)
        }
      } catch (err) {
        console.error('Failed to load students', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [selectedClass])

  const handleScoreChange = (studentId, examType, value) => {
    const numValue = value === '' ? '' : Math.min(parseFloat(value) || 0, scoreLimits[examType])
    setStudentScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [examType]: numValue === '' ? '' : numValue.toString()
      }
    }))
  }

  const calculateTotal = (studentId) => {
    const scores = studentScores[studentId]
    if (!scores) return 0
    const test = parseFloat(scores.Test) || 0
    const assignment = parseFloat(scores.Assignment) || 0
    const exam = parseFloat(scores.Exam) || 0
    return test + assignment + exam
  }

  const handleSaveGrades = async () => {
    if (!selectedClass || !selectedSubject || !term || !academicSession) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      for (const student of studentsList) {
        const scores = studentScores[student._id]
        
        for (const examType of examTypes) {
          if (scores[examType] !== '' && scores[examType] !== null) {
            const marks = parseFloat(scores[examType])
            if (!isNaN(marks) && marks >= 0 && marks <= scoreLimits[examType]) {
              await createGrade({
                student: student._id,
                subject: selectedSubject,
                class: selectedClass,
                term,
                exam: examType,
                marks,
                academicSession,
                teacher: session?.user?.id
              })
            }
          }
        }
      }

      setMessage({ type: 'success', text: 'Grades saved successfully! Select another subject to continue grading.' })
      
      // Reset only the subject and scores, keeping class selected
      setSelectedSubject('')
      setStudentScores(prev => {
        const reset = {}
        studentsList.forEach(student => {
          reset[student._id] = {
            Test: '',
            Assignment: '',
            Exam: ''
          }
        })
        return reset
      })
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)

    } catch (error) {
      console.error('Error saving grades:', error)
      setMessage({ type: 'error', text: 'Failed to save grades. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Input Student Scores</h1>
        <p className="text-sm sm:text-base">Enter test and exam scores for students in your class</p>
      </div>

      {loading && (
        <div className="mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg flex items-center gap-2 text-sm sm:text-base">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Loading data...
        </div>
      )}

      {message.text && (
        <div className={`mb-4 p-3 sm:p-4 rounded-lg flex items-center gap-2 text-sm sm:text-base ${
          message.type === 'success' 
            ? 'bg-green-100' 
            : 'bg-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

          <Card className="mb-4 sm:mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calculator className="w-5 h-5" />
                Select Class Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="class" className="text-sm font-semibold">Class *</Label>
                  <select
                    id="class"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full mt-1 px-3 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    <option value="">Select class</option>
                    {classesList.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-sm font-semibold">Subject *</Label>
                  <select
                    id="subject"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full mt-1 px-3 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.Name || subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="term" className="text-sm font-semibold">Term *</Label>
                  <select
                    id="term"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="w-full mt-1 px-3 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    {terms.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="session" className="text-sm font-semibold">Session *</Label>
                  <select
                    id="session"
                    value={academicSession}
                    onChange={(e) => setAcademicSession(e.target.value)}
                    className="w-full mt-1 px-3 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {studentsList.length > 0 && selectedClass && selectedSubject && (
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-base sm:text-lg">
                  <Users className="w-5 h-5" />
                  <span>Student Scores - {subjects.find(s => s._id === selectedSubject)?.Name || 'Subject'}</span>
                </CardTitle>
                <p className="text-xs sm:text-sm mt-1">
                  Enter scores: Test (0-20), Assignment (0-10), Exam (0-70). Total is calculated automatically and should equal 100.
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm min-w-[600px]">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-3 text-left font-semibold sticky left-0 bg-gray-50">Student Name</th>
                        <th className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-3 text-center font-semibold bg-blue-100">
                          <div>Test</div>
                          <div className="text-xs font-normal">(0-20)</div>
                        </th>
                        <th className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-3 text-center font-semibold bg-green-100">
                          <div>Assignment</div>
                          <div className="text-xs font-normal">(0-10)</div>
                        </th>
                        <th className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-3 text-center font-semibold bg-orange-100">
                          <div>Exam</div>
                          <div className="text-xs font-normal">(0-70)</div>
                        </th>
                        <th className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-3 text-center font-semibold bg-purple-100">
                          <div>Total</div>
                          <div className="text-xs font-normal">(Auto)</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsList.map((student) => (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-3 font-medium whitespace-nowrap">
                            {student.Name || student.name}
                          </td>
                          <td className="border border-gray-300 px-1 py-1">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={studentScores[student._id]?.Test || ''}
                              onChange={(e) => handleScoreChange(student._id, 'Test', e.target.value)}
                              placeholder="0"
                              className="w-full px-1 py-1 sm:px-2 sm:py-1.5 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 px-1 py-1">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={studentScores[student._id]?.Assignment || ''}
                              onChange={(e) => handleScoreChange(student._id, 'Assignment', e.target.value)}
                              placeholder="0"
                              className="w-full px-1 py-1 sm:px-2 sm:py-1.5 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </td>
                          <td className="border border-gray-300 px-1 py-1">
                            <input
                              type="number"
                              min="0"
                              max="70"
                              value={studentScores[student._id]?.Exam || ''}
                              onChange={(e) => handleScoreChange(student._id, 'Exam', e.target.value)}
                              placeholder="0"
                              className="w-full px-1 py-1 sm:px-2 sm:py-1.5 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </td>
                          <td className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-3 text-center font-semibold">
                            <span className={`px-2 py-1 rounded-md text-sm font-bold ${
                              calculateTotal(student._id) === 100 
                                ? 'bg-green-100 text-green-700' 
                                : calculateTotal(student._id) > 0
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {calculateTotal(student._id)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 sm:mt-6 flex justify-end">
                  <button
                    onClick={handleSaveGrades}
                    disabled={saving}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save All Grades'}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {studentsList.length === 0 && selectedClass && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                <p className="text-center text-sm sm:text-base">
                  No students are enrolled in this class yet.
                </p>
              </CardContent>
            </Card>
          )}
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export default function InputGradesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <InputGradesContent />
    </Suspense>
  )
}