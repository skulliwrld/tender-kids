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
    <div className="px-6 py-6 w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <FaBookOpen className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Subject Management</h1>
              <p className="text-purple-200">View and manage all school subjects</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/subject/assign" 
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaLayerGroup size={14} />
              Assign to Classes
            </Link>
            <TopFied title="Subject" path="/subject/add-subject"/>
          </div>
        </div>
      </div>

      <Linkk items={JSON.parse(JSON.stringify(classess))} title="subject"/>
    </div>
    </>
  )
}

export default SubjectPage
