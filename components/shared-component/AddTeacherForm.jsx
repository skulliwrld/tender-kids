'use client'

import React, { useState } from 'react'
import { IoPersonAdd } from "react-icons/io5" 
import { FaUser, FaBirthdayCake, FaVenusMars, FaMapMarkerAlt, FaPhone, FaEnvelope, FaLock, FaTimes, FaCamera } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { addTeacher } from '@/lib/actions/teacher.actions'

function AddTeacherForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [error, setError] = useState('')

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    formData.append('photo', photoPreview || '')
    
    try {
      const result = await addTeacher(formData)
      if (result?.error) {
        setError(result.error)
        setIsSubmitting(false)
      } else {
        router.push('/teacher')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <IoPersonAdd className="text-2xl text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Add New Teacher</h2>
                  <p className="text-purple-100 text-sm">Add a new teacher to your school</p>
                </div>
              </div>
              <button 
                onClick={() => router.push('/teacher')}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <FaTimes className="text-white" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-8 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <input type="hidden" name="photo" value={photoPreview || ''} />
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <FaCamera className="text-gray-400 text-2xl" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-purple-700 transition-colors">
                  <FaCamera className="text-sm" />
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Title</label>
                <select 
                  name="title" 
                  className="w-full px-3 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
                >
                  <option value="">Select</option>
                  <option value="Mr">Mr.</option>
                  <option value="Mrs">Mrs.</option>
                  <option value="Miss">Miss</option>
                </select>
              </div>
              <div className="col-span-3 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center gap-2"><FaUser className="text-gray-400" /> Full Name</span>
                </label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
                  placeholder="Enter teacher's full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaBirthdayCake className="text-gray-400" /> Date of Birth</span>
              </label>
              <input 
                type="date" 
                name="DOB" 
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaVenusMars className="text-gray-400" /> Gender</span>
              </label>
              <select 
                name="gender" 
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaMapMarkerAlt className="text-gray-400" /> Address</span>
              </label>
              <input 
                type="text" 
                name="address" 
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
                placeholder="Enter address"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaPhone className="text-gray-400" /> Phone</span>
              </label>
              <input 
                type="tel" 
                name="phone" 
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaEnvelope className="text-gray-400" /> Email</span>
              </label>
              <input 
                type="email" 
                name="email" 
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaLock className="text-gray-400" /> Password</span>
              </label>
              <input 
                type="password" 
                name="password" 
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white"
                placeholder="Enter password"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.push('/teacher')}
                className="flex-1 bg-gray-100 text-gray-700 py-3.5 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Teacher'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddTeacherForm