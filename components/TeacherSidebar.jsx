// 'use client'

// import React from 'react'
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// import {
//   BarChart3,
//   ClipboardList,
//   GraduationCap
// } from 'lucide-react'

// const TeacherSidebar = () => {
//   const pathname = usePathname()

//   const menuItems = [
//     {
//       title: 'Grade Calculator',
//       href: '/teacher/grades',
//       icon: BarChart3,
//       active: pathname === '/teacher/grades'
//     },
//     {
//       title: 'Input Grades',
//       href: '/teacher/grades/input',
//       icon: ClipboardList,
//       active: pathname === '/teacher/grades/input'
//     }
//   ]

//   return (
//     <div className="fixed left-0 top-0 h-auto w-64 bg-white shadow-lg border-r border-gray-200 z-40">
//       {/* Header */}
//       <div className="flex items-center justify-center h-16 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
//         <div className="flex items-center space-x-2">
//           <GraduationCap className="w-8 h-8 text-white" />
//           <span className="text-xl font-bold text-white">Teacher Portal</span>
//         </div>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 px-4 py-6 space-y-2">
//         {menuItems.map((item) => {
//           const Icon = item.icon
//           return (
//             <Link
//               key={item.href}
//               href={item.href}
//               className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
//                 item.active
//                   ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700'
//                   : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
//               }`}
//             >
//               <Icon className="w-5 h-5" />
//               <span className="font-medium">{item.title}</span>
//             </Link>
//           )
//         })}
//       </nav>

//       {/* Footer */}
//       <div className="p-4 border-t border-gray-200 bg-gray-50">
//         <div className="text-center">
//           <p className="text-xs text-gray-500">School Management System</p>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default TeacherSidebar