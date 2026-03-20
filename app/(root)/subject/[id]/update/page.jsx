import React from 'react'
import { fetchIndividuaLSubjectData } from '@/lib/actions/subject.action'
import { AllTeachersFetch, AllClassFetch } from '@/lib/DataFech/All-data'
import SubjectUpdateForm from '@/components/shared-component/subjectUpdateForm'
import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation'
import { serializeMongoDoc } from '@/lib/utils/serialize'


async function SubjectEdit({params}) {
  const param = await params
  const {id} = param

  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect('/signin')
  }

  const role = session.user?.role
  const userId = session.user?.id

  const SUBJECT = await fetchIndividuaLSubjectData(id)
  const teachers = await AllTeachersFetch()
  const classes = await AllClassFetch()

  if (!SUBJECT) {
    return <div>Subject not found</div>
  }

  if (role === 'teacher') {
    const teacherIdStr = SUBJECT.assignedTeacher?._id?.toString() || SUBJECT.assignedTeacher?.toString()
    if (teacherIdStr !== userId) {
      return <div className="p-8 text-center">You don't have permission to view this subject.</div>
    }
  }

  return (
    <SubjectUpdateForm 
      content={serializeMongoDoc(SUBJECT)} 
      Teacher={serializeMongoDoc(teachers)} 
      classes={serializeMongoDoc(classes)} 
      role={role}
    />
  )
}

export default SubjectEdit