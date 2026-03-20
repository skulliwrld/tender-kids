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
import { deleteTeacher } from '@/lib/actions/teacher.actions';

const TeacherTable = ({Data}) => {
  return (
    <div className="text-black bg-gradient-to-r from-yellow-400 to-pink-600 py-4 px-2 md:px-5 w-full h-auto overflow-x-auto">
        <table className="w-full px-2 mt-3 border hidden md:table">
            <thead className="border py-3">
                <tr className="text-md font-medium text-slate-700">
                    <td className=''>Photo</td>
                    <td className="">Name</td>
                    <td>Email</td> 
                    <td>Phone Number</td> 
                    <td>Options</td> 
                </tr>
            </thead>
            <tbody>
                {Data.map((data, index) =>(
                    <tr className="items-center text-sm" key={data?._id || `teacher-${index}`}>
                        <td className="flex justify-center border-y">
                            <Image src="/assets/images/default.png" width={50} height={10} />
                        </td>

                        <td>
                            {data.name}
                        </td>

                        <td>
                            {data.email}
                        </td>
                        <td>
                            {data.phone}
                        </td>

                        <td>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="bg-blue-500 py-3 px-2 text-primary text">Action</DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-blue-300 text-primary border border-black flex flex-col justify-center text-center">
                                <Link href={`/teacher/${data._id}`}>
                                    <DropdownMenuLabel className="bg-green-600 py-2 px-3 font-semibold rounded-lg text-end cursor-pointer">Edit</DropdownMenuLabel>
                                </Link>
                                <DropdownMenuSeparator />
                                <form className="w-full" action={deleteTeacher}>
                                    <input type="hidden" name="id" value={data._id}/>
                                    <button className="bg-red-600 w-full py-2 text-start px-3 font-semibold rounded-lg cursor-pointer " >Delete</button>
                                </form>
                                
                            </DropdownMenuContent>
                        </DropdownMenu>

                        </td>
                    </tr>
                ))}
            </tbody>

        </table>

        <div className="md:hidden space-y-4">
            {Data.map((data, index) =>(
                <div className="bg-white rounded-lg p-4 shadow-md" key={data?._id || `teacher-${index}`}>
                    <div className="flex items-center gap-3 mb-3">
                        <Image src="/assets/images/default.png" width={50} height={50} className="rounded-full" />
                        <div>
                            <p className="font-semibold">{data.name}</p>
                            <p className="text-sm text-gray-500">{data.email}</p>
                        </div>
                    </div>
                    <div className="text-sm mb-3">
                        <p><span className="font-medium">Phone:</span> {data.phone}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/teacher/${data._id}`} className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-center text-sm font-medium">
                            Edit
                        </Link>
                        <form className="flex-1" action={deleteTeacher}>
                            <input type="hidden" name="id" value={data._id}/>
                            <button className="bg-red-600 w-full py-2 px-3 rounded-lg text-white text-sm font-medium" >Delete</button>
                        </form>
                    </div>
                </div>
            ))}
        </div>
    </div>
  )
}

export default TeacherTable