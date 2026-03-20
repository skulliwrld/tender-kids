'use client';

import React, { useState } from 'react';
import { IoAddCircleOutline, IoPersonAdd } from "react-icons/io5"; 
import { FaChalkboardTeacher, FaTimes, FaUser, FaBirthdayCake, FaVenusMars, FaMapMarkerAlt, FaPhone, FaEnvelope, FaLock, FaCamera } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const TeacherForm = ({type, handleFuction, content}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isEdit = type === "edit";
  const [photoPreview, setPhotoPreview] = useState(content?.photo || null);

  if (!content) {
    return <div>Loading or teacher not found</div>;
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append('id', content._id);
    formData.append('photo', photoPreview || content?.photo || '');

    try {
      const result = await handleFuction(formData);
      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else {
        router.push('/teacher');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <IoPersonAdd className="text-xl md:text-2xl text-white" />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-white">{isEdit ? 'Edit Teacher' : 'Add Teacher'}</h2>
                  <p className="text-purple-100 text-xs md:text-sm">{isEdit ? 'Update teacher information' : 'Add a new teacher'}</p>
                </div>
              </div>
              <button 
                onClick={() => router.back()}
                className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <FaTimes className="text-white text-sm md:text-base" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-8 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-4 md:space-y-5">
            <input type="hidden" name="id" value={content._id} />
            <input type="hidden" name="photo" value={photoPreview || content?.photo || ''} />

            <div className="flex justify-center mb-3 md:mb-4">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : content.photo ? (
                    <img src={content.photo} alt={content.name} className="w-full h-full object-cover" />
                  ) : (
                    <FaCamera className="text-gray-400 text-xl md:text-2xl" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-7 h-7 md:w-8 md:h-8 bg-purple-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-purple-700 transition-colors">
                  <FaCamera className="text-xs md:text-sm" />
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 md:gap-3">
              <div className="col-span-1 space-y-2">
                <label className="block text-xs md:text-sm font-semibold text-gray-700">Title</label>
                <select 
                  name="title" 
                  defaultValue={content.title || ''}
                  className="w-full px-2 md:px-3 py-2.5 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white text-sm"
                >
                  <option value="">Select</option>
                  <option value="Mr">Mr.</option>
                  <option value="Mrs">Mrs.</option>
                  <option value="Miss">Miss</option>
                </select>
              </div>
              <div className="col-span-3 space-y-2">
                <label className="block text-xs md:text-sm font-semibold text-gray-700">
                  <span className="flex items-center gap-1 md:gap-2"><FaUser className="text-gray-400" /> Full Name</span>
                </label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={content.name}
                  required
                  className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white text-sm md:text-base"
                  placeholder="Teacher's name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-1 md:gap-2"><FaBirthdayCake className="text-gray-400" /> Date of Birth</span>
              </label>
              <input 
                type="date" 
                name="DOB" 
                defaultValue={content.DOB}
                required
                className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white text-sm md:text-base"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-1 md:gap-2"><FaVenusMars className="text-gray-400" /> Gender</span>
              </label>
              <select 
                name="gender" 
                defaultValue={content.gender}
                className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white text-sm md:text-base"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-1 md:gap-2"><FaMapMarkerAlt className="text-gray-400" /> Address</span>
              </label>
              <input 
                type="text" 
                name="address" 
                defaultValue={content.address}
                required
                className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white text-sm md:text-base"
                placeholder="Enter address"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-1 md:gap-2"><FaPhone className="text-gray-400" /> Phone</span>
              </label>
              <input 
                type="tel" 
                name="phone" 
                defaultValue={content.phone}
                required
                className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white text-sm md:text-base"
                placeholder="Phone number"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-1 md:gap-2"><FaEnvelope className="text-gray-400" /> Email</span>
              </label>
              <input 
                type="email" 
                name="email" 
                defaultValue={content.email}
                required
                className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white text-sm md:text-base"
                placeholder="Email address"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-1 md:gap-2"><FaLock className="text-gray-400" /> Password</span>
              </label>
              <input 
                type="password" 
                name="password" 
                className="w-full px-3 md:px-4 py-2.5 md:py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-gray-50 hover:bg-white text-sm md:text-base"
                placeholder={isEdit ? "Leave blank to keep current" : "Enter password"}
              />
            </div>

            <div className="flex gap-3 md:gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 md:py-3.5 px-4 md:px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 md:py-3.5 px-4 md:px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {isSubmitting ? 'Submitting...' : (isEdit ? 'Update Teacher' : 'Add Teacher')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherForm;