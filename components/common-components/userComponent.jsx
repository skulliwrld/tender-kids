'use client'

import React from 'react'
import { IoLogOut } from 'react-icons/io5'
import Link from 'next/link'
import { Button } from '../ui/button'
import { FaRegArrowAltCircleRight, FaSchool, FaUserShield, FaCog, FaChalkboardTeacher } from 'react-icons/fa'
import { GraduationCap } from 'lucide-react'

const UserComponent = ({ title, path }) => {
  const schoolName = "St. John's School"
  const schoolMotto = "Excellence in Education"
  
  return (
    <>
      {/* School Header */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{schoolName}</h1>
              <p className="text-xs text-white/80">{schoolMotto}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FaUserShield className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* User Info Bar */}
      <section className="flex justify-between items-center w-full border-b p-3 text-sm bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
          <div>
            <span className="font-medium text-gray-900">Admin</span>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
        
        <Link href="/" className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors">
          <span className="text-sm">Logout</span>
          <IoLogOut size={18} />
        </Link>
      </section>

      {/* Page Title & Action */}
      <div className="py-5 flex px-5 items-center justify-between border-b bg-white">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <FaChalkboardTeacher className="text-purple-600 text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Manage {title}</h2>
            <p className="text-sm text-gray-500">View and manage all {title.toLowerCase()} records</p>
          </div>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg transition-colors">
          <Link href={path} className="flex items-center gap-2">
            <FaRegArrowAltCircleRight size={15} />
            Add New {title}
          </Link>   
        </Button>   
      </div>
    </>
  )
}

export default UserComponent
