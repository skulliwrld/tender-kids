import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation'
import { connectToDB } from '@/lib/Database/connectToDB'
import { Student } from '@/models/student.model'
import Grade from '@/models/grade.model'
import { Subject } from '@/models/subject.model'
import { Class } from '@/models/class.model'
import Link from 'next/link'
import { FaGraduationCap, FaBook, FaStar, FaCalendar, FaArrowLeft, FaTrophy, FaMedal, FaChartLine } from 'react-icons/fa'

async function getStudentResults(studentEmail) {
  try {
    await connectToDB()
    
    const student = await Student.findOne({ Email: studentEmail }).populate('Class')
    
    if (!student) {
      return { student: null, grades: [], subjects: [], terms: [], sessions: [] }
    }

    const grades = await Grade.find({ student: student._id })
      .populate('subject', 'Name')
      .sort({ term: -1, 'subject.Name': 1 })

    let subjects = []
    if (student.Class) {
      subjects = await Subject.find({ classes: student.Class._id }).populate('assignedTeacher', 'name')
    }

    const terms = [...new Set(grades.map(g => g.term))]
    const sessions = [...new Set(grades.map(g => g.academicSession))]

    return { 
      student, 
      grades: JSON.parse(JSON.stringify(grades)), 
      subjects: JSON.parse(JSON.stringify(subjects)),
      terms,
      sessions,
      className: student.Class?.name || 'N/A'
    }
  } catch (error) {
    console.error('Error fetching student results:', error)
    return { student: null, grades: [], subjects: [], terms: [], sessions: [] }
  }
}

async function StudentResultPage() {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect('/signin')
  }

  if (session.user?.role !== 'student') {
    redirect('/dashboard')
  }

  const { student, grades, subjects, terms, sessions, className } = await getStudentResults(session.user?.email)

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-purple-900 mb-4">No Student Record Found</h1>
          <Link href="/dashboard" className="text-purple-600 hover:underline">
            Go back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!student.hasPaid) {
    redirect('/student/result/payment-required')
  }

  const currentTerm = terms[0] || 'Term 1'
  const currentSession = sessions[0] || '2025-2026'
  
  const currentGrades = grades.filter(g => g.term === currentTerm && g.academicSession === currentSession)
  
  const getSubjectScore = (subjectId, examType) => {
    const grade = currentGrades.find(g => 
      g.subject?._id?.toString() === subjectId?.toString() && g.exam === examType
    )
    return grade?.marks || '-'
  }

  const getAverageForSubject = (subjectId) => {
    const subjectGrades = currentGrades.filter(g => 
      g.subject?._id?.toString() === subjectId?.toString()
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

  const overallAverage = currentGrades.length > 0 
    ? Math.round(currentGrades.reduce((acc, g) => acc + g.marks, 0) / currentGrades.length)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Matching Project Theme */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 mb-4 font-semibold transition-colors">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          
          <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="w-28 h-28 bg-white/20 rounded-2xl flex items-center justify-center overflow-hidden border-4 border-white/30 shadow-xl flex-shrink-0">
                  {student.photo ? (
                    <img src={student.photo} alt={student.Name} className="w-full h-full object-cover" />
                  ) : (
                    <FaGraduationCap className="text-5xl text-white/80" />
                  )}
                </div>
                <div>
                  <h1 className="text-4xl font-bold">{student.Name}</h1>
                  <p className="text-purple-200 text-xl mt-1">{className}</p>
                  <div className="flex items-center gap-4 mt-3 text-purple-200">
                    <span className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full"><FaCalendar className="text-sm" /> {currentTerm} - {currentSession}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center bg-white/15 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <p className="text-purple-200 mb-2">Overall Average</p>
                <p className="text-6xl font-bold">{overallAverage}%</p>
                <p className="text-purple-200 mt-2 font-bold text-xl">{getGradeLetter(overallAverage)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Purple Theme */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200">Total Subjects</p>
                <p className="text-4xl font-bold mt-2">{subjects.length}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <FaBook className="text-3xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-700 to-indigo-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200">Grades Entered</p>
                <p className="text-4xl font-bold mt-2">{currentGrades.length}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <FaChartLine className="text-3xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200">Highest Score</p>
                <p className="text-4xl font-bold mt-2">
                  {currentGrades.length > 0 ? Math.max(...currentGrades.map(g => g.marks)) : 0}%
                </p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <FaTrophy className="text-3xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200">Lowest Score</p>
                <p className="text-4xl font-bold mt-2">
                  {currentGrades.length > 0 ? Math.min(...currentGrades.map(g => g.marks)) : 0}%
                </p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <FaMedal className="text-3xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Result Sheet - Outstanding Purple Theme */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-600">
          <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 px-8 py-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <FaStar className="text-yellow-300" />
              Result Sheet
            </h2>
            <p className="text-purple-200 mt-2 text-lg">{currentTerm} - {currentSession} Academic Session</p>
          </div>

          {subjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-6 py-5 text-left text-base font-bold text-purple-900 border-b-2 border-r border-purple-300">Subject</th>
                    <th className="px-4 py-5 text-center text-base font-bold text-purple-900 border-b-2 border-r border-purple-300">Test</th>
                    <th className="px-4 py-5 text-center text-base font-bold text-purple-900 border-b-2 border-r border-purple-300">Assignment</th>
                    <th className="px-4 py-5 text-center text-base font-bold text-purple-900 border-b-2 border-r border-purple-300">Exam</th>
                    <th className="px-4 py-5 text-center text-base font-bold text-purple-900 border-b-2 border-r border-purple-300">Average</th>
                    <th className="px-4 py-5 text-center text-base font-bold text-purple-900 border-b-2 border-purple-300">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {subjects.map((subject, index) => {
                    const avg = getAverageForSubject(subject._id)
                    const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-purple-50/50'
                    return (
                      <tr key={subject._id} className={`${rowBg} hover:bg-purple-100 transition-colors`}>
                        <td className="px-6 py-4 border-r border-purple-200">
                          <div>
                            <p className="font-bold text-purple-900 text-lg">{subject.Name}</p>
                            {subject.assignedTeacher && (
                              <p className="text-sm text-purple-600">{subject.assignedTeacher.name}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center border-r border-purple-200">
                          <span className="inline-block px-4 py-2 rounded-lg font-bold bg-purple-100 text-purple-800 border border-purple-300">
                            {getSubjectScore(subject._id, 'Test')}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center border-r border-purple-200">
                          <span className="inline-block px-4 py-2 rounded-lg font-bold bg-purple-100 text-purple-800 border border-purple-300">
                            {getSubjectScore(subject._id, 'Assignment')}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center border-r border-purple-200">
                          <span className="inline-block px-4 py-2 rounded-lg font-bold bg-purple-100 text-purple-800 border border-purple-300">
                            {getSubjectScore(subject._id, 'Final Exam')}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center border-r border-purple-200">
                          <span className="inline-block px-5 py-3 rounded-xl font-bold text-lg bg-purple-600 text-white border-2 border-purple-800 shadow-md">
                            {avg}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-block px-5 py-3 rounded-xl font-bold text-lg border-2 ${
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
            <div className="text-center py-20">
              <div className="w-28 h-28 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaBook className="text-5xl text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-purple-900 mb-3">No Results Yet</h3>
              <p className="text-purple-600 text-lg">Your grades have not been entered yet.</p>
            </div>
          )}
        </div>

        {/* Term Selector */}
        {terms.length > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-800 rounded-2xl p-2 flex gap-2 shadow-xl">
              {terms.map(term => (
                <button
                  key={term}
                  className={`px-8 py-3 rounded-xl font-bold transition-all ${
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
      </div>
    </div>
  )
}

export default StudentResultPage
