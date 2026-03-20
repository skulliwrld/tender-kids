import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation'
import { getAttendanceByDate } from '@/lib/actions/attendance.action'
import { FaCalendarCheck, FaCalendarTimes, FaClock, FaArrowLeft, FaCheck, FaTimes, FaPercentage, FaUsers, FaCheckSquare } from 'react-icons/fa'
import Link from 'next/link'

export default async function AdminAttendancePage({ searchParams }) {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect('/signin')
  }

  if (session.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  const params = await searchParams
  const selectedDate = params?.date || new Date().toISOString().split('T')[0]

  const { classStats, overallStats } = await getAttendanceByDate(selectedDate)

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const getDayName = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return daysOfWeek[date.getDay()]
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium"
        >
          <FaArrowLeft /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-500 h-32"></div>
          
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
                  <FaCheckSquare className="w-10 h-10" />
                </div>
                
                <div className="flex-1 text-center md:text-left mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">Attendance Overview</h1>
                  <p className="text-gray-500">View student attendance across all classes</p>
                </div>

                <form className="flex items-center gap-2">
                  <input
                    type="date"
                    name="date"
                    defaultValue={selectedDate}
                    max={new Date().toISOString().split('T')[0]}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    View
                  </button>
                </form>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-xl p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-indigo-900">{formatDate(selectedDate)}</p>
                  <p className="text-indigo-600">{getDayName(selectedDate)}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-indigo-600">Overall Attendance</p>
                  <p className="text-3xl font-bold text-indigo-700">{overallStats.presentPercentage}%</p>
                </div>
              </div>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaUsers className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-blue-600 font-medium uppercase">Total</p>
                </div>
                <p className="text-2xl font-bold text-blue-700">{overallStats.totalStudents}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaCheck className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-600 font-medium uppercase">Present</p>
                </div>
                <p className="text-2xl font-bold text-green-700">{overallStats.totalPresent}</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaTimes className="w-4 h-4 text-red-600" />
                  <p className="text-xs text-red-600 font-medium uppercase">Absent</p>
                </div>
                <p className="text-2xl font-bold text-red-700">{overallStats.totalAbsent}</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaClock className="w-4 h-4 text-yellow-600" />
                  <p className="text-xs text-yellow-600 font-medium uppercase">Late</p>
                </div>
                <p className="text-2xl font-bold text-yellow-700">{overallStats.totalLate}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaArrowLeft className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-blue-600 font-medium uppercase">Leave</p>
                </div>
                <p className="text-2xl font-bold text-blue-700">{overallStats.totalLeave}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <p className="text-xs text-purple-600 font-medium uppercase mb-2">Half Day</p>
                <p className="text-2xl font-bold text-purple-700">{overallStats.totalHalfDay}</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-600 font-medium uppercase mb-2">Not Marked</p>
                <p className="text-2xl font-bold text-gray-700">{overallStats.totalNotMarked}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Class-wise Attendance */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-8 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaCalendarCheck /> Class-wise Attendance
            </h2>
            <p className="text-indigo-100 text-sm">Attendance breakdown by class</p>
          </div>
          
          <div className="p-6">
            {classStats && classStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Class</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Total</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-green-600">Present</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-red-600">Absent</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-yellow-600">Late</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-blue-600">Leave</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-purple-600">Half Day</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Not Marked</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-indigo-600">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStats.map((cls, index) => {
                      const percentage = cls.total > 0 ? Math.round((cls.present / cls.total) * 100) : 0
                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {cls.className}
                          </td>
                          <td className="py-3 px-4 text-sm text-center text-gray-600">
                            {cls.total}
                          </td>
                          <td className="py-3 px-4 text-sm text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <FaCheck className="w-3 h-3" /> {cls.present}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <FaTimes className="w-3 h-3" /> {cls.absent}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              <FaClock className="w-3 h-3" /> {cls.late}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              <FaArrowLeft className="w-3 h-3" /> {cls.leave}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              ½ {cls.halfDay}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {cls.notMarked}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              percentage >= 75 ? 'bg-green-100 text-green-700' :
                              percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              <FaPercentage className="w-3 h-3" /> {percentage}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FaCalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Attendance Records</h3>
                <p className="text-gray-500">No attendance has been marked for this date.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
