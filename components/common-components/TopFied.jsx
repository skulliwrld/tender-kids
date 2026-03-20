"use client"

import React, { Suspense } from 'react'
import { FaPlus, FaSearch } from "react-icons/fa"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'



function TopFiedInner({title, path}) {
  const searchParams = useSearchParams()
  const {replace} = useRouter()
  const pathName= usePathname()
 
  const handleSearch = useDebouncedCallback((e) =>{
    
  const params = new URLSearchParams(searchParams)
    params.set("page",e.target.value)
  if(e.target.value){
    e.target.value.length > 2 && params.set("q", e.target.value)
  }else{
    params.delete("q")
  }
  replace(`${pathName}?${params}`)
  })
  return (
    <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Manage {title}</h2>
                <p className="text-gray-500 text-sm mt-1">View, edit and manage {title.toLowerCase()}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input 
                        type="text" 
                        placeholder={`Search ${title}...`} 
                        onChange={handleSearch}
                        className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all w-full sm:w-64 bg-white"
                    />
                </div>

                {path && (
                    <Link href={path}>
                        <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                            <FaPlus />
                            Add New {title}
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    </section>
  )
}

function TopFied({title, path}) {
  return (
    <Suspense fallback={<section className="mb-8"><div className="h-20"></div></section>}>
      <TopFiedInner title={title} path={path} />
    </Suspense>
  )
}

export default TopFied