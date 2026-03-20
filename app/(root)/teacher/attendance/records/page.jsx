'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FaCalendar, FaCheck, FaTimes, FaClock, FaUsers, FaClipboardCheck, FaEye, FaAngleDown, FaAngleRight } from 'react-icons/fa'

export default function TeacherAttendanceRecordsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [attendanceData, setAttendanceData] = useState({ classes: [], overallStats: {} })
  const [expandedClass, setExpandedClass] = useState(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchAttendance() {
      if (!session?.user?.email) return
      
      setLoading(true)
      try {
        const res = await fetch(`/api/teacher/attendance-records?date=${selectedDate}&email=${session.user.email}`)
        const data = await res.json()
        setAttendanceData(data)
      } catch (error) {
        console.error('Error fetching attendance:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (session?.user?.email) {
      fetchAttendance()
    }
  }, [selectedDate, session])

  const getDayName = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-700'
      case 'Absent': return 'bg-red-100 text-red-700'
      case 'Late': return 'bg-yellow-100 text-yellow-700'
      case 'Leave': return 'bg-blue-100 text-blue-700'
      case 'Half Day': return 'bg-purple-100 text-purple-700'
      case 'Not Marked': return 'bg-gray-100 text-gray-500'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">Attendance Records</h1>
              <p className="text-xs sm:text-sm text-black">View your classes' attendance</p>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <FaCalendar className="text-gray-400 w-4 h-4" />
              <label className="text-sm font-medium text-black">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-sm"
              />
            </div>
            <div className="text-sm text-black">
              <span className="font-medium">{getDayName(selectedDate)}</span>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        {attendanceData.overallStats?.totalStudents > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <FaUsers className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                <p className="text-xs text-black uppercase">Total</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-black">{attendanceData.overallStats.totalStudents}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <FaCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                <p className="text-xs text-black uppercase">Present</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{attendanceData.overallStats.totalPresent}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <FaTimes className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                <p className="text-xs text-black uppercase">Absent</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{attendanceData.overallStats.totalAbsent}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <FaClock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                <p className="text-xs text-black uppercase">Late</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{attendanceData.overallStats.totalLate}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
              <p className="text-xs text-black uppercase mb-1">Attendance</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{attendanceData.overallStats.presentPercentage}%</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
              <p className="text-xs text-black uppercase mb-1">Not Marked</p>
              <p className="text-xl sm:text-2xl font-bold text-black">{attendanceData.overallStats.totalNotMarked}</p>
            </div>
          </div>
        )}

        {/* Classes List */}
        {attendanceData.classes?.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {attendanceData.classes.map((cls) => (
              <div key={cls._id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div 
                  className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedClass(expandedClass === cls._id ? null : cls._id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-black font-bold">
                        {cls.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-black text-sm sm:text-base">{cls.name}</h3>
                        <p className="text-xs sm:text-sm text-black">{cls.total} students</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="hidden sm:flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                        <span className="flex items-center gap-1 text-green-600">
                          <FaCheck className="w-3 h-3" /> {cls.present}
                        </span>
                        <span className="flex items-center gap-1 text-red-600">
                          <FaTimes className="w-3 h-3" /> {cls.absent}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-600">
                          <FaClock className="w-3 h-3" /> {cls.late}
                        </span>
                      </div>
                      <div className="flex sm:hidden items-center gap-2 text-xs">
                        <span className="text-green-600 font-medium">{cls.present}</span>
                        <span className="text-red-600 font-medium">{cls.absent}</span>
                      </div>
                      {expandedClass === cls._id ? 
                        <FaAngleDown className="w-4 h-4 text-black" /> : 
                        <FaAngleRight className="w-4 h-4 text-black" />
                      }
                    </div>
                  </div>
                </div>

                {/* Expanded Student List - Mobile Card View */}
                {expandedClass === cls._id && (
                  <div className="border-t">
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                      <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 text-xs font-medium text-black">
                        <div className="col-span-1">#</div>
                        <div className="col-span-5">Name</div>
                        <div className="col-span-4">Email</div>
                        <div className="col-span-2">Status</div>
                      </div>
                      {cls.students?.map((student, index) => (
                        <div key={student._id} className="grid grid-cols-12 gap-2 p-3 items-center text-sm">
                          <div className="col-span-1 text-black">{index + 1}</div>
                          <div className="col-span-5 font-medium text-black truncate">{student.Name}</div>
                          <div className="col-span-4 text-black truncate">{student.Email}</div>
                          <div className="col-span-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                              {student.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Mobile Card View */}
                    <div className="block md:hidden">
                      {cls.students?.map((student, index) => (
                        <div key={student._id} className="p-3 border-b last:border-b-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-black text-sm">{student.Name}</p>
                              <p className="text-xs text-black truncate">{student.Email}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(student.status)}`}>
                              {student.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border p-8 sm:p-12 text-center">
            <FaClipboardCheck className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-black mb-2">No Classes Found</h3>
            <p className="text-sm sm:text-base text-black">You don't have any classes assigned yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
