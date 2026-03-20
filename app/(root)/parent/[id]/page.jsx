'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import ParentForm from '@/components/common-components/ParentForm'

function ParentEditPage() {
  const params = useParams()
  const [parent, setParent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchParent() {
      try {
        const response = await fetch(`/api/parent/${params.id}`)
        const data = await response.json()
        if (data.success) {
          setParent(data.parent)
        }
      } catch (err) {
        setError('Failed to load parent')
      } finally {
        setLoading(false)
      }
    }
    if (params.id) {
      fetchParent()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!parent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Parent not found</h1>
          <Link href="/parent" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Parents
          </Link>
        </div>
      </div>
    )
  }

  return <ParentForm parent={parent} />
}

export default ParentEditPage
