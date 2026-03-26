import React from 'react'
import TopFied from '@/components/common-components/TopFied';
import Linkk from '@/components/Linkk';
import { AllClassFetch } from '@/lib/DataFech/All-data';
import { FaBookOpen, FaLayerGroup } from 'react-icons/fa';
import Link from 'next/link';
import { connectToDB } from '@/lib/Database/connectToDB';
import { Subject as SubjectModel } from '@/models/subject.model';


async function getClassesWithSubjects() {
  await connectToDB()
  
  const classes = await AllClassFetch()
  
  // Get subject count for each class
  const mongoose = require('mongoose')
  
  const classesWithSubjects = await Promise.all(
    classes.map(async (cls) => {
      const subjectCount = await SubjectModel.countDocuments({ 
        classes: new mongoose.Types.ObjectId(cls._id) 
      })
      return {
        ...cls,
        subjectList: Array(subjectCount).fill(null) // Just to show count
      }
    })
  )
  
  return classesWithSubjects
}


async function SubjectPage() {
  const classess = await getClassesWithSubjects()

  return (
    <>
    <div className="p-3 sm:p-6 w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <FaBookOpen className="text-xl sm:text-2xl" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold">Subject Management</h1>
              <p className="text-purple-200 text-xs sm:text-sm">View and manage all school subjects</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Link 
              href="/subject/assign" 
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm w-full sm:w-auto justify-center"
            >
              <FaLayerGroup size={14} />
              Assign to Classes
            </Link>
            <div className="w-full sm:w-auto">
              <TopFied title="Subject" path="/subject/add-subject" searchType="subject"/>
            </div>
          </div>
        </div>
      </div>

      <Linkk items={JSON.parse(JSON.stringify(classess))} title="subject"/>
    </div>
    </>
  )
}

export default SubjectPage
