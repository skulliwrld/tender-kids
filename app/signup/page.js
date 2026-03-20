'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGraduationCap, FaUserTie, FaChalkboardTeacher, FaUserGraduate, FaArrowLeft, FaUsers } from 'react-icons/fa'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAdminOption, setShowAdminOption] = useState(true)
  const [loadingAdmin, setLoadingAdmin] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAdminCount() {
      try {
        const res = await fetch('/api/auth/admin-count')
        const data = await res.json()
        setShowAdminOption(data.canCreateAdmin)
      } catch (error) {
        console.error('Error checking admin count:', error)
      } finally {
        setLoadingAdmin(false)
      }
    }
    checkAdminCount()
  }, [])

  const handleRoleSelect = (selectedRole) => {
    setSelectedRole(selectedRole)
    setRole(selectedRole)
  }

  const handleBackToRoles = () => {
    setSelectedRole('')
    setRole('')
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!role) {
      setError('Please select a role')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, role }),
    })

    if (res.ok) {
      setSuccess('Account created successfully! Redirecting to sign in...')
      setTimeout(() => {
        router.push('/signin')
      }, 2000)
    } else {
      const data = await res.json()
      setError(data.message || 'Something went wrong')
      setIsLoading(false)
    }
  }

  const roles = [
    { value: 'student', label: 'Student', icon: FaUserGraduate, color: 'from-green-500 to-emerald-500' },
    { value: 'teacher', label: 'Teacher', icon: FaChalkboardTeacher, color: 'from-blue-500 to-indigo-500' },
    { value: 'parent', label: 'Parent', icon: FaUsers, color: 'from-orange-500 to-red-500' },
    ...(showAdminOption ? [{ value: 'admin', label: 'Admin', icon: FaUserTie, color: 'from-purple-500 to-pink-500' }] : []),
  ]

  const getRoleIcon = (roleValue) => {
    const found = roles.find(r => r.value === roleValue)
    return found ? found.icon : FaUser
  }

  const getRoleLabel = (roleValue) => {
    const found = roles.find(r => r.value === roleValue)
    return found ? found.label : ''
  }

  const getRoleColor = (roleValue) => {
    const found = roles.find(r => r.value === roleValue)
    return found ? found.color : 'from-gray-500 to-gray-600'
  }

  // Step 1: Role Selection
  if (!selectedRole && !loadingAdmin) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10 flex flex-col justify-center items-center w-full px-6 lg:px-12 text-white">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full flex items-center justify-center mb-6 sm:mb-8 backdrop-blur-sm">
              <FaGraduationCap className="text-4xl sm:text-6xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-2 sm:mb-4">Tender Kids</h1>
            <p className="text-lg sm:text-xl text-center text-purple-100">Nursery And Basic School</p>
            <p className="mt-6 sm:mt-8 text-center text-purple-100/80 max-w-md text-sm sm:text-base">
              Join our community of learners and start your educational journey with us
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FaGraduationCap className="text-2xl sm:text-3xl text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Tender Kids</h1>
              <p className="text-gray-600 text-sm sm:text-base">Nursery And Basic School</p>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-6 lg:p-8 border border-gray-100">
              <div className="text-center mb-5 sm:mb-6 lg:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Create Account</h2>
                <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">Select your role to get started</p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => handleRoleSelect(r.value)}
                    className={`w-full flex items-center p-4 sm:p-5 rounded-xl border-2 border-gray-100 hover:border-gray-300 transition-all group bg-gradient-to-r ${r.color} hover:shadow-lg transform hover:scale-[1.02]`}
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <r.icon className="text-2xl text-white" />
                    </div>
                    <div className="ml-4 text-left">
                      <h3 className="text-lg font-bold text-white">{r.label}</h3>
                      <p className="text-white/80 text-sm">Register as a {r.label.toLowerCase()}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-white/60 group-hover:text-white transition-colors">→</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-gray-600 text-sm sm:text-base">
                  Already have an account?{' '}
                  <a href="/signin" className="text-purple-600 font-semibold hover:text-purple-700">
                    Sign In
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (loadingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Step 2: Registration Form (after role is selected)
  const RoleIcon = getRoleIcon(selectedRole)
  const roleColor = getRoleColor(selectedRole)

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-6 lg:px-12 text-white">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full flex items-center justify-center mb-6 sm:mb-8 backdrop-blur-sm">
            <FaGraduationCap className="text-4xl sm:text-6xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-2 sm:mb-4">Tender Kids</h1>
          <p className="text-lg sm:text-xl text-center text-purple-100">Nursery And Basic School</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FaGraduationCap className="text-2xl sm:text-3xl text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Tender Kids</h1>
            <p className="text-gray-600 text-sm sm:text-base">Nursery And Basic School</p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-6 lg:p-8 border border-gray-100">
            {/* Back button */}
            <button
              onClick={handleBackToRoles}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <FaArrowLeft /> Back
            </button>

            {/* Selected Role Banner */}
            <div className={`bg-gradient-to-r ${roleColor} rounded-xl p-4 mb-6`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <RoleIcon className="text-xl text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-sm">Registering as</p>
                  <h3 className="text-white font-bold text-lg">{getRoleLabel(selectedRole)}</h3>
                </div>
              </div>
            </div>

            <div className="text-center mb-5 sm:mb-6 lg:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Create Account</h2>
              <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">Fill in your details</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400 text-sm sm:text-base" />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400 text-sm sm:text-base" />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400 text-sm sm:text-base" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash className="text-sm sm:text-base" /> : <FaEye className="text-sm sm:text-base" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400 text-sm sm:text-base" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm text-center">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 text-green-600 p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm text-center">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-gray-600 text-sm sm:text-base">
                Already have an account?{' '}
                <a href="/signin" className="text-purple-600 font-semibold hover:text-purple-700">
                  Sign In
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
