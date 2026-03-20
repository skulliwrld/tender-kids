'use client'

import { useState, useEffect } from 'react'
import { FaUser, FaEnvelope, FaPhone, FaBriefcase, FaHome, FaTimes, FaLock, FaEye, FaEyeSlash, FaImage } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { addParent } from '@/lib/actions/parent.action'
import { updateParent, updateParentPassword } from '@/lib/actions/parent.action'

function ParentForm({ parent = null }) {
  const router = useRouter()
  const isEditMode = !!parent
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [preview, setPreview] = useState(parent?.photo || null)

  useEffect(() => {
    if (parent?.photo) {
      setPreview(parent.photo)
    }
  }, [parent])

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      if (isEditMode) {
        formData.append('id', parent._id)
        await updateParent(formData)
        
        const newPassword = formData.get('Password')
        if (newPassword) {
          await updateParentPassword(parent.Email, newPassword)
        }
        router.push('/parent')
      } else {
        await addParent(formData)
      }
    } catch (err) {
      if (err?.digest?.includes('NEXT_REDIRECT')) {
        return
      }
      setError(isEditMode ? 'Failed to update parent. Please try again.' : 'Failed to add parent. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <FaUser className="text-xl md:text-2xl text-white" />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-white">{isEditMode ? 'Edit Parent' : 'Add Parent'}</h2>
                  <p className="text-blue-100 text-xs md:text-sm">{isEditMode ? 'Update parent/guardian information' : 'Add parent/guardian information'}</p>
                </div>
              </div>
              <button 
                onClick={() => router.push('/parent')}
                className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <FaTimes className="text-white" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-4 md:space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaImage className="text-gray-400" /> Photo</span>
              </label>
              <div className="flex gap-3 md:gap-4 items-center">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="text-black text-sm border rounded-md px-2 md:px-3 py-2" 
                />
                {preview && (
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-blue-500 overflow-hidden">
                    <Image src={preview} alt="Preview" width={64} height={64} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <input type="hidden" name="photo" value={preview || ''} />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaUser className="text-gray-400" /> Full Name</span>
              </label>
              <input 
                type="text" 
                name="Name" 
                required
                defaultValue={parent?.Name || ''}
                className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white text-sm md:text-base"
                placeholder="Enter parent name"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaEnvelope className="text-gray-400" /> Email</span>
              </label>
              <input 
                type="email" 
                name="Email" 
                defaultValue={parent?.Email || ''}
                className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white text-sm md:text-base"
                placeholder="Enter email address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center gap-2"><FaPhone className="text-gray-400" /> Phone</span>
                </label>
                <input 
                  type="tel" 
                  name="Phone" 
                  defaultValue={parent?.Phone || ''}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white text-sm md:text-base"
                  placeholder="Phone number"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center gap-2"><FaBriefcase className="text-gray-400" /> Profession</span>
                </label>
                <input 
                  type="text" 
                  name="Profession" 
                  defaultValue={parent?.Profession || ''}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white text-sm md:text-base"
                  placeholder="Job title"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><FaHome className="text-gray-400" /> Address</span>
              </label>
              <textarea 
                name="Address" 
                rows="2 md:3"
                defaultValue={parent?.Address || ''}
                className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white resize-none text-sm md:text-base"
                placeholder="Enter address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center gap-2"><FaLock className="text-gray-400" /> {isEditMode ? 'New Password' : 'Password'}</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="Password" 
                    required={!isEditMode}
                    className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white pr-10 md:pr-12 text-sm md:text-base"
                    placeholder={isEditMode ? "Leave blank to keep current" : "Create password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center gap-2"><FaLock className="text-gray-400" /> Confirm Password</span>
                </label>
                <input 
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword" 
                  required={!isEditMode}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white text-sm md:text-base"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <div className="flex gap-3 md:gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.push('/parent')}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 md:py-3.5 px-4 md:px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 md:py-3.5 px-4 md:px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update Parent' : 'Save Parent'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ParentForm
