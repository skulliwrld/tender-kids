"use client"

import React, { Suspense, useState } from 'react'
import { FaPlus, FaSearch, FaLayerGroup, FaTimes, FaUsers, FaChalkboardTeacher } from "react-icons/fa"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

function TopFiedInner({title, path, searchType = 'subject'}) {
  const searchParams = useSearchParams()
  const {replace} = useRouter()
  const pathName= usePathname()
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.length > 2) {
      setIsSearching(true)
      
      let apiUrl = `/api/search/${searchType}?q=${encodeURIComponent(query)}`
      
      fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
          if (data.results && data.results.length > 0) {
            setSearchResults(data.results)
            setShowResults(true)
          } else {
            setSearchResults([])
          }
        })
        .catch(err => console.error('Search error:', err))
        .finally(() => setIsSearching(false))
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }

  const closeDialog = () => {
    setShowResults(false)
    setSearchResults([])
    setSearchQuery('')
  }

  const getColorClass = (index) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-emerald-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-blue-500',
      'from-rose-500 to-pink-500',
      'from-violet-500 to-purple-500',
      'from-teal-500 to-green-500',
    ]
    return colors[index % colors.length]
  }

  const renderResults = () => {
    return searchResults.map((item, index) => {
      if (searchType === 'subject') {
        return (
          <div key={item._id} className={`bg-gradient-to-r ${getColorClass(index)} rounded-xl p-4 text-white`}>
            <h3 className="font-bold text-lg">{item.Name}</h3>
            {item.description && (
              <p className="text-white/80 text-sm mt-1 line-clamp-2">{item.description}</p>
            )}
            
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs font-semibold text-white/90 flex items-center gap-1 mb-2">
                <FaLayerGroup className="text-xs" />
                Assigned to Classes ({item.classes?.length || 0})
              </p>
              <div className="flex flex-wrap gap-2">
                {item.classes && item.classes.length > 0 ? (
                  item.classes.map((cls, idx) => (
                    <Link
                      key={cls._id || idx}
                      href={`/subject/${cls._id}`}
                      onClick={closeDialog}
                      className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition-colors"
                    >
                      {cls.name || cls}
                    </Link>
                  ))
                ) : (
                  <span className="text-white/60 text-sm">Not assigned to any class</span>
                )}
              </div>
            </div>
          </div>
        )
      }
      
      if (searchType === 'class') {
        return (
          <div key={item._id} className={`bg-gradient-to-r ${getColorClass(index)} rounded-xl p-4 text-white`}>
            <h3 className="font-bold text-lg">{item.name}</h3>
            {item.numericId && (
              <p className="text-white/80 text-sm">Class ID: {item.numericId}</p>
            )}
            
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs font-semibold text-white/90 flex items-center gap-1 mb-2">
                <FaUsers className="text-xs" />
                Class Details
              </p>
              <Link
                href={`/subject/${item._id}`}
                onClick={closeDialog}
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition-colors inline-block"
              >
                View Subjects
              </Link>
            </div>
          </div>
        )
      }
      
      if (searchType === 'teacher') {
        return (
          <div key={item._id} className={`bg-gradient-to-r ${getColorClass(index)} rounded-xl p-4 text-white`}>
            <h3 className="font-bold text-lg">{item.name}</h3>
            {item.email && (
              <p className="text-white/80 text-sm">{item.email}</p>
            )}
            {item.phone && (
              <p className="text-white/80 text-sm">{item.phone}</p>
            )}
            
            <div className="mt-3 pt-3 border-t border-white/20">
              <Link
                href={`/teacher/${item._id}`}
                onClick={closeDialog}
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition-colors inline-block"
              >
                View Profile
              </Link>
            </div>
          </div>
        )
      }
      
      return null
    })
  }

  return (
    <section className="mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Manage {title}</h2>
                <p className="text-gray-500 text-sm mt-1">View, edit and manage {title.toLowerCase()}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {isSearching ? (
                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FaSearch className="text-gray-400" />
                      )}
                    </div>
                    <input 
                        type="text" 
                        placeholder={`Search ${title}...`} 
                        onChange={handleSearch}
                        className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all w-full bg-white text-sm"
                    />
                </div>

                {path && (
                    <Link href={path} className="w-full sm:w-auto">
                        <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 sm:px-5 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm w-full sm:w-auto justify-center">
                            <FaPlus />
                            <span className="hidden sm:inline">Add New {title}</span>
                            <span className="sm:hidden">Add {title}</span>
                        </Button>
                    </Link>
                )}
            </div>
        </div>

        {/* Search Results Overlay */}
        {showResults && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20" onClick={closeDialog}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[70vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl">
                <div className="flex items-center gap-2">
                  <FaSearch />
                  <span className="font-semibold">Search Results</span>
                </div>
                <button onClick={closeDialog} className="hover:bg-white/20 p-1 rounded">
                  <FaTimes />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[50vh] space-y-3">
                <p className="text-sm text-gray-500 mb-2">Found {searchResults.length} result(s)</p>
                {renderResults()}
              </div>
              <div className="p-4 border-t">
                <Button variant="outline" onClick={closeDialog} className="w-full">Close</Button>
              </div>
            </div>
          </div>
        )}
    </section>
  )
}

function TopFied({title, path, searchType}) {
  return (
    <Suspense fallback={<section className="mb-6 sm:mb-8"><div className="h-16 sm:h-20"></div></section>}>
      <TopFiedInner title={title} path={path} searchType={searchType} />
    </Suspense>
  )
}

export default TopFied