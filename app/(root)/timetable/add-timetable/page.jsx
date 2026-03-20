import TimetableForm from "@/components/common-components/TimetableForm"
import { AllClassFetch, AllSubjectFetch } from "@/lib/DataFech/All-data"
import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation'

const AddTimetablePage = async () => {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect('/signin')
  }

  if (session.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  const classes = await AllClassFetch()
  const subjects = await AllSubjectFetch()

  return (
    <TimetableForm 
      classes={classes} 
      subjects={subjects} 
    />
  )
}

export default AddTimetablePage
