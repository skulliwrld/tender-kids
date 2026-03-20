"use client"
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { VscDashboard } from "react-icons/vsc";
import { FaSchool, FaChalkboardTeacher, FaUserGraduate, FaBookOpen, FaUsers, FaUser, FaSignOutAlt, FaCheckSquare, FaBars, FaTimes, FaChevronDown, FaChevronRight, FaCalendarAlt } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlineSubject, MdFamilyRestroom } from "react-icons/md";
import { PiExam } from "react-icons/pi";
import { GiRadarCrossSection } from "react-icons/gi";

const SideBar = () => {
    const { data: session } = useSession()
    const role = session?.user?.role
    const pathname = usePathname()
    const [isMobileOpen, setIsMobileOpen] = React.useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState({})
    
    const [expandedMenus, setExpandedMenus] = React.useState({
      class: false,
      student: false,
      teacher: false,
      subject: false,
      routine: false,
      exam: false,
      parent: false,
      section: false
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
  
    const isActive = (path) => {
        if (pathname === path) return true
        if (path === '/teacher' && pathname.startsWith('/teacher/')) return false
        if (path === '/dashboard' && pathname.startsWith('/dashboard/')) return false
        if (path === '/student' && pathname.startsWith('/student/')) return false
        return pathname.startsWith(path + '/')
    }

    const adminNavItems = [
        {
            title: "Dashboard",
            path: "/dashboard",
            icon: <VscDashboard />,
            hasDropdown: false
        },
        {
            title: "Class Management",
            path: "/class",
            icon: <FaSchool />,
            hasDropdown: true,
            key: "class",
            subItems: [
                { title: "All Classes", path: "/class" },
                { title: "Add Class", path: "/class/add-class" },
                { title: "Manage Section", path: "/class/manage-section" }
            ]
        },
        {
            title: "Student Management",
            path: "/student",
            icon: <FaUserGraduate />,
            hasDropdown: true,
            key: "student",
            subItems: [
                { title: "All Students", path: "/student" },
                { title: "Admit Student", path: "/student/add-student" },
                { title: "Manage Sections", path: "/student/section" }
            ]
        },
        {
            title: "Teachers",
            path: "/teacher",
            icon: <FaChalkboardTeacher />,
            hasDropdown: false
        },
        {
            title: "Parents",
            path: "/parent",
            icon: <FaUser />,
            hasDropdown: false
        },
        {
            title: "Subjects",
            path: "/subject",
            icon: <MdOutlineSubject />,
            hasDropdown: true,
            key: "subject",
            subItems: [
                { title: "All Subjects", path: "/subject" },
                { title: "Add Subject", path: "/subject/add-subject" },
                { title: "Assign to Classes", path: "/subject/assign" }
            ]
        },
        {
            title: "Timetable",
            path: "/timetable",
            icon: <MdFamilyRestroom />,
            hasDropdown: false
        },
        {
            title: "Class Routine",
            path: "/classroutine",
            icon: <FaCalendarAlt />,
            hasDropdown: false
        },
        {
            title: "Attendance",
            path: "/attendance",
            icon: <FaCheckSquare />,
            hasDropdown: false
        },
        {
            title: "Exams",
            path: "/exams",
            icon: <PiExam />,
            hasDropdown: false
        },
        {
            title: "Sections",
            path: "/section",
            icon: <GiRadarCrossSection />,
            hasDropdown: false
        }
    ];

    const teacherNavItems = [
        {
            title: "Dashboard",
            path: "/dashboard",
            icon: <VscDashboard />,
            hasDropdown: false
        },
        {
            title: "My Classes",
            path: "/teacher",
            icon: <FaSchool />,
            hasDropdown: false
        },
        {
            title: "Attendance",
            path: "/teacher/attendance",
            icon: <FaCheckSquare />,
            hasDropdown: true,
            key: "attendance",
            subItems: [
                { title: "Mark Attendance", path: "/teacher/attendance" },
                { title: "View Records", path: "/teacher/attendance/records" }
            ]
        },
        {
            title: "Grades",
            path: "/teacher/grades",
            icon: <PiExam />,
            hasDropdown: true,
            key: "grades",
            subItems: [
                { title: "Grade Calculator", path: "/teacher/grades" },
                { title: "Input Scores", path: "/teacher/grades/input" },
                { title: "View Grades", path: "/teacher/grades/view" }
            ]
        },
        {
            title: "Settings",
            path: "/teacher/settings",
            icon: <FaChalkboardTeacher />,
            hasDropdown: false
        }
    ];

    const studentNavItems = [
        {
            title: "Dashboard",
            path: "/dashboard",
            icon: <VscDashboard />,
            hasDropdown: false
        },
        {
            title: "My Results",
            path: "/student/result",
            icon: <FaBookOpen />,
            hasDropdown: false
        },
        {
            title: "My Grades",
            path: "/student/grade",
            icon: <FaBookOpen />,
            hasDropdown: false
        },
        {
            title: "My Attendance",
            path: "/student/attendance",
            icon: <FaCheckSquare />,
            hasDropdown: false
        },
        {
            title: "My Profile",
            path: "/student/profile",
            icon: <FaUserGraduate />,
            hasDropdown: false
        }
    ];

    const parentNavItems = [
        {
            title: "Dashboard",
            path: "/dashboard",
            icon: <VscDashboard />,
            hasDropdown: false
        },
        {
            title: "Parent Portal",
            path: "/parent-portal",
            icon: <FaUsers />,
            hasDropdown: false
        }
    ];

    const navItems = role === 'admin' ? adminNavItems : role === 'teacher' ? teacherNavItems : role === 'parent' ? parentNavItems : studentNavItems;

    const handleSignOut = () => {
        signOut({ callbackUrl: '/signin' })
    }

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button 
                onClick={() => setIsMobileOpen(true)}
                className="fixed top-4 left-4 z-50 p-2 bg-purple-600 text-white rounded-lg shadow-lg block md:hidden"
                aria-label="Open menu"
            >
                <FaBars className="w-5 h-5" />
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 block md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`sidebar h-full flex flex-col bg-gradient-to-b from-purple-600 via-purple-700 to-indigo-800 shadow-2xl transition-transform duration-300 ${
                isMobileOpen ? 'translate-x-0 fixed inset-0 z-50 w-72' : 'fixed inset-y-0 left-0 z-40 w-64 -translate-x-full md:translate-x-0'
            }`}>
                {/* Close button for mobile */}
                <button 
                    onClick={() => setIsMobileOpen(false)}
                    className="absolute top-4 right-4 p-2 text-white/80 hover:text-white block md:hidden"
                >
                    <FaTimes className="w-5 h-5" />
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

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-1 px-2">
                    {navItems.map((item) => (
                        <div key={item.title}>
                            {item.hasDropdown ? (
                                <div className="mb-1">
                                    <button
                                        onClick={() => {
                                            if (window.innerWidth < 1024) {
                                                toggleMobileMenu(item.key)
                                            } else {
                                                toggleMenu(item.key)
                                            }
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                                            isActive(item.path) 
                                                ? 'bg-white/20 text-white shadow-md border-l-4 border-white' 
                                                : 'text-purple-100 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`text-lg ${isActive(item.path) ? 'text-white' : 'text-purple-300 group-hover:text-white'}`}>
                                                {item.icon}
                                            </span>
                                            <span className="text-sm font-medium">{item.title}</span>
                                        </div>
                                        {(expandedMenus[item.key] || mobileMenuOpen[item.key]) ? (
                                            <FaChevronDown className="w-3 h-3" />
                                        ) : (
                                            <FaChevronRight className="w-3 h-3" />
                                        )}
                                    </button>

                                    {/* Sub Items */}
                                    <div className={`overflow-hidden transition-all duration-200 ${
                                        (expandedMenus[item.key] || mobileMenuOpen[item.key]) ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                        {item.subItems?.map((subItem) => (
                                            <Link
                                                key={subItem.path}
                                                href={subItem.path}
                                                onClick={() => setIsMobileOpen(false)}
                                                className={`flex items-center gap-2 px-4 py-2 ml-4 text-sm rounded-lg transition-colors ${
                                                    pathname === subItem.path
                                                        ? 'bg-white/20 text-white'
                                                        : 'text-purple-200 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-300"></span>
                                                {subItem.title}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    href={item.path}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                                        isActive(item.path) 
                                            ? 'bg-white/20 text-white shadow-md border-l-4 border-white' 
                                            : 'text-purple-100 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <span className={`text-lg ${isActive(item.path) ? 'text-white' : 'text-purple-300'}`}>
                                        {item.icon}
                                    </span>
                                    <span className="text-sm font-medium">{item.title}</span>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                {/* User Section */}
                {session && (
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

export default SideBar
