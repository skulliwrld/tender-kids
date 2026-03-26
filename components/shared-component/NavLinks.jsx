import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { VscDashboard } from "react-icons/vsc";
import { FaSchool, FaChalkboardTeacher, FaUserGraduate, FaBookOpen, FaUser, FaSignOutAlt, FaCheckSquare, FaTimes, FaChevronDown, FaChevronRight, FaMoneyBillWave, FaFileInvoiceDollar, FaChartBar, FaWallet, FaUsers } from "react-icons/fa";
import { MdOutlineSubject, MdFamilyRestroom } from "react-icons/md";
import { PiExam } from "react-icons/pi";

// Static navigation data - no need to be client component
export const adminNavItems = [
    {
        title: "Dashboard",
        path: "/dashboard",
        icon: VscDashboard,
        hasDropdown: false
    },
    {
        title: "Class Management",
        path: "/class",
        icon: FaSchool,
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
        icon: FaUserGraduate,
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
        icon: FaChalkboardTeacher,
        hasDropdown: false
    },
    {
        title: "Parents",
        path: "/parent",
        icon: FaUser,
        hasDropdown: false
    },
    {
        title: "Subjects",
        path: "/subject",
        icon: MdOutlineSubject,
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
        icon: MdFamilyRestroom,
        hasDropdown: false
    },
    {
        title: "Attendance",
        path: "/attendance",
        icon: FaCheckSquare,
        hasDropdown: false
    },
    {
        title: "Exams",
        path: "/exams",
        icon: PiExam,
        hasDropdown: false
    },
    {
        title: "Academic Session",
        path: "/fees/academic",
        icon: VscDashboard,
        hasDropdown: false
    },
    {
        title: "Fees Management",
        path: "/fees",
        icon: FaMoneyBillWave,
        hasDropdown: true,
        key: "fees",
        subItems: [
            { title: "Dashboard", path: "/fees" },
            { title: "Fee Structure", path: "/fees/structure" },
            { title: "Collection", path: "/fees/collection" },
            { title: "Reports", path: "/fees/reports" }
        ]
    }
];

export const teacherNavItems = [
    {
        title: "Dashboard",
        path: "/dashboard",
        icon: VscDashboard,
        hasDropdown: false
    },
    {
        title: "My Classes",
        path: "/teacher",
        icon: FaSchool,
        hasDropdown: false
    },
    {
        title: "Assignments",
        path: "/teacher/assignments",
        icon: FaBookOpen,
        hasDropdown: false
    },
    {
        title: "Attendance",
        path: "/teacher/attendance",
        icon: FaCheckSquare,
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
        icon: PiExam,
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
        icon: FaChalkboardTeacher,
        hasDropdown: false
    }
];

export const studentNavItems = [
    {
        title: "Dashboard",
        path: "/dashboard",
        icon: VscDashboard,
        hasDropdown: false
    },
    {
        title: "My Fees",
        path: "/fees/student",
        icon: FaWallet,
        hasDropdown: false
    },
    {
        title: "Assignments",
        path: "/student/assignments",
        icon: FaBookOpen,
        hasDropdown: false
    },
    {
        title: "My Results",
        path: "/student/result",
        icon: FaBookOpen,
        hasDropdown: false
    },
    {
        title: "My Attendance",
        path: "/student/attendance",
        icon: FaCheckSquare,
        hasDropdown: false
    },
    {
        title: "My Profile",
        path: "/student/profile",
        icon: FaUserGraduate,
        hasDropdown: false
    }
];

export const parentNavItems = [
    {
        title: "Dashboard",
        path: "/dashboard",
        icon: VscDashboard,
        hasDropdown: false
    },
    {
        title: "Children Fees",
        path: "/fees/parent",
        icon: FaMoneyBillWave,
        hasDropdown: false
    },
    {
        title: "Parent Portal",
        path: "/parent-portal",
        icon: FaUsers,
        hasDropdown: false
    }
];

// Server Component for rendering navigation items
export default function NavLinks({ role, expandedMenus, toggleMenu, mobileMenuOpen, toggleMobileMenu }) {
    const pathname = usePathname()
    
    const navItems = role === 'admin' ? adminNavItems : 
                     role === 'teacher' ? teacherNavItems : 
                     role === 'parent' ? parentNavItems : 
                     role === 'student' ? studentNavItems : [];

    const isActive = (path) => {
        if (pathname === path) return true
        if (path === '/teacher' && pathname.startsWith('/teacher/')) return false
        if (path === '/dashboard' && pathname.startsWith('/dashboard/')) return false
        if (path === '/student' && pathname.startsWith('/student/')) return false
        return pathname.startsWith(path + '/')
    }

    const handleToggle = (item) => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            toggleMobileMenu(item.key)
        } else {
            toggleMenu(item.key)
        }
    }

    return (
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-1 px-2">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isExpanded = expandedMenus[item.key] || mobileMenuOpen[item.key];
                
                return (
                    <div key={item.title}>
                        {item.hasDropdown ? (
                            <div className="mb-1">
                                <button
                                    onClick={() => handleToggle(item)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                                        isActive(item.path) 
                                            ? 'bg-white/20 text-white shadow-md border-l-4 border-white' 
                                            : 'text-purple-100 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`text-lg ${isActive(item.path) ? 'text-white' : 'text-purple-300 group-hover:text-white'}`}>
                                            <Icon />
                                        </span>
                                        <span className="text-sm font-medium">{item.title}</span>
                                    </div>
                                    {isExpanded ? (
                                        <FaChevronDown className="w-3 h-3" />
                                    ) : (
                                        <FaChevronRight className="w-3 h-3" />
                                    )}
                                </button>

                                {/* Sub Items */}
                                <div className={`overflow-hidden transition-all duration-200 ${
                                    isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                                }`}>
                                    {item.subItems?.map((subItem) => (
                                        <Link
                                            key={subItem.path}
                                            href={subItem.path}
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
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                                    isActive(item.path) 
                                        ? 'bg-white/20 text-white shadow-md border-l-4 border-white' 
                                        : 'text-purple-100 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <span className={`text-lg ${isActive(item.path) ? 'text-white' : 'text-purple-300'}`}>
                                    <Icon />
                                </span>
                                <span className="text-sm font-medium">{item.title}</span>
                            </Link>
                        )}
                    </div>
                );
            })}
        </div>
    )
}
