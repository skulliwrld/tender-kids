import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation'
import { connectToDB } from '@/lib/Database/connectToDB'
import { Student } from '@/models/student.model'
import { getStudentAttendance, getStudentAttendanceStats } from '@/lib/actions/attendance.action'
import { FaCalendarCheck, FaCalendarTimes, FaClock, FaArrowLeft, FaCheck, FaTimes, FaPercentage } from 'react-icons/fa'
import Link from 'next/link'

async function getStudentByEmail(email) {
  await connectToDB()
  const student = await Student.findOne({ Email: email })
  return student ? JSON.parse(JSON.stringify(student)) : null
}

async function StudentAttendancePage() {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect('/signin')
  }

  if (session.user?.role !== 'student') {
    redirect('/dashboard')
  }

  const student = await getStudentByEmail(session.user?.email)
  
  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Student not found</h1>
          <Link href="/dashboard" className="text-indigo-600 hover:underline mt-2 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const [attendance, stats] = await Promise.all([
    getStudentAttendance(student._id),
    getStudentAttendanceStats(student._id)
  ])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
            <FaCheck className="w-3 h-3" /> Present
          </span>
        )
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
            <FaTimes className="w-3 h-3" /> Absent
          </span>
        )
      case 'Late':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
            <FaClock className="w-3 h-3" /> Late
          </span>
        )
      case 'Leave':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
            <FaArrowLeft className="w-3 h-3" /> Leave
          </span>
        )
      case 'Half Day':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
            ½ Half Day
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            {status}
          </span>
        )
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium"
        >
          <FaArrowLeft /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-500 h-32"></div>
          
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
                  {student.Name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                
                <div className="flex-1 text-center md:text-left mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{student.Name}</h1>
                  <p className="text-gray-500">My Attendance Record</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaCalendarCheck className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-600 font-medium uppercase">Present</p>
                </div>
                <p className="text-2xl font-bold text-green-700">{stats.present}</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaCalendarTimes className="w-4 h-4 text-red-600" />
                  <p className="text-xs text-red-600 font-medium uppercase">Absent</p>
                </div>
                <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaClock className="w-4 h-4 text-yellow-600" />
                  <p className="text-xs text-yellow-600 font-medium uppercase">Late</p>
                </div>
                <p className="text-2xl font-bold text-yellow-700">{stats.late}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaArrowLeft className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-blue-600 font-medium uppercase">Leave</p>
                </div>
                <p className="text-2xl font-bold text-blue-700">{stats.leave}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-purple-600 font-medium uppercase">Half Day</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">{stats.halfDay}</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaPercentage className="w-4 h-4 text-indigo-600" />
                  <p className="text-xs text-indigo-600 font-medium uppercase">Attendance</p>
                </div>
                <p className="text-2xl font-bold text-indigo-700">{stats.presentPercentage}%</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">
                Total Days Recorded: <span className="font-semibold text-gray-900">{stats.total}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-8 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaCalendarCheck /> Attendance History
            </h2>
            <p className="text-indigo-100 text-sm">Your attendance record by date</p>
          </div>
          
          <div className="p-6">
            {attendance && attendance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Day</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Class</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record, index) => (
                      <tr key={record._id || index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {formatDate(record.date)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {record.class?.name || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(record.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FaCalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Attendance Records</h3>
                <p className="text-gray-500">Your attendance has not been marked yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentAttendancePage
