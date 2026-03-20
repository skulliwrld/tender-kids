import React from 'react'
import { AllClassFetch, AllTeachersFetch } from '@/lib/DataFech/All-data'
import { FetchAllSubjects } from '@/lib/actions/subject.action'
import AssignSubjectForm from '@/components/common-components/AssignSubjectForm'
import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation'

const AssignSubjectPage = async () => {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect('/signin')
  }

  if (session.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  const classes = await AllClassFetch()
  const { subjects } = await FetchAllSubjects()
  const teachers = await AllTeachersFetch()

  return (
    <AssignSubjectForm 
      classes={JSON.parse(JSON.stringify(classes || []))}
      subjects={subjects}
      teachers={JSON.parse(JSON.stringify(teachers))}
    />
  )
}

export default AssignSubjectPage
