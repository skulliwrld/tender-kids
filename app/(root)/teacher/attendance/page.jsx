'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FaUser, FaCalendar, FaCheck, FaTimes, FaClock, FaClipboardCheck, FaArrowLeft, FaSave } from 'react-icons/fa'

function TeacherAttendanceContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch('/api/teacher/classes')
        const data = await res.json()
        setClasses(data.classes || [])
        
        const classParam = searchParams.get('class')
        if (classParam && data.classes?.length > 0) {
          const foundClass = data.classes.find(c => c._id === classParam)
          if (foundClass) {
            setSelectedClass(classParam)
          }
        }
      } catch (error) {
        console.error('Error fetching classes:', error)
      }
    }
    fetchClasses()
  }, [searchParams])

  useEffect(() => {
    async function fetchStudents() {
      if (!selectedClass || !selectedDate) {
        setStudents([])
        return
      }

      setLoading(true)
      try {
        const res = await fetch(`/api/attendance/students?classId=${selectedClass}&date=${selectedDate}`)
        const data = await res.json()
        setStudents(data.students || [])

        const initialAttendance = {}
        data.students?.forEach(student => {
          if (student.attendance) {
            initialAttendance[student._id] = student.attendance.status
          } else {
            initialAttendance[student._id] = 'Present'
          }
        })
        setAttendance(initialAttendance)
      } catch (error) {
        console.error('Error fetching students:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [selectedClass, selectedDate])

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('classId', selectedClass)
      formData.append('date', selectedDate)
      formData.append('teacherEmail', session?.user?.email)

      Object.keys(attendance).forEach(studentId => {
        formData.append(`attendance_${studentId}`, attendance[studentId])
      })

      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      
      if (data.success) {
        setSaved(true)
        setTimeout(() => {
          setSaved(false)
          router.push('/dashboard')
        }, 1500)
      }
    } catch (error) {
      console.error('Error saving attendance:', error)
    } finally {
      setSaving(false)
    }
  }

  const getDayName = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return daysOfWeek[date.getDay()]
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'Absent':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'Late':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'Leave':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'Half Day':
        return 'bg-purple-100 text-purple-700 border-purple-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Class Attendance</h1>
              <p className="text-xs sm:text-sm">Mark student attendance for your classes</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Choose a class...</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day
              </label>
              <div className="px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">
                {getDayName(selectedDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading students...</p>
          </div>
        ) : selectedClass && students.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Students - {students.length} total
                </h2>
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <span className="flex items-center gap-1">
                    <FaCheck className="w-3 h-3" /> Present: {Object.values(attendance).filter(s => s === 'Present').length}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaTimes className="w-3 h-3" /> Absent: {Object.values(attendance).filter(s => s === 'Absent').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {students.map((student, index) => (
                <div key={student._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'][index % 6]
                      }`}>
                        {student.Name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{student.Name}</p>
                        <p className="text-sm text-gray-500 truncate">{student.Email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-1 sm:gap-2">
                      {['Present', 'Absent', 'Late', 'Leave', 'Half Day'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(student._id, status)}
                          className={`flex flex-col sm:flex-row items-center justify-center gap-1 px-1 py-2 sm:px-2 sm:py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            attendance[student._id] === status
                              ? getStatusColor(status) + ' ring-2 ring-offset-1'
                              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {status === 'Present' && <FaCheck className="w-3 h-3" />}
                          {status === 'Absent' && <FaTimes className="w-3 h-3" />}
                          {status === 'Late' && <FaClock className="w-3 h-3" />}
                          {status === 'Leave' && <FaArrowLeft className="w-3 h-3" />}
                          {status === 'Half Day' && <span className="text-sm">½</span>}
                          <span className="text-[10px] sm:text-xs">{status}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                  saving
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : saved
                    ? 'bg-green-600 text-white'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30'
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <FaCheck className="w-5 h-5" />
                    Attendance Saved!
                  </>
                ) : (
                  <>
                    <FaSave className="w-5 h-5" />
                    Save Attendance
                  </>
                )}
              </button>
            </div>
          </div>
        ) : selectedClass ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Students Found</h3>
            <p className="text-gray-500">This class doesn't have any students assigned yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaClipboardCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Select a Class</h3>
            <p className="text-gray-500">Choose a class to mark attendance</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TeacherAttendancePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <TeacherAttendanceContent />
    </Suspense>
  )
}
