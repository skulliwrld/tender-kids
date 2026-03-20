'use client'

import '@/components/common-components/style.css'
import Link from 'next/link';
import Image from 'next/image';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteStudent } from '@/lib/actions/student.action';
import { FaEdit, FaTrashAlt, FaEye, FaUserGraduate } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const StudentTable = ({ students, showClass = false, className = '' }) => {
  const router = useRouter();

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this student?')) {
      const formData = new FormData();
      formData.append('id', id);
      await deleteStudent(formData);
      router.refresh();
    }
  };

  return (
    <div className={`overflow-hidden rounded-xl shadow-lg bg-white ${className}`}>
        <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <tr className="text-sm font-semibold">
                        <th className='px-4 py-4 text-left'>Photo</th>
                        <th className="px-4 py-4 text-left">Name</th>
                        {showClass && <th className="px-4 py-4 text-left">Class</th>}
                        <th className="px-4 py-4 text-left">Gender</th>
                        <th className="px-4 py-4 text-left">DOB</th>
                        <th className="px-4 py-4 text-left">Phone</th>
                        <th className="px-4 py-4 text-left">Email</th>
                        <th className="px-4 py-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {students.length === 0 ? (
                        <tr>
                            <td colSpan={showClass ? 8 : 7} className="px-4 py-8 text-center text-gray-500">
                                <div className="flex flex-col items-center justify-center">
                                    <FaUserGraduate className="text-4xl text-gray-300 mb-2" />
                                    <span>No students found</span>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        students.map((student, index) => (
                            <tr key={student._id || index} className="hover:bg-indigo-50/50 transition-colors duration-200">
                                <td className="px-4 py-3">
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-100 shadow-sm">
                                        {student.photo ? (
                                            <Image 
                                                src={student.photo} 
                                                alt={student.Name || student.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                                                {(student.Name || student.name)?.charAt(0)?.toUpperCase() || 'S'}
                                            </div>
                                        )}
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-900">{student.Name || student.name}</div>
                                </td>

                                {showClass && (
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                            {student.className || student.Class?.name || 'N/A'}
                                        </span>
                                    </td>
                                )}

                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        student.Gender?.toLowerCase() === 'male' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-pink-100 text-pink-800'
                                    }`}>
                                        {student.Gender || 'N/A'}
                                    </span>
                                </td>

                                <td className="px-4 py-3 text-gray-600 text-sm">
                                    {student.DOB || 'N/A'}
                                </td>

                                <td className="px-4 py-3 text-gray-600 text-sm">
                                    {student.Phone || 'N/A'}
                                </td>

                                <td className="px-4 py-3 text-gray-600 text-sm">
                                    {student.Email || 'N/A'}
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2">
                                                Action <span className="text-xs">▼</span>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="bg-white border border-gray-200 shadow-xl rounded-lg w-40 overflow-hidden">
                                                <Link href={`/student/${student._id}`}>
                                                    <DropdownMenuLabel className="flex items-center gap-2 text-green-600 hover:bg-green-50 cursor-pointer py-2.5 px-3">
                                                        <FaEye className="text-xs" /> View
                                                    </DropdownMenuLabel>
                                                </Link>
                                                <DropdownMenuSeparator className="bg-gray-100" />
                                                <Link href={`/student/${student._id}/edit`}>
                                                    <DropdownMenuLabel className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 cursor-pointer py-2.5 px-3">
                                                        <FaEdit className="text-xs" /> Edit
                                                    </DropdownMenuLabel>
                                                </Link>
                                                <DropdownMenuSeparator className="bg-gray-100" />
                                                <button 
                                                    onClick={() => handleDelete(student._id)}
                                                    className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 cursor-pointer py-2.5 px-3 text-sm"
                                                >
                                                    <FaTrashAlt className="text-xs" /> Delete
                                                </button>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default StudentTable
