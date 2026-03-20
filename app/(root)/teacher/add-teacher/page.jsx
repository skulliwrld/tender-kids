import AddTeacherForm from '@/components/shared-component/AddTeacherForm';
import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation';

const AddTeacher = async () => {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect('/signin')
  }

  if (session.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  return <AddTeacherForm />
}

export default AddTeacher