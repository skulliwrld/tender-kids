'use client'

import { useState, useEffect } from 'react'
import { IoAddCircleOutline, IoSchoolOutline } from "react-icons/io5" 
import { FaUser, FaEnvelope, FaPhone, FaHome, FaBook } from 'react-icons/fa'
import Image from 'next/image'

function StudentForm({ handleAdd, classes, sections, parents, studentData, type = 'add' }) {
  const [preview, setPreview] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (studentData?.photo) {
      setPreview(studentData.photo)
    }
  }, [studentData])

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsPending(true)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await handleAdd(formData)
      if (result?.error) {
        setError(result.error)
        setIsPending(false)
      }
    } catch (err) {
      if (err?.digest?.includes('NEXT_REDIRECT')) {
        return
      }
      setError('An unexpected error occurred: ' + err.message)
      setIsPending(false)
    }
  }

  const classId = studentData?.Class?.toString() || studentData?.Class

  return (
    <section>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <form className="flex flex-col px-4 md:px-20 border bg-white rounded-xl shadow-lg" onSubmit={handleSubmit}>
        {studentData?._id && <input type="hidden" name="id" value={studentData._id} />}
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <IoSchoolOutline size={20} />
            <span className="text-sm">School Management System</span>
          </div>
        </div>
        
        <span className="flex items-center gap-2 my-2 border py-2 px-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg">
          <IoAddCircleOutline size={20} />
          {type === 'edit' ? 'Edit Student' : 'Add Student'}
        </span>
        
        <div className="border rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <span className="flex flex-col border px-3 py-3 rounded-md">
              <label className="text-sm font-medium text-gray-600 mb-1">Name</label>
              <input 
                type="text" 
                name="Name" 
                defaultValue={studentData?.Name || ''}
                className="bg-primary text-black border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" 
                required 
              />
            </span>

            <span className="flex flex-col border px-3 py-3 rounded-md">
              <label className="text-sm font-medium text-gray-600 mb-1">Class</label>
              <select 
                name="Class" 
                defaultValue={classId || ''}
                className="bg-primary text-black border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select class</option>
                {classes?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <span className="flex flex-col border px-3 py-3 rounded-md">
              <label className="text-sm font-medium text-gray-600 mb-1">Parent/Guardian</label>
              <select 
                name="Parent" 
                defaultValue={studentData?.Parent?._id || studentData?.Parent || ''}
                className="bg-primary text-black border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select parent</option>
                {parents?.map(p => <option key={p._id} value={p._id}>{p.Name}</option>)}
              </select>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <span className="flex flex-col border px-3 py-3 rounded-md">
              <label className="text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
              <input 
                type="date" 
                name="DOB" 
                defaultValue={studentData?.DOB || ''}
                className="bg-primary text-black border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </span>

            <span className="flex flex-col border px-3 py-3 rounded-md">
              <label className="text-sm font-medium text-gray-600 mb-1">Gender</label>
              <select 
                name="Gender" 
                defaultValue={studentData?.Gender || ''}
                className="bg-primary text-black border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <span className="flex flex-col border px-3 py-3 rounded-md">
              <label className="text-sm font-medium text-gray-600 mb-1">Email</label>
              <input 
                type="email" 
                name="Email" 
                defaultValue={studentData?.Email || ''}
                className="bg-primary text-black border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </span>

            <span className="flex flex-col border px-3 py-3 rounded-md">
              <label className="text-sm font-medium text-gray-600 mb-1">Phone</label>
              <input 
                type="tel" 
                name="Phone" 
                defaultValue={studentData?.Phone || ''}
                className="bg-primary text-black border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <span className="flex flex-col border px-3 py-3 rounded-md">
              <label className="text-sm font-medium text-gray-600 mb-1">Address</label>
              <input 
                type="text" 
                name="Address" 
                defaultValue={studentData?.Address || ''}
                className="bg-primary text-black border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </span>

            <span className="flex flex-col border px-3 py-3 rounded-md">
              <label className="text-sm font-medium text-gray-600 mb-1">Password</label>
              <input 
                type="password" 
                name="Password" 
                defaultValue={studentData?.Password || ''}
                placeholder={type === 'edit' ? 'Leave blank to keep current' : ''}
                className="bg-primary text-black border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </span>
          </div>

          <span className="flex flex-col border px-3 py-3 rounded-md">
            <label className="text-sm font-medium text-gray-600 mb-1">
              <span className="flex items-center gap-2"><FaBook className="text-xs" /> Bio</span>
            </label>
            <textarea 
              name="Bio" 
              rows="3"
              defaultValue={studentData?.Bio || ''}
              className="bg-primary text-black border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" 
              placeholder="Student bio (optional)"
            />
          </span>

          <span className="flex flex-col border px-3 py-3 rounded-md">
            <label className="text-sm font-medium text-gray-600 mb-1">Photo</label>
            <div className="flex gap-4 items-center">
              <input 
                type="file" 
                accept="image/*"
                onChange={handlePhotoChange}
                className="text-black border rounded-md px-3 py-2" 
              />
              {preview && (
                <div className="w-20 h-20 rounded-full border-2 border-indigo-500 overflow-hidden">
                  <Image src={preview} alt="Preview" width={80} height={80} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <input type="hidden" name="photo" value={preview || ''} />
          </span>

          {type === 'edit' && (
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input 
                type="checkbox" 
                name="hasPaid" 
                defaultChecked={studentData?.hasPaid}
                className="w-4 h-4"
              />
              Has Paid
            </label>
          )}
        </div>

        <div className="w-full flex items-center justify-center pb-4 mt-4">
          <button 
            type="submit" 
            disabled={isPending}
            className={`w-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 py-3 rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPending ? 'Submitting...' : type === 'edit' ? 'Update Student' : 'Submit'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default StudentForm
