import React from 'react'
import ClassSectionForm from '@/components/common-components/ClassSectionForm'
import { AllTeachersFetch, AllClassFetch } from '@/lib/DataFech/All-data'
import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation';
import { serializeMongoDoc } from '@/lib/utils/serialize';

const AddClassSection = async() => {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect('/signin')
  }

  if (session.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  const teachers = await AllTeachersFetch()
  const classes = await AllClassFetch()
  
  return <ClassSectionForm Classes={serializeMongoDoc(classes)} Teacher={serializeMongoDoc(teachers)} />
}

export default AddClassSection