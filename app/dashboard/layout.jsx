import NavBar from "@/components/shared-component/NavBar";
import SideBar from "@/components/shared-component/SideBar";
import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect('/signin')
  }

  return (
    <div className='min-h-screen bg-gray-50'>
        <SideBar />
        <div className="md:ml-64 min-h-screen flex flex-col">
            <NavBar />
            <div className="flex-1 p-3 sm:p-4 md:p-6 pt-16 md:pt-4">
                {children}
            </div>
        </div>
    </div>
  )
}
