'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaSearch, FaUser, FaEnvelope, FaPhone, FaBook, FaCalendar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

export default function ParentPortalPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [parentName, setParentName] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim() || !parentName.trim()) {
      setError('Please enter both student name and parent name')
      return
    }

    setLoading(true)
    setError('')
    setSearched(true)

    try {
      const response = await fetch(`/api/parent-portal/search?studentName=${encodeURIComponent(searchQuery)}&parentName=${encodeURIComponent(parentName)}`)
      const data = await response.json()
      
      if (data.success) {
        setResults(data.students)
      } else {
        setError(data.message || 'No students found')
        setResults([])
      }
    } catch (err) {
      setError('An error occurred while searching')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FaUser className="text-4xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Parent Portal</h1>
          <p className="text-gray-600 mt-2">Search for your child's information</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent/Guardian Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter the name you registered with</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Child's Name
              </label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter your child's name"
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searched && results.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Found {results.length} child(ren)
              </h2>
              <div className="space-y-4">
                {results.map((student) => (
                  <div
                    key={student._id}
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{student.Name}</h3>
                        <p className="text-sm text-gray-600">Class: {student.Class?.name || 'Not Assigned'}</p>
                      </div>
                      <Link
                        href={`/parent-portal/${student._id}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searched && results.length === 0 && !loading && (
            <div className="mt-8 text-center py-8">
              <FaUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Results Found</h3>
              <p className="text-gray-500">
                No student found matching your criteria. Please check the names and try again.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            For assistance, please contact the school administration
          </p>
        </div>
      </div>
    </div>
  )
}
