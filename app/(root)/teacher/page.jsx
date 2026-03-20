import React from 'react'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authConfig } from '@/auth.config'
import { FetchTeachers } from '@/lib/actions/teacher.actions'
import { getTeacherDashboardStats, getTeacherTodaySchedule, getTeacherStudents, getTeacherClasses } from '@/lib/actions/teacher.actions'
import TeacherDashboard from '@/components/TeacherDashboard'
import TopFied from '@/components/common-components/TopFied'
import Link from 'next/link'
import { FaChalkboardTeacher, FaEnvelope, FaPhone, FaUser, FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa'
import { deleteTeacher } from '@/lib/actions/teacher.actions'

async function TeacherPage({ searchParams }) {
  const params = await searchParams
  const q = params?.q || ""

  const session = await getServerSession(authConfig)

  if (!session) {
    redirect('/signin')
  }

  const role = session.user?.role

  if (role === 'teacher') {
    const stats = await getTeacherDashboardStats(session.user.email)
    const todaySchedule = await getTeacherTodaySchedule(session.user.email)
    const classes = await getTeacherClasses(session.user.email)

    return (
      <TeacherDashboard
        user={session.user}
        stats={stats}
        todaySchedule={todaySchedule}
        classes={classes}
      />
    )
  }

  if (role !== 'admin') {
    redirect('/dashboard')
  }

  const { Teachers } = await FetchTeachers(q)

  return (
    <section className="w-full px-5">
      <TopFied title="Teachers" path="/teacher/add-teacher" />

      {Teachers && Teachers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Teachers.map((teacher, index) => (
            <div
              key={teacher?._id || `teacher-${index}`}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden">
                    {teacher?.photo ? (
                      <img src={teacher.photo} alt={teacher?.name || 'Teacher'} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <FaUser className="text-xl text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      {teacher?.title ? `${teacher.title} ` : ''}{teacher?.name || 'Unknown'}
                    </h3>
                    <p className="text-purple-200 text-sm">Teacher</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <FaEnvelope className="text-purple-600" />
                  <span className="truncate">{teacher?.email || 'No email'}</span>
                </div>
                {teacher?.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaPhone className="text-purple-600" />
                    <span>{teacher.phone}</span>
                  </div>
                )}
                {teacher?.gender && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaUser className="text-purple-600" />
                    <span className="capitalize">{teacher.gender}</span>
                  </div>
                )}
              </div>

              <div className="px-5 pb-5 flex gap-2">
                <Link
                  href={`/teacher/${teacher?._id}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-100 text-purple-600 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  <FaEdit /> Edit
                </Link>
                <form action={deleteTeacher} className="flex-1">
                  <input type="hidden" name="id" value={teacher?._id} />
                  <button className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition-colors">
                    <FaTrashAlt /> Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaChalkboardTeacher className="text-3xl text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Teachers Found</h3>
          <p className="text-gray-500">There are no teachers to display yet.</p>
          <Link
            href="/teacher/add-teacher"
            className="inline-flex items-center gap-2 mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FaPlus /> Add Teacher
          </Link>
        </div>
      )}
    </section>
  )
}

export default TeacherPage