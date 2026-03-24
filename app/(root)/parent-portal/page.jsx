'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { FaUser, FaUserGraduate, FaSignOutAlt, FaEye, FaMoneyBillWave } from 'react-icons/fa'

export default function ParentPortalPage() {
  const { data: session, status } = useSession()
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetchChildren()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, session])

  const fetchChildren = async () => {
    try {
      const response = await fetch(`/api/parent-portal/children?email=${encodeURIComponent(session.user.email)}`)
      const data = await response.json()
      
      if (data.success) {
        setChildren(data.children)
      } else {
        setError(data.message || 'No children found')
      }
    } catch (err) {
      setError('An error occurred while fetching your children')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSignOutAlt className="text-4xl text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">Please sign in to access the parent portal.</p>
            <Link
              href="/signin"
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
            <FaUser className="text-3xl sm:text-4xl text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Parent Portal</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Welcome, {session?.user?.name || 'Parent'}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">My Children</h2>

          {loading && (
            <div className="text-center py-6 sm:py-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base">Loading your children...</p>
            </div>
          )}

          {error && (
            <div className="p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-4 sm:mb-6">
              <p className="font-semibold text-sm sm:text-base">{error}</p>
              <p className="text-xs sm:text-sm mt-1 sm:mt-2">Make sure you are logged in with the email registered as a parent in the school system.</p>
            </div>
          )}

          {!loading && !error && children.length === 0 && (
            <div className="text-center py-6 sm:py-8">
              <FaUserGraduate className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">No Children Found</h3>
              <p className="text-gray-500 text-sm sm:text-base">
                No children are registered under your account. Please contact the school administration.
              </p>
            </div>
          )}

          {!loading && !error && children.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              {children.map((child) => (
                <div
                  key={child._id}
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-indigo-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <FaUserGraduate className="text-xl sm:text-2xl text-white" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">{child.Name}</h3>
                        <p className="text-sm text-gray-600">Class: {child.Class?.name || 'Not Assigned'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/fees/parent?child=${child._id}`}
                        className="flex items-center gap-1 sm:gap-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm"
                      >
                        <FaMoneyBillWave className="text-xs sm:text-sm" />
                        View Fees
                      </Link>
                      <Link
                        href={`/parent-portal/${child._id}`}
                        className="flex items-center gap-1 sm:gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm"
                      >
                        <FaEye className="text-xs sm:text-sm" />
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 sm:mt-6 text-center">
          <button
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-xs sm:text-sm"
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
