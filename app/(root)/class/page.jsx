import React from 'react'
import TopFied from '@/components/common-components/TopFied';
import { FetchClasses } from '@/lib/DataFech/All-data';
import ClassTable from '@/components/common-components/ClassTable';
import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation';


async function Classes({searchParams}) {
  const params = await searchParams
  const q = params?.q || ""

  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect('/signin')
  }

  const role = session.user?.role
  const userId = session.user?.id

  let teacherId = null
  if (role === 'teacher') {
    teacherId = userId
  }

  const {classes} = await FetchClasses(q, teacherId)
  
  return ( 
    <section className="w-full border-y-2 px-5">
       <TopFied title={role === 'teacher' ? 'My Classes' : 'Classes'} path={role === 'admin' ? '/class/add-class' : null}/>

       <ClassTable Data={classes || []} role={role}/>

       {role === 'teacher' && (!classes || classes.length === 0) && (
         <p className="text-center text-gray-500 py-8">No classes assigned to you yet.</p>
       )}
        
    </section>
  )
}

export default Classes