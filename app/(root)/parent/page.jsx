'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaPlus, FaUser, FaEnvelope, FaPhone, FaBriefcase, FaTrash, FaEdit, FaHome, FaImage } from 'react-icons/fa'
import Image from 'next/image'

const ParentPage = () => {
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchParents() {
      try {
        const res = await fetch('/api/parent')
        const data = await res.json()
        if (data.success) {
          setParents(data.parents)
        }
      } catch (error) {
        console.error('Error fetching parents:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchParents()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this parent?')) return
    
    try {
      const res = await fetch('/api/parent/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const data = await res.json()
      if (data.success) {
        setParents(parents.filter(p => p._id !== id))
      } else {
        alert(data.message || 'Failed to delete parent')
      }
    } catch (error) {
      console.error('Error deleting parent:', error)
      alert('Failed to delete parent')
    }
  }

  if (loading) {
    return (
      <div className="w-full px-6 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-3 md:px-6 py-4 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <FaUser className="text-white text-lg md:text-xl" />
          </div>
          <span className="hidden md:inline">Parent Management</span>
          <span className="md:hidden">Parents</span>
        </h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">Manage parent/guardian information</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FaUser className="text-blue-600" />
            All Parents
          </h2>
          <Link 
            href="/parent/add-parent" 
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
          >
            <FaPlus className="text-sm" />
            <span className="hidden md:inline">Add Parent</span>
            <span className="md:hidden">Add</span>
          </Link>
        </div>

        {parents && parents.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Photo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Profession</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parents.map((parent) => (
                    <tr key={parent._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {parent.photo ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500">
                            <Image 
                              src={parent.photo} 
                              alt={parent.Name} 
                              width={40} 
                              height={40} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            {parent.Name?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{parent.Name}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{parent.Email || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{parent.Phone || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{parent.Profession || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/parent/${parent._id}`}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <FaEdit className="text-sm" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(parent._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {parents.map((parent) => (
                <div key={parent._id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {parent.photo ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500">
                        <Image 
                          src={parent.photo} 
                          alt={parent.Name} 
                          width={48} 
                          height={48} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                        {parent.Name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{parent.Name}</p>
                      <p className="text-sm text-gray-500">{parent.Email || 'No email'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium">{parent.Phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Profession</p>
                      <p className="font-medium">{parent.Profession || '-'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link 
                      href={`/parent/${parent._id}`}
                      className="flex-1 flex items-center justify-center gap-2 p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <FaEdit className="text-sm" />
                      <span className="text-sm">Edit</span>
                    </Link>
                    <button 
                      onClick={() => handleDelete(parent._id)}
                      className="flex-1 flex items-center justify-center gap-2 p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <FaTrash className="text-sm" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 md:py-12">
            <FaUser className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Parents Found</h3>
            <p className="text-gray-500 mb-4 text-sm md:text-base">Add parents to link with students</p>
            <Link 
              href="/parent/add-parent" 
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaPlus className="text-sm" />
              Add Parent
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ParentPage
