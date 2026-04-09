'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { FaSchool, FaSignOutAlt } from "react-icons/fa";
import NavLinks from './NavLinks'

export default function SideBarClient({ isOpen = false, onClose }) {
    const router = useRouter()
    const { data: session, status } = useSession()
    const role = session?.user?.role
    
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState({})
    const [expandedMenus, setExpandedMenus] = React.useState({})

    const handleSchoolHeaderClick = () => {
      const dashboardRoutes = {
        admin: '/dashboard',
        teacher: '/dashboard',
        student: '/dashboard',
        parent: '/dashboard'
      }
      if (role) {
        router.push(dashboardRoutes[role] || '/dashboard')
      }
    }

    React.useEffect(() => {
        const handleSidebarOpen = (e) => {
            // External event handling - only if not using props
        }
        window.addEventListener('sidebar-open', handleSidebarOpen)

        return () => {
            window.removeEventListener('sidebar-open', handleSidebarOpen)
        }
    }, [])

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
                className={`fixed inset-0 bg-black/50 z-30 block md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sidebar - fixed on all screens, but slides on mobile */}
            <div className={`h-full flex flex-col bg-gradient-to-b from-purple-600 via-purple-700 to-indigo-800 shadow-2xl transition-transform duration-300 ease-out ${
                isOpen ? 'translate-x-0 fixed inset-0 z-50 w-72' : '-translate-x-full fixed inset-y-0 left-0 z-40 w-64 md:translate-x-0'
            }`}>
                {/* Close button for mobile */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-white/80 hover:text-white block md:hidden"
                >
                    <span className="text-white text-xl">✕</span>
                </button>

                {/* Header - Clickable */}
                <button
                  onClick={handleSchoolHeaderClick}
                  className="flex items-center gap-3 pb-6 border-b border-white/20 mb-4 px-4 pt-16 lg:pt-6 hover:opacity-80 transition-opacity w-full"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center shadow-lg">
                        <FaSchool className="text-white text-lg" />
                    </div>
                    <div className="text-left">
                        <h1 className="text-white font-bold text-lg leading-tight">School</h1>
                        <p className="text-purple-200 text-xs">Management System</p>
                    </div>
                </button>

                {/* Navigation - Using NavLinks server component */}
                <NavLinks 
                    role={role}
                    expandedMenus={expandedMenus}
                    toggleMenu={(menu) => setExpandedMenus(prev => ({...prev, [menu]: !prev[menu]}))}
                    mobileMenuOpen={mobileMenuOpen}
                    toggleMobileMenu={(menu) => setMobileMenuOpen(prev => ({...prev, [menu]: !prev[menu]}))}
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
                            onClick={() => signOut({ callbackUrl: '/signin' })}
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
