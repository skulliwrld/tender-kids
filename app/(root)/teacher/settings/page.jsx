'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { FaUser, FaEnvelope, FaPhone, FaBook, FaGraduationCap, FaSignOutAlt, FaCamera, FaSave } from 'react-icons/fa'

export default function TeacherSettingsPage() {
  const { data: session, update } = useSession()
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    qualification: '',
    experience: ''
  })

  useEffect(() => {
    if (session?.user?.email) {
      fetchTeacherData()
    }
  }, [session])

  const fetchTeacherData = async () => {
    try {
      const response = await fetch(`/api/teacher?email=${session.user.email}`)
      const data = await response.json()
      if (data.success) {
        setTeacher(data.teacher)
        setFormData({
          name: data.teacher?.name || '',
          email: data.teacher?.email || '',
          phone: data.teacher?.phone || '',
          address: data.teacher?.address || '',
          qualification: data.teacher?.qualification || '',
          experience: data.teacher?.experience || ''
        })
      }
    } catch (error) {
      console.error('Error fetching teacher:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch('/api/teacher', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          ...formData
        })
      })
      const data = await response.json()
      if (data.success) {
        setSuccess(true)
        await update({ ...session.user, name: formData.name })
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/signin' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 text-sm md:text-base">Manage your profile and account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="w-full h-full rounded-full bg-purple-100 flex items-center justify-center">
                  <FaUser className="w-12 h-12 text-purple-600" />
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700">
                  <FaCamera className="w-3 h-3" />
                </button>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{session?.user?.name}</h2>
              <p className="text-sm text-gray-500">{session?.user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm capitalize">
                {session?.user?.role}
              </span>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-600">
                  <FaBook className="w-4 h-4 text-purple-600" />
                  <span>{teacher?.subjects?.map(s => s.Name).join(', ') || 'No subjects assigned'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <FaGraduationCap className="w-4 h-4 text-purple-600" />
                  <span>{formData.qualification || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <FaPhone className="w-4 h-4 text-purple-600" />
                  <span>{formData.phone || 'Not set'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-3 rounded-xl hover:bg-red-600 transition-colors"
            >
              <FaSignOutAlt /> Sign Out
            </button>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                    <div className="relative">
                      <FaGraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., B.Sc, M.Ed"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Your address"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaSave />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {success && (
                    <span className="text-green-600 text-sm">Profile updated successfully!</span>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
