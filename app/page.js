'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">School Management System</h1>
          <p className="text-xl text-purple-100">Manage your school efficiently with our comprehensive platform</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/signin" className="bg-white text-purple-600 rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <h2 className="text-2xl font-bold mb-2">Sign In</h2>
            <p className="text-gray-600">Access your account</p>
          </Link>
          
          <Link href="/signup" className="bg-white/10 text-white border-2 border-white/30 rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
            <h2 className="text-2xl font-bold mb-2">Create Account</h2>
            <p className="text-purple-100">Register as Admin, Teacher, or Student</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
