'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGraduationCap } from 'react-icons/fa'

function SigninForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
        if (errorParam === 'CredentialsSignin') {
        setError('Invalid email, name, or password')
      } else {
        setError('An error occurred. Please try again.')
      }
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    console.log('Signing in with:', email)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    console.log('Sign result:', result)

    if (result?.error) {
      setError('Invalid email, name, or password')
      setIsLoading(false)
    } else {
      const session = await getSession()
      if (session) {
        router.push('/dashboard')
      } else {
        setError('Unable to get session. Please try again.')
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-6 lg:px-12 text-white">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full flex items-center justify-center mb-6 sm:mb-8 backdrop-blur-sm">
            <FaGraduationCap className="text-4xl sm:text-6xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-2 sm:mb-4">Tender Kids</h1>
          <p className="text-lg sm:text-xl text-center text-purple-100">Nursery And Basic School</p>
          <p className="mt-6 sm:mt-8 text-center text-purple-100/80 max-w-md text-sm sm:text-base">
            Empowering young minds with quality education and nurturing care
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FaGraduationCap className="text-2xl sm:text-3xl text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Tender Kids</h1>
            <p className="text-gray-600 text-sm sm:text-base">Nursery And Basic School</p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-6 lg:p-8 border border-gray-100">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome Back</h2>
              <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email or Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400 text-sm sm:text-base" />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                    placeholder="Enter your email or name"
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
                    placeholder="Enter your password"
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

              {error && (
                <div className="bg-red-50 text-red-600 p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-gray-600 text-sm sm:text-base">
                Don't have an account?{' '}
                <a href="/signup" className="text-purple-600 font-semibold hover:text-purple-700">
                  Create Account
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SigninPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SigninForm />
    </Suspense>
  )
}
