import React from 'react'
import ClassUpdateForm from '@/components/shared-component/classUpdateForm'
import { fetchIndividualClassData } from '@/lib/DataFech/All-data'
import { AllTeachersFetch } from '@/lib/DataFech/All-data'
import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation'
import { serializeMongoDoc } from '@/lib/utils/serialize'


async function ClassEdit({params}) {
    const param = await params
    const {id} = param
    
    const session = await getServerSession(authConfig)
    
    if (!session) {
      redirect('/signin')
    }

    const role = session.user?.role
    const userId = session.user?.id

    const CLASS = await fetchIndividualClassData(id)
    const teachers = await AllTeachersFetch()

    if (!CLASS) {
        return <div>Class not found</div>
    }

    if (role === 'teacher') {
      const teacherIdStr = CLASS.assignedTeacher?._id?.toString() || CLASS.assignedTeacher?.toString()
      if (teacherIdStr !== userId) {
        return <div className="p-8 text-center">You don't have permission to view this class.</div>
      }
    }

  return (
    <ClassUpdateForm content={serializeMongoDoc(CLASS)} Teacher={serializeMongoDoc(teachers)} role={role} />
  )
}

export default ClassEdit