import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation'
import { connectToDB } from '@/lib/Database/connectToDB'
import { Student } from '@/models/student.model'
import Grade from '@/models/grade.model'
import { Subject } from '@/models/subject.model'
import Link from 'next/link'

async function getStudentGradesData(studentEmail) {
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
      subjects = await Subject.find({ classes: student.Class._id })
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
    console.error('Error fetching student grades:', error)
    return { student: null, grades: [], subjects: [], terms: [], sessions: [] }
  }
}

function calculateGrade(grades) {
  if (!grades || grades.length === 0) return { finalGrade: '-', letterGrade: '-' }

  const totalMarks = grades.reduce((sum, g) => sum + (g.marks || 0), 0)
  const finalGrade = Math.round(totalMarks / grades.length)

  let letterGrade
  if (finalGrade >= 90) letterGrade = 'A+'
  else if (finalGrade >= 80) letterGrade = 'A'
  else if (finalGrade >= 70) letterGrade = 'B'
  else if (finalGrade >= 60) letterGrade = 'C'
  else if (finalGrade >= 50) letterGrade = 'D'
  else letterGrade = 'F'

  return { finalGrade, letterGrade }
}

async function StudentGradePage({ searchParams }) {
  const params = await searchParams
  const selectedTerm = params?.term || 'Term 1'
  const selectedSession = params?.session || '2025-2026'

  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect('/signin')
  }

  if (session.user?.role !== 'student') {
    redirect('/dashboard')
  }

  const { student, grades, subjects, terms, sessions, className } = await getStudentGradesData(session.user?.email)

  if (!student) {
    redirect('/dashboard')
  }

  const currentTerm = terms[0] || selectedTerm
  const currentSession = sessions[0] || selectedSession
  
  const currentGrades = grades.filter(g => g.term === currentTerm && g.academicSession === currentSession)

  const subjectsWithCalculations = subjects.map(subject => {
    const subjectGrades = currentGrades.filter(g => 
      g.subject?._id?.toString() === subject._id?.toString()
    )
    const { finalGrade, letterGrade } = calculateGrade(subjectGrades)
    return {
      ...subject,
      grades: subjectGrades,
      finalGrade,
      letterGrade
    }
  })

  const overallCalculation = calculateGrade(currentGrades)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-purple-900">My Grades</h1>
            <p className="text-purple-600">{className} - {currentTerm} ({currentSession})</p>
          </div>
          <Link href="/student/result" className="text-purple-600 hover:text-purple-800 font-medium">
            View Result Sheet →
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-purple-200">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
            <h2 className="text-white font-bold text-lg">Grade Summary</h2>
          </div>
          
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-bold text-purple-900 border-b-2 border-r border-purple-200">Subject</th>
                <th className="px-4 py-4 text-center text-sm font-bold text-purple-900 border-b-2 border-r border-purple-200">Test</th>
                <th className="px-4 py-4 text-center text-sm font-bold text-purple-900 border-b-2 border-r border-purple-200">Assignment</th>
                <th className="px-4 py-4 text-center text-sm font-bold text-purple-900 border-b-2 border-r border-purple-200">Exam</th>
                <th className="px-4 py-4 text-center text-sm font-bold text-purple-900 border-b-2 border-r border-purple-200">Average</th>
                <th className="px-4 py-4 text-center text-sm font-bold text-purple-900 border-b-2 border-purple-200">Grade</th>
              </tr>
            </thead>
            <tbody>
              {subjectsWithCalculations.map((subject, index) => {
                const getScore = (exam) => {
                  const grade = subject.grades.find(g => g.exam === exam)
                  return grade?.marks || '-'
                }
                return (
                  <tr key={subject._id} className={index % 2 === 0 ? 'bg-white' : 'bg-purple-50/50'}>
                    <td className="px-4 py-4 border-b border-r border-purple-100 font-semibold text-purple-900">{subject.Name}</td>
                    <td className="px-4 py-4 text-center border-b border-r border-purple-100">
                      <span className="inline-block px-3 py-1 rounded bg-purple-100 text-purple-800 font-medium">
                        {getScore('Test')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center border-b border-r border-purple-100">
                      <span className="inline-block px-3 py-1 rounded bg-purple-100 text-purple-800 font-medium">
                        {getScore('Assignment')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center border-b border-r border-purple-100">
                      <span className="inline-block px-3 py-1 rounded bg-purple-100 text-purple-800 font-medium">
                        {getScore('Final Exam')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center border-b border-r border-purple-100 font-bold text-purple-700">
                      {subject.finalGrade}
                    </td>
                    <td className="px-4 py-4 text-center border-b border-purple-100">
                      <span className={`px-3 py-1 rounded text-sm font-bold ${
                        subject.letterGrade === 'A+' || subject.letterGrade === 'A' ? 'bg-green-500 text-white' :
                        subject.letterGrade === 'B' ? 'bg-blue-500 text-white' :
                        subject.letterGrade === 'C' ? 'bg-yellow-500 text-white' :
                        subject.letterGrade === 'D' ? 'bg-orange-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {subject.letterGrade}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {subjects.length === 0 && (
            <div className="text-center py-12 text-purple-500">
              No grades available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentGradePage
