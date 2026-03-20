'use client'

import React, { useState } from 'react'
import {
  Users,
  BookOpen,
  ClipboardList,
  Calendar,
  Clock,
  User,
  LogOut,
  Settings,
  ChevronDown,
  X,
  GraduationCap,
  Mail,
  Phone,
  Home,
  ArrowLeft,
  Plus
} from 'lucide-react'
import Link from 'next/link'

const TeacherDashboard = ({ user, stats, todaySchedule, classes }) => {
  const [selectedClass, setSelectedClass] = useState(null)

  const handleSignOut = () => {
    window.location.href = '/signin'
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome Back, {user?.name || 'Teacher'}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your classes today
              </p>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 hidden group-hover:block">
                <div className="py-1">
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Total Students Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.totalStudents || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm">
                  <span className="text-green-600 font-medium">↗️ +12%</span>
                  <span className="text-gray-500 ml-2">from last month</span>
                </div>
              </div>
            </div>

            {/* Active Classes Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Classes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.activeClasses || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm">
                  <span className="text-green-600 font-medium">↗️ +5%</span>
                  <span className="text-gray-500 ml-2">from last week</span>
                </div>
              </div>
            </div>

            {/* Pending Assignments Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Assignments</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.pendingAssignments || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm">
                  <span className="text-red-600 font-medium">↗️ +8%</span>
                  <span className="text-gray-500 ml-2">need grading</span>
                </div>
              </div>
            </div>
          </div>

          {/* My Classes Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Classes</h2>
                <p className="text-sm text-gray-500">Select a class to view students</p>
              </div>
            </div>

            {classes && classes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {classes.map((cls, index) => {
                  const colors = [
                    { bg: 'from-blue-500 to-cyan-500', icon: 'from-blue-600 to-cyan-600', shadow: 'shadow-blue-500/20' },
                    { bg: 'from-purple-500 to-pink-500', icon: 'from-purple-600 to-pink-600', shadow: 'shadow-purple-500/20' },
                    { bg: 'from-emerald-500 to-teal-500', icon: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-500/20' },
                    { bg: 'from-orange-500 to-red-500', icon: 'from-orange-600 to-red-600', shadow: 'shadow-orange-500/20' },
                    { bg: 'from-indigo-500 to-blue-500', icon: 'from-indigo-600 to-blue-600', shadow: 'shadow-indigo-500/20' },
                    { bg: 'from-rose-500 to-pink-500', icon: 'from-rose-600 to-pink-600', shadow: 'shadow-rose-500/20' },
                  ]
                  const color = colors[index % colors.length]
                  
                  return (
                    <div 
                      key={index}
                      className="group cursor-pointer"
                      onClick={() => setSelectedClass(cls)}
                    >
                      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color.bg} ${color.shadow} shadow-lg p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105`}>
                        {/* Decorative circles */}
                        <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full"></div>
                        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full"></div>
                        
                        {/* Content */}
                        <div className="relative z-10">
                          <div className={`w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors`}>
                            <BookOpen className="w-7 h-7 text-white" />
                          </div>
                          
                          <h3 className="text-xl font-bold text-white mb-1">
                            {cls.name || `Class ${cls.numericId || index + 1}`}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
                            <span className="bg-white/20 px-2 py-0.5 rounded-md">
                              ID: {cls.numericId || 'N/A'}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                              <Users className="w-4 h-4 text-white" />
                              <span className="text-white font-semibold">{cls.studentCount || 0}</span>
                              <span className="text-white/80 text-sm">Students</span>
                            </div>
                            
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                              <svg className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Classes Assigned</h3>
                <p className="text-gray-500">You haven't been assigned to any classes yet.</p>
              </div>
            )}
          </div>

          {/* Today's Schedule Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
                  <p className="text-sm text-gray-600">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule List */}
            <div className="space-y-4">
              {todaySchedule && todaySchedule.length > 0 ? (
                todaySchedule.map((schedule, index) => (
                  <div
                    key={index}
                    className="p-4 bg-purple-50 rounded-lg border border-purple-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-gray-900">{schedule.Class?.name || 'Class'}</span>
                      </div>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{schedule.day}</span>
                    </div>
                    <div className="space-y-2">
                      {schedule.periods?.map((period, pIdx) => (
                        <div key={pIdx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">
                              {pIdx + 1}
                            </span>
                            <span className="text-gray-700 font-medium">{period.subject?.Name || 'Not set'}</span>
                          </div>
                          <span className="text-gray-500 text-xs">
                            {period.startTime}{period.startPeriod} - {period.endTime}{period.endPeriod}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No classes scheduled for today</p>
                  <p className="text-sm text-gray-400 mt-1">Enjoy your day off! 🎉</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Students Dialog */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedClass(null)}
          />
          
          {/* Dialog Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedClass.name || `Class ${selectedClass.numericId}`}</h2>
                    <p className="text-purple-200">{selectedClass.studentCount || 0} Students</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/teacher/attendance?class=${selectedClass._id}`}
                    className="flex items-center gap-2 bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors"
                  >
                    <ClipboardList className="w-4 h-4" />
                    Take Attendance
                  </Link>
                  <Link 
                    href={`/teacher/grades/input?class=${selectedClass._id}`}
                    className="flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Grades
                  </Link>
                  <button 
                    onClick={() => setSelectedClass(null)}
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Students List */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {selectedClass.students && selectedClass.students.length > 0 ? (
                <div className="grid gap-3">
                  {selectedClass.students.map((student, idx) => {
                    const avatarColors = [
                      'from-blue-500 to-indigo-500',
                      'from-purple-500 to-pink-500',
                      'from-emerald-500 to-teal-500',
                      'from-orange-500 to-amber-500',
                      'from-rose-500 to-red-500',
                      'from-cyan-500 to-blue-500',
                      'from-violet-500 to-purple-500',
                      'from-teal-500 to-green-500',
                    ]
                    const avatarColor = avatarColors[idx % avatarColors.length]
                    
                    return (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all border border-gray-100 hover:border-purple-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${avatarColor} rounded-full flex items-center justify-center text-white font-bold shadow-md`}>
                          {student.Name ? student.Name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{student.Name || 'N/A'}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            {student.Email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {student.Email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {student.Gender && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            student.Gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                          }`}>
                            {student.Gender}
                          </span>
                        )}
                        {student.Phone && (
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Phone className="w-3 h-3" />
                            {student.Phone}
                          </span>
                        )}
                      </div>
                    </div>
                  )})}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Students in This Class</h3>
                  <p className="text-gray-500">This class doesn't have any students assigned yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherDashboard
