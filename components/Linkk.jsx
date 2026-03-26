import React from 'react'
import Link from 'next/link'
import { FaBookOpen, FaPlus, FaChalkboardTeacher, FaLayerGroup, FaUsers, FaClipboardList } from 'react-icons/fa'

const Linkk = ({items, title}) => {
  return (
    <div className="w-full p-3 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <FaBookOpen className="text-white text-lg sm:text-xl" />
          </div>
          <span className="hidden sm:inline">Subject Management</span>
          <span className="sm:hidden">Subjects</span>
        </h1>
        <p className="text-gray-500 mt-1 sm:mt-2 text-sm">View subjects organized by class</p>
      </div>

      {/* Classes Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FaLayerGroup className="text-purple-600" />
            <span className="hidden sm:inline">All Classes and Their Subjects</span>
            <span className="sm:hidden">Classes & Subjects</span>
          </h2>
          <Link 
            href={`/${title}/add-${title}`} 
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm w-full sm:w-auto justify-center"
          >
            <FaPlus className="text-sm" />
            <span className="hidden sm:inline">Add Subject</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>

        {/* Class Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items && items.length > 0 ? (
            items.map((data, index) => {
              const colors = [
                { bg: 'from-blue-500 to-cyan-500', icon: 'from-blue-600 to-cyan-600' },
                { bg: 'from-purple-500 to-pink-500', icon: 'from-purple-600 to-pink-600' },
                { bg: 'from-emerald-500 to-teal-500', icon: 'from-emerald-600 to-teal-600' },
                { bg: 'from-orange-500 to-red-500', icon: 'from-orange-600 to-red-600' },
                { bg: 'from-indigo-500 to-blue-500', icon: 'from-indigo-600 to-blue-600' },
                { bg: 'from-rose-500 to-pink-500', icon: 'from-rose-600 to-pink-600' },
                { bg: 'from-violet-500 to-purple-500', icon: 'from-violet-600 to-purple-600' },
                { bg: 'from-teal-500 to-green-500', icon: 'from-teal-600 to-green-600' },
              ]
              const color = colors[index % colors.length]
              
              return (
                <Link 
                  key={data._id} 
                  href={`/${title}/${data._id}`}
                  className="group"
                >
                  <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${color.bg} p-5 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105`}>
                    {/* Decorative */}
                    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full"></div>
                    <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/10 rounded-full"></div>
                    
                    <div className="relative z-10">
                      <div className={`w-12 h-12 bg-gradient-to-br ${color.icon} rounded-lg flex items-center justify-center mb-3 shadow-lg`}>
                        <FaLayerGroup className="text-white text-xl" />
                      </div>
                      <h3 className="text-white font-bold text-lg mb-1">{data.name}</h3>
                      <p className="text-white/80 text-sm">Class ID: {data.numericId || 'N/A'}</p>
                      
                      {/* Subject count badge */}
                      <div className="mt-4 flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg">
                          <FaClipboardList className="text-white text-xs" />
                          <span className="text-white text-sm font-medium">
                            {data.subjectList?.length || 0} Subject{data.subjectList?.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-white/90 text-sm flex items-center gap-1">
                          View Subjects
                        </span>
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <FaBookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Classes Found</h3>
              <p className="text-gray-500">Create classes first to add subjects.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Linkk
