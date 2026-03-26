'use client'

import React from 'react'

export default function MobileMenuToggle({ 
  isOpen, 
  onToggle, 
  onClose,
  children 
}) {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-30 block md:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`sidebar h-full flex flex-col bg-gradient-to-b from-purple-600 via-purple-700 to-indigo-800 shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0 fixed inset-0 z-50 w-72' : 'fixed inset-y-0 left-0 z-40 w-64 -translate-x-full md:translate-x-0'
      }`}>
          {children}
      </div>
    </>
  )
}
