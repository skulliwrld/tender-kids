'use client'

import React from 'react'
import Link from 'next/link'
import { FaChalkboardTeacher, FaEdit, FaTrashAlt, FaUsers, FaSchool, FaEllipsisV } from 'react-icons/fa'
import { deleteClass } from '@/lib/actions/class.action.model';

const ClassTable = ({ Data, role = 'admin' }) => {
  const isTeacher = role === 'teacher'

  return (
    <div className="w-full">
      {Data && Data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Data.map((cls, index) => (
            <div 
              key={cls?._id || `class-${index}`} 
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <FaSchool className="text-xl text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{cls.name}</h3>
                      <p className="text-purple-200 text-sm">ID: {cls.numericId}</p>
                    </div>
                  </div>
                  {!isTeacher && (
                    <div className="relative group/menu">
                      <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                        <FaEllipsisV className="text-white" />
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                        <Link 
                          href={`/class/${cls._id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-t-xl"
                        >
                          <FaEdit className="text-purple-600" />
                          Edit
                        </Link>
                        <form action={deleteClass} className="w-full">
                          <input type="hidden" name="id" value={cls._id}/>
                          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-xl">
                            <FaTrashAlt />
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <FaChalkboardTeacher className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Class Teacher</p>
                      <p className="font-semibold text-gray-800">
                        {cls.assignedTeacher?.name || 'Not assigned'}
                      </p>
                    </div>
                  </div>
                  {isTeacher && (
                    <Link 
                      href={`/class/${cls._id}`}
                      className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSchool className="text-3xl text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Classes Found</h3>
          <p className="text-gray-500">There are no classes to display yet.</p>
        </div>
      )}
    </div>
  )
}

export default ClassTable