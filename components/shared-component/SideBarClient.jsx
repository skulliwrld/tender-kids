'use client'

import React from 'react'
import { useSession, signOut } from 'next-auth/react'
import { FaSchool, FaSignOutAlt } from "react-icons/fa";
import NavLinks from './NavLinks'

export default function SideBarClient() {
    const { data: session, status } = useSession()
    const role = session?.user?.role
    const pathname = '/' // We don't need actual pathname in client anymore
    
    const [isMobileOpen, setIsMobileOpen] = React.useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState({})
    const touchStartRef = React.useRef(null)

    React.useEffect(() => {
        const handleSidebarOpen = (e) => {
            setIsMobileOpen(e.detail)
        }
        window.addEventListener('sidebar-open', handleSidebarOpen)

        const handleSidebarState = (e) => {
            setIsMobileOpen(e.detail)
        }
        window.addEventListener('sidebar_state', handleSidebarState)

        const handleTouchStart = (e) => {
            const touchX = e.touches[0].clientX
            if (touchX < 80) {
                touchStartRef.current = touchX
            }
        }

        const handleTouchMove = (e) => {
            if (touchStartRef.current === null) return
            const currentX = e.touches[0].clientX
            const diff = touchStartRef.current - currentX
            if (diff < -60) {
                setIsMobileOpen(true)
            }
            if (diff > 60) {
                setIsMobileOpen(false)
            }
        }

        const handleTouchEnd = () => {
            touchStartRef.current = null
        }

        document.addEventListener('touchstart', handleTouchStart, { passive: true })
        document.addEventListener('touchmove', handleTouchMove, { passive: true })
        document.addEventListener('touchend', handleTouchEnd, { passive: true })

        return () => {
            window.removeEventListener('sidebar-open', handleSidebarOpen)
            window.removeEventListener('sidebar_state', handleSidebarState)
            document.removeEventListener('touchstart', handleTouchStart)
            document.removeEventListener('touchmove', handleTouchMove)
            document.removeEventListener('touchend', handleTouchEnd)
        }
    }, [])
    
    const [expandedMenus, setExpandedMenus] = React.useState({
      class: false,
      student: false,
      teacher: false,
      subject: false,
      routine: false,
      exam: false,
      parent: false,
      section: false,
      fees: false
    });
  
    const toggleMenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    }

    const toggleMobileMenu = (menu) => {
        setMobileMenuOpen(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    }

    const handleSignOut = () => {
        signOut({ callbackUrl: '/signin' })
    }

    if (status === 'loading' || !role) {
        return (
            <div className="fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-purple-600 via-purple-700 to-indigo-800 shadow-2xl">
                <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Mobile Overlay */}
            <div 
                className={`fixed inset-0 bg-black/50 z-30 block md:hidden ${isMobileOpen ? 'block' : 'hidden'}`}
                onClick={() => setIsMobileOpen(false)}
            />

            {/* Sidebar */}
            <div className={`h-full flex flex-col bg-gradient-to-b from-purple-600 via-purple-700 to-indigo-800 shadow-2xl transition-transform duration-300 ${
                isMobileOpen ? 'translate-x-0 fixed inset-0 z-50 w-72' : 'fixed inset-y-0 left-0 z-40 w-64 -translate-x-full md:translate-x-0'
            }`}>
                {/* Close button for mobile */}
                <button 
                    onClick={() => setIsMobileOpen(false)}
                    className="absolute top-4 right-4 p-2 text-white/80 hover:text-white block md:hidden"
                >
                    <span className="text-white">✕</span>
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 pb-6 border-b border-white/20 mb-4 px-4 pt-16 lg:pt-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center shadow-lg">
                        <FaSchool className="text-white text-lg" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg leading-tight">School</h1>
                        <p className="text-purple-200 text-xs">Management System</p>
                    </div>
                </div>

                {/* Navigation - Using NavLinks server component */}
                <NavLinks 
                    role={role}
                    expandedMenus={expandedMenus}
                    toggleMenu={toggleMenu}
                    mobileMenuOpen={mobileMenuOpen}
                    toggleMobileMenu={toggleMobileMenu}
                />

                {/* User Section */}
                {role && session && (
                    <div className="p-4 border-t border-white/20 mt-auto">
                        <div className="bg-white/10 rounded-xl p-3 mb-3">
                            <p className="text-white text-sm font-medium truncate">{session.user?.name}</p>
                            <p className="text-purple-200 text-xs truncate">{session.user?.email}</p>
                            <p className="text-purple-200 text-xs capitalize mt-1">{session.user?.role}</p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-center gap-2 bg-red-500/20 text-red-200 py-2 px-4 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                        >
                            <FaSignOutAlt className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}
