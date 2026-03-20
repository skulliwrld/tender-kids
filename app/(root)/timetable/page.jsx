import Link from 'next/link'
import { FaPlus, FaCalendar, FaClock, FaSchool, FaTrash } from 'react-icons/fa'
import { fetchAllTimetables } from '@/lib/actions/timetable.action'
import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const TimetablePage = async () => {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect('/signin')
  }

  if (session.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  const timetables = await fetchAllTimetables()
  
  const classesMap = {}
  timetables.forEach(t => {
    if (!classesMap[t.Class?._id]) {
      classesMap[t.Class?._id] = {
        className: t.Class?.name || 'Unknown',
        classId: t.Class?._id,
        schedule: {}
      }
    }
    classesMap[t.Class?._id].schedule[t.day] = t.periods
  })

  const classes = Object.values(classesMap)

  return (
    <div className="w-full px-3 md:px-6 py-4 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <FaCalendar className="text-white text-lg md:text-xl" />
          </div>
          <span className="hidden md:inline">Timetable Management</span>
          <span className="md:hidden">Timetable</span>
        </h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">Manage class schedules - 3 subjects per day (Mon-Fri)</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FaSchool className="text-purple-600" />
            Class Timetables
          </h2>
          <Link 
            href="/timetable/add-timetable" 
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
          >
            <FaPlus className="text-sm" />
            <span className="hidden md:inline">Create Timetable</span>
            <span className="md:hidden">Create</span>
          </Link>
        </div>

        {classes.length > 0 ? (
          <div className="space-y-4 md:space-y-6">
            {classes.map((cls) => (
              <div key={cls.classId} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 md:px-6 py-3 md:py-4">
                  <h3 className="text-white font-bold text-base md:text-lg">{cls.className}</h3>
                </div>
                
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Day</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Period 1</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Period 2</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Period 3</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {DAYS.map((day) => {
                        const periods = cls.schedule[day] || []
                        return (
                          <tr key={day} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-800">{day}</td>
                            {periods.length > 0 ? (
                              <>
                                {periods.map((period, idx) => (
                                  <td key={idx} className="px-4 py-3">
                                    <div className="text-sm">
                                      <p className="font-medium text-gray-800">{period.subject?.Name || 'Not set'}</p>
                                      <p className="text-gray-500 text-xs flex items-center gap-1">
                                        <FaClock className="text-xs" />
                                        {period.startTime}{period.startPeriod} - {period.endTime}{period.endPeriod}
                                      </p>
                                    </div>
                                  </td>
                                ))}
                                {Array.from({ length: 3 - periods.length }).map((_, idx) => (
                                  <td key={`empty-${idx}`} className="px-4 py-3 text-gray-400 text-sm">Not set</td>
                                ))}
                              </>
                            ) : (
                              <>
                                <td className="px-4 py-3 text-gray-400 text-sm">Not set</td>
                                <td className="px-4 py-3 text-gray-400 text-sm">Not set</td>
                                <td className="px-4 py-3 text-gray-400 text-sm">Not set</td>
                              </>
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-3 space-y-3">
                  {DAYS.map((day) => {
                    const periods = cls.schedule[day] || []
                    return (
                      <div key={day} className="bg-gray-50 rounded-lg p-3">
                        <p className="font-semibold text-gray-800 text-sm mb-2">{day}</p>
                        <div className="space-y-2">
                          {periods.length > 0 ? (
                            periods.map((period, idx) => (
                              <div key={idx} className="bg-white rounded p-2 flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-800 text-sm">{period.subject?.Name || 'Not set'}</p>
                                  <p className="text-gray-500 text-xs">
                                    {period.startTime}{period.startPeriod} - {period.endTime}{period.endPeriod}
                                  </p>
                                </div>
                                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">P{idx + 1}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-400 text-sm">No schedule</p>
                          )}
                          {Array.from({ length: 3 - periods.length }).map((_, idx) => (
                            <div key={`empty-${idx}`} className="bg-gray-100 rounded p-2 text-gray-400 text-sm">
                              Period {periods.length + idx + 1}: Not set
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 md:py-12">
            <FaCalendar className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Timetables Created</h3>
            <p className="text-gray-500 mb-4 text-sm md:text-base">Create timetables for your classes</p>
            <Link 
              href="/timetable/add-timetable" 
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaPlus className="text-sm" />
              Create Timetable
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default TimetablePage
