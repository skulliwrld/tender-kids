import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaUsers, FaChalkboardTeacher, FaSchool, FaBook, FaClipboardList, FaCalendarAlt, FaUserGraduate, FaStar, FaBell, FaSignOutAlt, FaClock, FaChartLine } from "react-icons/fa"
import { MdSubject, MdClass, MdLogout } from "react-icons/md"

async function getStats() {
  const { connectToDB } = require('@/lib/Database/connectToDB')
  const { Student } = require('@/models/student.model')
  const { Teacher } = require('@/models/teacher.model')
  const { Class } = require('@/models/class.model')
  const { Subject } = require('@/models/subject.model')
  
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
}

async function getTeacherData(teacherEmail) {
  const { connectToDB } = require('@/lib/Database/connectToDB')
  const { Teacher } = require('@/models/teacher.model')
  const { Class } = require('@/models/class.model')
  const { Student } = require('@/models/student.model')
  
  try {
    await connectToDB()
    const teacher = await Teacher.findOne({ email: teacherEmail })
    
    if (!teacher) {
      return { classesCount: 0, studentsCount: 0, classes: [] }
    }
    
    const teacherClasses = await Class.find({ assignedTeacher: teacher._id })
    const studentCount = await Student.countDocuments({ Class: { $in: teacherClasses.map(c => c._id) } })
    
    return {
      classesCount: teacherClasses.length,
      studentsCount: studentCount,
      classes: teacherClasses.slice(0, 4)
    }
  } catch (error) {
    console.error('Error fetching teacher data:', error)
    return { classesCount: 0, studentsCount: 0, classes: [] }
  }
}

async function getStudentData(studentId) {
  const { connectToDB } = require('@/lib/Database/connectToDB')
  const { Student } = require('@/models/student.model')
  const { Result } = require('@/models/result.model')
  const { ClassRoutine } = require('@/models/classroutine.model')
  const { Assessment } = require('@/models/assessment.model')
  
  try {
    await connectToDB()
    const student = await Student.findById(studentId).populate('Class')
    
    const results = await Result.find({ student: studentId }).populate('subject').limit(5)
    const assignments = await Assessment.find({ class: student?.Class?._id }).sort({ createdAt: -1 }).limit(5)
    const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' })
    const schedule = await ClassRoutine.find({ Class: student?.Class?._id, day: today }).populate('subject')
    
    return {
      student,
      results,
      assignments,
      schedule,
      className: student?.Class?.name || 'N/A'
    }
  } catch (error) {
    console.error('Error fetching student data:', error)
    return { student: null, results: [], assignments: [], schedule: [], className: 'N/A' }
  }
}

export default async function Dashboard() {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect('/signin')
  }

  const role = session.user?.role
  const userEmail = session.user?.email

  let stats = null
  let teacherData = null
  let studentData = null

  if (role === 'admin') {
    stats = await getStats()
  } else if (role === 'teacher') {
    teacherData = await getTeacherData(userEmail)
  } else if (role === 'student') {
    studentData = await getStudentData(userId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {role === 'admin' && 'Admin Dashboard'}
                {role === 'teacher' && 'Teacher Dashboard'}
                {role === 'student' && 'Student Portal'}
              </h1>
              <p className="text-gray-500 mt-1">
                Welcome back, {session.user?.name || 'User'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <FaBell className="text-xl text-gray-400 hover:text-purple-600 cursor-pointer transition-colors" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {session.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Dashboard */}
        {role === 'admin' && stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Students</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{stats.students}</p>
                  </div>
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUserGraduate className="text-2xl text-blue-600" />
                  </div>
                </div>
                <Link href="/student" className="text-blue-500 text-sm mt-3 inline-block hover:underline">View All Students →</Link>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Teachers</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{stats.teachers}</p>
                  </div>
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                    <FaChalkboardTeacher className="text-2xl text-green-600" />
                  </div>
                </div>
                <Link href="/teacher" className="text-green-500 text-sm mt-3 inline-block hover:underline">View All Teachers →</Link>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Classes</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{stats.classes}</p>
                  </div>
                  <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                    <MdClass className="text-2xl text-purple-600" />
                  </div>
                </div>
                <Link href="/class" className="text-purple-500 text-sm mt-3 inline-block hover:underline">View All Classes →</Link>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Subjects</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{stats.subjects}</p>
                  </div>
                  <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                    <MdSubject className="text-2xl text-orange-600" />
                  </div>
                </div>
                <Link href="/subject" className="text-orange-500 text-sm mt-3 inline-block hover:underline">View All Subjects →</Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Link href="/student/add-student" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <FaUserGraduate className="text-3xl" />
                  <div>
                    <h3 className="text-xl font-bold">Add New Student</h3>
                    <p className="text-blue-100 text-sm">Admit a new student to the school</p>
                  </div>
                </div>
              </Link>

              <Link href="/teacher/add-teacher" className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <FaChalkboardTeacher className="text-3xl" />
                  <div>
                    <h3 className="text-xl font-bold">Add New Teacher</h3>
                    <p className="text-green-100 text-sm">Hire a new teacher</p>
                  </div>
                </div>
              </Link>

              <Link href="/class/add-class" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <FaSchool className="text-3xl" />
                  <div>
                    <h3 className="text-xl font-bold">Create New Class</h3>
                    <p className="text-purple-100 text-sm">Set up a new class</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Module Cards */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Management Modules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Classes', path: '/class', icon: MdClass, color: 'bg-blue-100 text-blue-600' },
                  { name: 'Students', path: '/student', icon: FaUsers, color: 'bg-green-100 text-green-600' },
                  { name: 'Teachers', path: '/teacher', icon: FaChalkboardTeacher, color: 'bg-purple-100 text-purple-600' },
                  { name: 'Subjects', path: '/subject', icon: MdSubject, color: 'bg-orange-100 text-orange-600' },
                  { name: 'Class Routines', path: '/classroutine', icon: FaCalendarAlt, color: 'bg-pink-100 text-pink-600' },
                  { name: 'Exams', path: '/exams', icon: FaClipboardList, color: 'bg-indigo-100 text-indigo-600' },
                ].map((module) => (
                  <Link key={module.name} href={module.path} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all duration-200 group">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${module.color}`}>
                      <module.icon className="text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">{module.name}</h3>
                      <p className="text-gray-400 text-sm">Manage {module.name.toLowerCase()}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">My Classes</p>
                    <p className="text-4xl font-bold mt-1">{teacherData.classesCount}</p>
                  </div>
                  <FaSchool className="text-4xl text-white/30" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Students</p>
                    <p className="text-4xl font-bold mt-1">{teacherData.studentsCount}</p>
                  </div>
                  <FaUserGraduate className="text-4xl text-white/30" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Today's Classes</p>
                    <p className="text-4xl font-bold mt-1">{teacherData.classesCount}</p>
                  </div>
                  <FaClock className="text-4xl text-white/30" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">My Classes</h2>
                <div className="space-y-3">
                  {teacherData.classes.length > 0 ? teacherData.classes.map((cls) => (
                    <Link key={cls._id} href={`/class/${cls._id}`} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FaSchool className="text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{cls.name}</h3>
                          <p className="text-gray-400 text-sm">{cls.section?.name || 'No section'}</p>
                        </div>
                      </div>
                      <span className="text-purple-600 group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  )) : (
                    <p className="text-gray-500 text-center py-4">No classes assigned yet</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link href="/teacher/grades" className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors group">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaStar className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Upload Grades</h3>
                      <p className="text-gray-400 text-sm">Submit student grades</p>
                    </div>
                  </Link>
                  
                  <Link href="/classroutine" className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors group">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaCalendarAlt className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">View Schedule</h3>
                      <p className="text-gray-400 text-sm">Check class routine</p>
                    </div>
                  </Link>
                  
                  <Link href="/student" className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors group">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FaUsers className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">View Students</h3>
                      <p className="text-gray-400 text-sm">Browse all students</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-indigo-100 text-sm">Student Name</p>
                    <p className="text-xl font-bold">{session.user?.name}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Class</p>
                    <p className="text-3xl font-bold mt-1">{studentData.className}</p>
                  </div>
                  <FaSchool className="text-4xl text-white/30" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Average Grade</p>
                    <p className="text-3xl font-bold mt-1">
                      {studentData.results.length > 0 
                        ? Math.round(studentData.results.reduce((acc, r) => acc + (r.score || 0), 0) / studentData.results.length)
                        : 'N/A'}
                    </p>
                  </div>
                  <FaStar className="text-4xl text-white/30" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grades & Results */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">My Grades & Results</h2>
                <div className="space-y-3">
                  {studentData.results.length > 0 ? studentData.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                      <div>
                        <h3 className="font-semibold text-gray-800">{result.subject?.name || 'Subject'}</h3>
                        <p className="text-gray-400 text-sm">{result.term || 'Term'} - {result.academicSession || 'Academic Year'}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-lg font-bold ${
                        (result.score || 0) >= 80 ? 'bg-green-100 text-green-700' :
                        (result.score || 0) >= 60 ? 'bg-blue-100 text-blue-700' :
                        (result.score || 0) >= 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {result.score || 'N/A'}
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center py-4">No results available yet</p>
                  )}
                </div>
                <Link href="/student/result" className="block text-center text-purple-600 font-medium mt-4 hover:underline">View All Results →</Link>
              </div>

              {/* Today's Schedule */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Schedule</h2>
                <div className="space-y-3">
                  {studentData.schedule.length > 0 ? studentData.schedule.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                      <div className="w-16 text-center">
                        <p className="text-sm font-bold text-purple-600">{item.startTime || '00:00'}</p>
                        <p className="text-xs text-gray-400">{item.endTime || '00:00'}</p>
                      </div>
                      <div className="flex-1 border-l-2 border-purple-200 pl-4">
                        <h3 className="font-semibold text-gray-800">{item.subject?.name || 'Subject'}</h3>
                        <p className="text-gray-400 text-sm">{item.Class?.name || 'Class'}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center py-4">No classes scheduled for today</p>
                  )}
                </div>
                <Link href="/classroutine" className="block text-center text-purple-600 font-medium mt-4 hover:underline">View Full Schedule →</Link>
              </div>

              {/* Assignments */}
              <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Assignments</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentData.assignments.length > 0 ? studentData.assignments.map((assignment, index) => (
                    <div key={index} className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
                      <h3 className="font-semibold text-gray-800 mb-2">{assignment.title || 'Assignment'}</h3>
                      <p className="text-gray-500 text-sm mb-2">{assignment.subject?.name || 'Subject'}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          assignment.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {assignment.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center py-4 col-span-3">No assignments yet</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
