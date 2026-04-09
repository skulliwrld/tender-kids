import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation'
import { connectToDB } from '@/lib/Database/connectToDB'
import { Student } from '@/models/student.model'
import Grade from '@/models/grade.model'
import { Subject } from '@/models/subject.model'
import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'
import AdvancedResultSheet from '@/components/AdvancedResultSheet'

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">No Student Record Found</h1>
          <Link href="/dashboard" className="text-indigo-600 hover:underline text-sm sm:text-base">
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
  
  // Ensure all data is properly serialized for client component
  const serializedGrades = JSON.parse(JSON.stringify(
    grades.filter(g => g.term === currentTerm && g.academicSession === currentSession)
  ))
  
  const serializedStudent = JSON.parse(JSON.stringify(student))
  const serializedSubjects = JSON.parse(JSON.stringify(subjects))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
            <FaArrowLeft className="text-sm" /> Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Advanced Result Sheet */}
      <AdvancedResultSheet
        student={serializedStudent}
        subjects={serializedSubjects}
        grades={serializedGrades}
        term={currentTerm}
        session={currentSession}
        className={className}
      />
    </div>
  )
}

export default StudentResultPage
