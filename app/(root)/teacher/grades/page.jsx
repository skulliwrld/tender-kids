'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
//import TeacherSidebar from '@/components/TeacherSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, Users, BookOpen, TrendingUp } from 'lucide-react'
import { calculateFinalGrade, getStudentFinalGrades, getClassFinalGrades } from '@/app/actions/gradeActions'

const GradesPage = () => {
  const { data: session, status } = useSession()
  const [classesList, setClassesList] = useState([])
  const [studentsList, setStudentsList] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('Term 1')
  const [selectedSession, setSelectedSession] = useState('2025-2026')
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(false)
  const [subjects, setSubjects] = useState([])

  const terms = ['Term 1', 'Term 2', 'Term 3', 'Mid Term', 'Final']
  const sessions = ['2024-2025', '2025-2026', '2026-2027']

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
        }
      } catch (err) {
        console.error('Failed to load classes', err)
      }
    }
    if (session) fetchClasses()
  }, [session])

  useEffect(() => {
    const fetchSubjects = async () => {
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
      } catch (err) {
        console.error('Failed to load subjects', err)
      }
    }
    fetchSubjects()
  }, [selectedClass])

  useEffect(() => {
    if (!selectedClass) return
    const fetchStudents = async () => {
      try {
        const res = await fetch(`/api/teacher/classes/${selectedClass}/students`)
        if (res.ok) {
          const data = await res.json()
          setStudentsList(data)
        }
      } catch (err) {
        console.error('Failed to load students', err)
      }
    }
    fetchStudents()
  }, [selectedClass])

  const handleCalculateGrade = async () => {
    if (!selectedStudent || !selectedSubject) return

    setLoading(true)
    try {
      const result = await calculateFinalGrade(selectedStudent, selectedSubject, selectedTerm, selectedSession)
      setGrades([result])
    } catch (error) {
      console.error('Error calculating grade:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCalculateClassGrades = async () => {
    if (!selectedClass || !selectedSubject) return

    setLoading(true)
    try {
      const results = await getClassFinalGrades(selectedClass, selectedSubject, selectedTerm, selectedSession)
      setGrades(results)
    } catch (error) {
      console.error('Error calculating class grades:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'bg-green-100 text-green-800'
    if (grade >= 80) return 'bg-blue-100 text-blue-800'
    if (grade >= 70) return 'bg-yellow-100 text-yellow-800'
    if (grade >= 60) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Grade Calculator</h1>
        <p className="text-sm sm:text-base">Calculate final grades for students and classes</p>
      </div>

      <Card className="mb-4 sm:mb-6 shadow-xl border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
            <Calculator className="w-5 h-5" />
            Grade Calculation Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 mb-4">
            <div>
              <Label htmlFor="class" className="text-purple-700 font-semibold text-sm">Class</Label>
              <select
                id="class"
                value={selectedClass}
                    onChange={(e) => { setSelectedClass(e.target.value); setSelectedSubject(''); setGrades([]); }}
                    className="w-full mt-1 px-2 sm:px-3 py-2 sm:py-2.5 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                  >
                    <option value="">Select class</option>
                    {classesList.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name || cls.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-purple-700 font-semibold text-sm">Subject</Label>
                  <select
                    id="subject"
                    value={selectedSubject}
                    onChange={(e) => { setSelectedSubject(e.target.value); setGrades([]); }}
                    className="w-full mt-1 px-2 sm:px-3 py-2 sm:py-2.5 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
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
                  <Label htmlFor="term" className="text-purple-700 font-semibold text-sm">Term</Label>
                  <select
                    id="term"
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="w-full mt-1 px-2 sm:px-3 py-2 sm:py-2.5 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                  >
                    {terms.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="session" className="text-purple-700 font-semibold text-sm">Session</Label>
                  <select
                    id="session"
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                    className="w-full mt-1 px-2 sm:px-3 py-2 sm:py-2.5 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                  >
                    {sessions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="student" className="text-purple-700 font-semibold text-sm">Student (Optional)</Label>
                  <select
                    id="student"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full mt-1 px-2 sm:px-3 py-2 sm:py-2.5 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                  >
                    <option value="">Select student</option>
                    {studentsList.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.Name || student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                  <Button
                    onClick={handleCalculateGrade}
                    disabled={!selectedStudent || !selectedSubject || loading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-sm sm:text-base py-2 sm:py-2.5"
                  >
                    Calculate Student
                  </Button>
                  <Button
                    onClick={handleCalculateClassGrades}
                    disabled={!selectedClass || !selectedSubject || loading}
                    variant="outline"
                    className="flex-1 border-purple-500 text-purple-600 hover:bg-purple-50 text-sm sm:text-base py-2 sm:py-2.5"
                  >
                    Class Grades
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
              <p className="text-purple-600 mt-2">Calculating grades...</p>
            </div>
          )}

          {grades.length > 0 && !loading && (
            <Card className="shadow-xl border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600">
                <CardTitle className="text-white">Grade Results - {selectedTerm} {selectedSession}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-purple-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-purple-900 font-bold border-b-2 border-purple-200">Student</th>
                        <th className="px-4 py-3 text-left text-purple-900 font-bold border-b-2 border-purple-200">Subject</th>
                        <th className="px-4 py-3 text-center text-purple-900 font-bold border-b-2 border-purple-200">Final Grade</th>
                        <th className="px-4 py-3 text-center text-purple-900 font-bold border-b-2 border-purple-200">Letter</th>
                        <th className="px-4 py-3 text-center text-purple-900 font-bold border-b-2 border-purple-200">Exam Avg</th>
                        <th className="px-4 py-3 text-center text-purple-900 font-bold border-b-2 border-purple-200">Quiz Avg</th>
                        <th className="px-4 py-3 text-center text-purple-900 font-bold border-b-2 border-purple-200">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade, index) => (
                        <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-purple-50'} hover:bg-purple-100`}>
                          <td className="px-4 py-3 border-b border-purple-200 font-medium">{grade.studentName || 'N/A'}</td>
                          <td className="px-4 py-3 border-b border-purple-200">{grade.subjectName || 'N/A'}</td>
                          <td className="px-4 py-3 text-center border-b border-purple-200">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(grade.numericGrade)}`}>
                              {grade.numericGrade}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center border-b border-purple-200">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-purple-600 text-white">
                              {grade.letterGrade || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center border-b border-purple-200">{grade.examAverage || 0}%</td>
                          <td className="px-4 py-3 text-center border-b border-purple-200">{grade.quizAverage || 0}%</td>
                          <td className="px-4 py-3 text-center border-b border-purple-200">{grade.totalAssessments || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {grades.length === 0 && !loading && (
            <Card className="shadow-xl border-purple-200">
              <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                <Calculator className="w-12 h-12 sm:w-16 sm:h-16 text-purple-300 mb-4" />
                <h3 className="text-lg sm:text-xl font-bold mb-2">No Grades Calculated</h3>
                <p className="text-center max-w-md text-sm sm:text-base">
                  Select a class, subject, term and session, then click "Calculate Class Grades" or select a student and click "Calculate Student"
                </p>
              </CardContent>
            </Card>
          )}
    </div>
  )
}

export default GradesPage