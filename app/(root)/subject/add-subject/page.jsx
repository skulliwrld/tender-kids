import { AllClassFetch, AllTeachersFetch } from '@/lib/DataFech/All-data';
import SubjectForm from '@/components/common-components/SubjectForm';
import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation';
import { serializeMongoDoc } from '@/lib/utils/serialize';


const AddSubject = async () => {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect('/signin')
  }

  if (session.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  const classess = await AllClassFetch()
  const Teachers = await AllTeachersFetch()

  return <SubjectForm Teachers={serializeMongoDoc(Teachers)} classes={serializeMongoDoc(classess)} />
}

export default AddSubject