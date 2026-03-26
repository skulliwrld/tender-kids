'use client'

import React, { useState, useEffect } from 'react'
import { FaBars, FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa"

function NavBar({ onMenuToggle }) {
  const schoolName = "Tender Kids Nursery and Basic School"
  const schoolMotto = "Nurturing Future Leaders"
  
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Set scrolled state for shadow
      if (currentScrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
      
      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold
        setIsVisible(false)
      } else {
        // Scrolling up
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])
  
  return (
    <>
      {/* Mobile Header - Compact Version */}
      <div className={`
        md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 transition-transform duration-300 shadow-lg
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
      `}>
        <div className="px-3 py-2">
          {/* Top Row: Hamburger + Logo + School Name */}
          <div className="flex items-center gap-2">
            {/* Hamburger Menu Button */}
            <button
              onClick={onMenuToggle}
              className="p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              aria-label="Open menu"
            >
              <FaBars className="w-5 h-5" />
            </button>
            
            {/* Logo */}
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
              </svg>
            </div>
            
            {/* School Name */}
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-white text-sm leading-tight truncate">{schoolName}</h1>
            </div>
          </div>
          
          {/* Bottom Row: Contact Info - Compact */}
          <div className="flex items-center gap-3 mt-1.5 ml-10 text-white/90 text-xs">
            {/* Location */}
            <div className="flex items-center gap-1">
              <FaMapMarkerAlt className="w-3 h-3" />
              <span className="whitespace-nowrap">123 Education Street</span>
            </div>
            
            {/* Email */}
            <div className="flex items-center gap-1">
              <FaEnvelope className="w-3 h-3" />
              <span className="whitespace-nowrap">info@tenderkids.edu</span>
            </div>
            
            {/* Phone */}
            <div className="flex items-center gap-1">
              <FaPhone className="w-3 h-3" />
              <span className="whitespace-nowrap">+2348157382509</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop School Header Banner */}
      <div className={`
        hidden md:block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-3 sm:px-4 md:px-6 py-3 sm:py-4 shadow-lg transition-all duration-300
        ${isScrolled ? 'shadow-xl' : ''}
      `}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          {/* Left Side - Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
              </svg>
            </div>
            <div>
              <h1 className="font-extrabold text-lg sm:text-xl md:text-2xl tracking-tight leading-tight">{schoolName}</h1>
              <p className="font-semibold text-blue-100 text-xs sm:text-sm">{schoolMotto}</p>
            </div>
          </div>
          
          {/* Right Side - Contact Info - Always visible */}
          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm">
            {/* Location */}
            <div className="flex items-center gap-1.5 sm:gap-2 font-semibold">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="whitespace-nowrap">1 babameta line otta ikosi </span>
            </div>
            
            {/* Email */}
            <div className="flex items-center gap-1.5 sm:gap-2 font-semibold">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="whitespace-nowrap">info@tenderkids.edu</span>
            </div>
            
            {/* Phone */}
            <div className="flex items-center gap-1.5 sm:gap-2 font-semibold">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="whitespace-nowrap">+2348158770691</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default NavBar
