import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaUsers, FaChalkboardTeacher, FaSchool, FaBook, FaClipboardList, FaCalendarAlt, FaUserGraduate, FaStar, FaBell, FaSignOutAlt, FaClock, FaChartLine, FaUser } from "react-icons/fa"
import { MdSubject, MdClass, MdLogout } from "react-icons/md"
import { connectToDB } from '@/lib/Database/connectToDB'
import { Student } from '@/models/student.model'
import { Teacher } from '@/models/teacher.model'
import { Parent } from '@/models/parent.model'
import { Class } from '@/models/class.model'
import { Subject } from '@/models/subject.model'
import Grade from '@/models/grade.model'
import { Result } from '@/models/result.model'
import { ClassRoutine } from '@/models/classroutine.model'
import { Assessment } from '@/models/assessment.model'
import { Day } from '@/models/day.model'
import { Timetable } from '@/models/timetable.model'
import { cache } from 'react'

const getStatsCached = cache(async () => {
  try {
    await connectToDB()
    const [students, teachers, classes, subjects] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Class.countDocuments(),
      Subject.countDocuments()
    ])
    return { students, teachers, classes, subjects }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { students: 0, teachers: 0, classes: 0, subjects: 0 }
  }
})

async function getStats() {
  return getStatsCached()
}

export const dynamic = 'force-dynamic'

async function getTeacherData(teacherEmail) {
  try {
    await connectToDB()
    const teacher = await Teacher.findOne({ email: teacherEmail })
    
    if (!teacher) {
      return { classesCount: 0, studentsCount: 0, classes: [], todaySchedule: [] }
    }
    
    const teacherClasses = await Class.find({ assignedTeacher: teacher._id })
    const studentCount = await Student.countDocuments({ Class: { $in: teacherClasses.map(c => c._id) } })
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const todaySchedule = validDays.includes(today) 
      ? await Timetable.find({ Class: { $in: teacherClasses.map(c => c._id) }, day: today })
          .populate('Class', 'name')
          .populate('periods.subject', 'Name')
          .sort({ 'Class.name': 1 })
      : []
    
    return {
      classesCount: teacherClasses.length,
      studentsCount: studentCount,
      classes: teacherClasses.slice(0, 4),
      todaySchedule
    }
  } catch (error) {
    console.error('Error fetching teacher data:', error)
    return { classesCount: 0, studentsCount: 0, classes: [], todaySchedule: [] }
  }
}

async function getStudentData(studentEmail) {
  try {
    await connectToDB()
    const student = await Student.findOne({ Email: studentEmail }).populate('Class')
    
    if (!student) {
      return { student: null, grades: [], assignments: [], schedule: [], className: 'N/A', averageGrade: 'N/A' }
    }
    
    const grades = await Grade.find({ student: student._id })
      .populate('subject', 'Name')
      .sort({ createdAt: -1 })
    
    const currentTerm = 'Term 1'
    const currentSession = '2025-2026'
    const currentGrades = grades.filter(g => g.term === currentTerm && g.academicSession === currentSession)
    
    const averageGrade = currentGrades.length > 0 
      ? Math.round(currentGrades.reduce((acc, g) => acc + g.marks, 0) / currentGrades.length)
      : 'N/A'
    
    const assignments = await Assessment.find({ class: student?.Class?._id }).sort({ createdAt: -1 }).limit(5)
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    const dayDoc = await Day.findOne({ name: today })
    const schedule = await ClassRoutine.find({ Class: student?.Class?._id, Day: dayDoc?._id }).populate('subject')
    
    return {
      student,
      grades: currentGrades,
      assignments,
      schedule,
      className: student?.Class?.name || 'N/A',
      averageGrade
    }
  } catch (error) {
    console.error('Error fetching student data:', error)
    return { student: null, grades: [], assignments: [], schedule: [], className: 'N/A', averageGrade: 'N/A' }
  }
}

async function getParentData(parentEmail) {
  try {
    await connectToDB()
    const { Parent } = require("@/models/parent.model")
    
    const parent = await Parent.findOne({ Email: parentEmail })
    
    if (!parent) {
      return { parent: null, children: [] }
    }
    
    // Get all children linked to this parent
    const children = await Student.find({ Parent: parent._id })
      .populate('Class', 'name')
      .lean()
    
    return {
      parent,
      children: JSON.parse(JSON.stringify(children))
    }
  } catch (error) {
    console.error('Error fetching parent data:', error)
    return { parent: null, children: [] }
  }
}

export default async function Dashboard() {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect('/signin')
  }

  const role = session.user?.role
  const userEmail = session.user?.email
  const userId = session.user?.id

  let stats = null
  let teacherData = null
  let studentData = null
  let parentData = null

  if (role === 'admin') {
    stats = await getStats()
  } else if (role === 'teacher') {
    teacherData = await getTeacherData(userEmail)
  } else if (role === 'student') {
    studentData = await getStudentData(userEmail)
  } else if (role === 'parent') {
    parentData = await getParentData(userEmail)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                {role === 'admin' && 'Admin Dashboard'}
                {role === 'teacher' && 'Teacher Dashboard'}
                {role === 'student' && 'Student Portal'}
                {role === 'parent' && 'Parent Portal'}
              </h1>
              <p className="text-gray-500 text-sm sm:text-base mt-1">
                Welcome back, {session.user?.name || 'User'}
              </p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <FaBell className="text-lg sm:text-xl text-gray-400 hover:text-purple-600 cursor-pointer transition-colors" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg">
                {session.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Dashboard */}
        {role === 'admin' && stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm font-medium">Total Students</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{stats.students}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUserGraduate className="text-lg sm:text-2xl text-blue-600" />
                  </div>
                </div>
                <Link href="/student" className="text-blue-500 text-xs sm:text-sm mt-2 sm:mt-3 inline-block hover:underline">View All →</Link>
              </div>

              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm font-medium">Total Teachers</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{stats.teachers}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center">
                    <FaChalkboardTeacher className="text-lg sm:text-2xl text-green-600" />
                  </div>
                </div>
                <Link href="/teacher" className="text-green-500 text-xs sm:text-sm mt-2 sm:mt-3 inline-block hover:underline">View All →</Link>
              </div>

              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm font-medium">Total Classes</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{stats.classes}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-purple-100 rounded-full flex items-center justify-center">
                    <MdClass className="text-lg sm:text-2xl text-purple-600" />
                  </div>
                </div>
                <Link href="/class" className="text-purple-500 text-xs sm:text-sm mt-2 sm:mt-3 inline-block hover:underline">View All →</Link>
              </div>

              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm font-medium">Total Subjects</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{stats.subjects}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-orange-100 rounded-full flex items-center justify-center">
                    <MdSubject className="text-lg sm:text-2xl text-orange-600" />
                  </div>
                </div>
                <Link href="/subject" className="text-orange-500 text-xs sm:text-sm mt-2 sm:mt-3 inline-block hover:underline">View All →</Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
              <Link href="/student/add-student" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center gap-3 sm:gap-4">
                  <FaUserGraduate className="text-2xl sm:text-3xl" />
                  <div>
                    <h3 className="text-base sm:text-xl font-bold">Add Student</h3>
                    <p className="text-blue-100 text-xs sm:text-sm">Admit new student</p>
                  </div>
                </div>
              </Link>

              <Link href="/teacher/add-teacher" className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center gap-3 sm:gap-4">
                  <FaChalkboardTeacher className="text-2xl sm:text-3xl" />
                  <div>
                    <h3 className="text-base sm:text-xl font-bold">Add Teacher</h3>
                    <p className="text-green-100 text-xs sm:text-sm">Hire new teacher</p>
                  </div>
                </div>
              </Link>

              <Link href="/class/add-class" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 sm:gap-4">
                  <FaSchool className="text-2xl sm:text-3xl" />
                  <div>
                    <h3 className="text-base sm:text-xl font-bold">Create Class</h3>
                    <p className="text-purple-100 text-xs sm:text-sm">Set up new class</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Module Cards */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Management Modules</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { name: 'Classes', path: '/class', icon: MdClass, color: 'bg-blue-100 text-blue-600' },
                  { name: 'Students', path: '/student', icon: FaUsers, color: 'bg-green-100 text-green-600' },
                  { name: 'Teachers', path: '/teacher', icon: FaChalkboardTeacher, color: 'bg-purple-100 text-purple-600' },
                  { name: 'Parents', path: '/parent', icon: FaUser, color: 'bg-cyan-100 text-cyan-600' },
                  { name: 'Subjects', path: '/subject', icon: MdSubject, color: 'bg-orange-100 text-orange-600' },
                  { name: 'Timetable', path: '/timetable', icon: FaCalendarAlt, color: 'bg-teal-100 text-teal-600' },
                  { name: 'Routines', path: '/classroutine', icon: FaClipboardList, color: 'bg-pink-100 text-pink-600' },
                  { name: 'Exams', path: '/exams', icon: FaStar, color: 'bg-indigo-100 text-indigo-600' },
                ].map((module) => (
                  <Link key={module.name} href={module.path} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all duration-200 group">
                    <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-lg flex items-center justify-center ${module.color}`}>
                      <module.icon className="text-lg sm:text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base group-hover:text-purple-600 transition-colors">{module.name}</h3>
                      <p className="text-gray-400 text-xs sm:text-sm">Manage</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Teacher Dashboard */}
        {role === 'teacher' && teacherData && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 sm:p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm">My Classes</p>
                    <p className="text-3xl sm:text-4xl font-bold mt-1">{teacherData.classesCount}</p>
                  </div>
                  <FaSchool className="text-3xl sm:text-4xl text-white/30" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 sm:p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs sm:text-sm">Total Students</p>
                    <p className="text-3xl sm:text-4xl font-bold mt-1">{teacherData.studentsCount}</p>
                  </div>
                  <FaUserGraduate className="text-3xl sm:text-4xl text-white/30" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4 sm:p-6 shadow-lg sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs sm:text-sm">Today's Classes</p>
                    <p className="text-3xl sm:text-4xl font-bold mt-1">{teacherData.classesCount}</p>
                  </div>
                  <FaClock className="text-3xl sm:text-4xl text-white/30" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">My Classes</h2>
                <div className="space-y-2 sm:space-y-3">
                  {teacherData.classes.length > 0 ? teacherData.classes.map((cls) => (
                    <Link key={cls._id} href={`/class/${cls._id}`} className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors group">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FaSchool className="text-purple-600 text-sm sm:text-base" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{cls.name}</h3>
                          <p className="text-gray-400 text-xs sm:text-sm">{cls.section?.name || 'No section'}</p>
                        </div>
                      </div>
                      <span className="text-purple-600 group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  )) : (
                    <p className="text-gray-500 text-center py-4 text-sm sm:text-base">No classes assigned yet</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
                  Today's Schedule ({new Date().toLocaleDateString('en-US', { weekday: 'long' })})
                </h2>
                <div className="space-y-3">
                  {teacherData.todaySchedule && teacherData.todaySchedule.length > 0 ? (
                    teacherData.todaySchedule.map((schedule, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">{schedule.Class?.name}</h4>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{schedule.day}</span>
                        </div>
                        <div className="space-y-2">
                          {schedule.periods?.map((period, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-2 text-sm">
                              <span className="w-6 h-6 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">
                                {pIdx + 1}
                              </span>
                              <span className="text-gray-700 font-medium">{period.subject?.Name || 'N/A'}</span>
                              <span className="text-gray-400 text-xs">
                                ({period.startTime}{period.startPeriod} - {period.endTime}{period.endPeriod})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <FaCalendarAlt className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No classes scheduled for today</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:col-span-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Quick Actions</h2>
                <div className="space-y-2 sm:space-y-3">
                  <Link href="/teacher/attendance" className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors group">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaClipboardList className="text-green-600 text-sm sm:text-base" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Take Attendance</h3>
                      <p className="text-gray-400 text-xs sm:text-sm">Mark daily attendance</p>
                    </div>
                  </Link>
                  
                  <Link href="/teacher/grades" className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors group">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaStar className="text-blue-600 text-sm sm:text-base" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Upload Grades</h3>
                      <p className="text-gray-400 text-xs sm:text-sm">Submit student grades</p>
                    </div>
                  </Link>
                   
                  <Link href="/student" className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors group">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FaUsers className="text-purple-600 text-sm sm:text-base" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">View Students</h3>
                      <p className="text-gray-400 text-xs sm:text-sm">Browse all students</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Student Dashboard */}
        {role === 'student' && studentData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl p-4 sm:p-6 shadow-lg">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold">
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-indigo-100 text-xs sm:text-sm">Student Name</p>
                    <p className="text-lg sm:text-xl font-bold">{session.user?.name}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 sm:p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs sm:text-sm">Class</p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1">{studentData.className}</p>
                  </div>
                  <FaSchool className="text-3xl sm:text-4xl text-white/30" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-4 sm:p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs sm:text-sm">Average Grade</p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1">
                      {studentData.averageGrade !== 'N/A' 
                        ? studentData.averageGrade + '%'
                        : 'N/A'}
                    </p>
                  </div>
                  <FaStar className="text-3xl sm:text-4xl text-white/30" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Grades */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">My Grades</h2>
                <div className="space-y-2 sm:space-y-3">
                  {studentData.grades.length > 0 ? studentData.grades.slice(0, 5).map((grade, index) => (
                    <div key={index} className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{grade.subject?.Name || 'Subject'}</h3>
                        <p className="text-gray-400 text-xs sm:text-sm">{grade.exam}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg sm:text-xl font-bold text-purple-600">{grade.marks || 0}</p>
                        <p className="text-xs text-gray-400">{grade.term}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center py-4 text-sm sm:text-base">No grades available</p>
                  )}
                </div>
                <Link href="/student/grade" className="block text-center text-purple-600 font-medium mt-3 sm:mt-4 hover:underline text-sm sm:text-base">View All Grades →</Link>
              </div>

              {/* Today's Schedule */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Today's Schedule</h2>
                <div className="space-y-2 sm:space-y-3">
                  {studentData.schedule.length > 0 ? studentData.schedule.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50">
                      <div className="w-12 sm:w-16 text-center">
                        <p className="text-sm font-bold text-purple-600">{item.startTime || '00:00'}</p>
                        <p className="text-xs text-gray-400">{item.endTime || '00:00'}</p>
                      </div>
                      <div className="flex-1 border-l-2 border-purple-200 pl-3 sm:pl-4">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{item.subject?.name || 'Subject'}</h3>
                        <p className="text-gray-400 text-xs sm:text-sm">{item.Class?.name || 'Class'}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center py-4 text-sm sm:text-base">No classes today</p>
                  )}
                </div>
                <Link href="/classroutine" className="block text-center text-purple-600 font-medium mt-3 sm:mt-4 hover:underline text-sm sm:text-base">View Schedule →</Link>
              </div>

              {/* Attendance */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:col-span-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">My Attendance</h2>
                <div className="flex justify-center">
                  <Link href="/student/attendance" className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl font-medium sm:font-semibold hover:shadow-lg transition-all text-sm sm:text-base">
                    View Attendance Record
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Parent Dashboard */}
        {role === 'parent' && parentData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-4 sm:p-6 shadow-lg">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold">
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-orange-100 text-xs sm:text-sm">Welcome</p>
                    <p className="text-lg sm:text-xl font-bold">{session.user?.name}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl p-4 sm:p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm">My Children</p>
                    <p className="text-3xl sm:text-4xl font-bold mt-1">{parentData.children?.length || 0}</p>
                  </div>
                  <FaUsers className="text-3xl sm:text-4xl text-white/30" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* My Children */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">My Children</h2>
                <div className="space-y-2 sm:space-y-3">
                  {parentData.children && parentData.children.length > 0 ? (
                    parentData.children.map((child) => (
                      <Link key={child._id} href={`/parent-portal/${child._id}`} className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors group">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 sm:w-10 h-8 sm:h-10 bg-orange-200 rounded-full flex items-center justify-center">
                            <span className="text-orange-700 font-bold text-sm">{child.Name?.charAt(0)}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{child.Name}</h3>
                            <p className="text-gray-400 text-xs sm:text-sm">{child.Class?.name || 'No Class'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {child.hasPaid ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Paid</span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Unpaid</span>
                          )}
                          <span className="text-orange-600 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4 text-sm sm:text-base">No children found</p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Quick Actions</h2>
                <div className="space-y-2 sm:space-y-3">
                  {parentData.children && parentData.children.length > 0 && parentData.children.map((child) => (
                    <Link 
                      key={`action-${child._id}`}
                      href={`/parent-portal/${child._id}`} 
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaUserGraduate className="text-blue-600 text-sm sm:text-base" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">View {child.Name}'s Profile</h3>
                        <p className="text-gray-400 text-xs sm:text-sm">Attendance, results & more</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
