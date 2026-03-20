import { AllTeachersFetch } from '@/lib/DataFech/All-data';
import ClassForm from "@/components/common-components/ClassForm";
import { addClass } from '@/lib/actions/class.action.model'
import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation';
import { serializeMongoDoc } from '@/lib/utils/serialize';


const AddClasses = async () => {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect('/signin')
  }

  if (session.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  const teachers = await AllTeachersFetch()
    
  return (
    <ClassForm handleAdd={addClass} Teacher={serializeMongoDoc(teachers)} />
  )
}

export default AddClasses