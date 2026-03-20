import ClassRoutineForm from "@/components/common-components/classRoutineForm";
import { AllClassFetch, AllDayFetch, AllSubjectFetch } from "@/lib/DataFech/All-data";
import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation';
import { serializeMongoDoc } from '@/lib/utils/serialize';


const AddClassRoutine = async () => {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect('/signin')
  }

  if (session.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  const Subjects = await AllSubjectFetch()
  const CLASS = await AllClassFetch()
  const days = await AllDayFetch()

  return <ClassRoutineForm Class={serializeMongoDoc(CLASS)} Subject={serializeMongoDoc(Subjects)} Days={serializeMongoDoc(days)} />
}

export default AddClassRoutine