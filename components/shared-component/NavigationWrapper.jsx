'use client'

import { useState, useCallback } from 'react'
import NavBar from "@/components/shared-component/NavBar";
import SideBar from "@/components/shared-component/SideBar";

export default function NavigationWrapper({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const handleMenuToggle = useCallback(() => {
        setIsSidebarOpen(prev => !prev);
    }, []);
    
    const handleCloseSidebar = useCallback(() => {
        setIsSidebarOpen(false);
    }, []);
    
    return (
      <div className='min-h-screen bg-gray-50'>
          {/* Sidebar - fixed on desktop, overlay on mobile */}
          <SideBar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
          
          {/* Main content area */}
          <div className="md:ml-64 min-h-screen flex flex-col">
              {/* Navbar - fixed at top on mobile, static on desktop */}
              <NavBar onMenuToggle={handleMenuToggle} />
              
              {/* Page content */}
              <div className="flex-1 pt-16 md:pt-0">
                  <div className="p-3 sm:p-4 md:p-6">
                      {children}
                  </div>
              </div>
          </div>
      </div>
    )
}
