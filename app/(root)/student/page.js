import { AllStudentFetch, AllClassFetch, FetchClasses } from '@/lib/DataFech/All-data';
import { connectToDB } from '@/lib/Database/connectToDB';
import { Teacher } from '@/models/teacher.model';
import { Class } from '@/models/class.model';
import StudentTable from '@/components/common-components/StudentTable';
import Link from 'next/link';
import { FaPlus, FaSearch, FaUsers, FaChalkboard } from 'react-icons/fa';
import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic'

async function StudentPage(props) {
  const searchParams = await props.searchParams;
  const selectedClassId = searchParams?.class;
  
  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect('/signin')
  }

  const role = session.user?.role
  const userEmail = session.user?.email

  let teacherClasses = []
  if (role === 'teacher') {
    await connectToDB()
    const teacher = await Teacher.findOne({ email: userEmail })
    if (teacher) {
      const { classes } = await FetchClasses('', teacher._id)
      teacherClasses = classes || []
    }
  }

  const [students, classes] = await Promise.all([
    AllStudentFetch(),
    role === 'admin' ? AllClassFetch() : Promise.resolve(teacherClasses)
  ]);

  let filteredStudents = students
  
  if (role === 'teacher') {
    if (teacherClasses.length > 0) {
      const teacherClassIds = teacherClasses.map(c => c._id.toString())
      filteredStudents = students?.filter(s => 
        s.Class && teacherClassIds.includes(s.Class?.toString())
      ) || []
    } else {
      filteredStudents = []
    }
  } else if (selectedClassId) {
    filteredStudents = students?.filter(s => s.Class?.toString() === selectedClassId)
  }

  const getClassName = (classId) => {
    const cls = classes?.find(c => c._id?.toString() === classId?.toString());
    return cls?.name || 'Unknown';
  };

  const studentsWithClassName = filteredStudents?.map(student => ({
    ...student,
    className: getClassName(student.Class?.toString())
  })) || [];

  const getStudentsByClass = () => {
    const grouped = {};
    filteredStudents?.forEach(student => {
      const classId = student.Class?.toString();
      if (!classId) return;
      if (!grouped[classId]) {
        grouped[classId] = {
          className: getClassName(classId),
          classId,
          students: []
        };
      }
      grouped[classId].students.push(student);
    });
    return Object.values(grouped);
  };

  const groupedStudents = getStudentsByClass();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaUsers className="text-indigo-600" />
            {role === 'teacher' ? 'My Students' : 'Student Management'}
          </h1>
          <p className="text-gray-500 mt-1">
            {role === 'teacher' ? 'Students in your assigned classes' : 'View and manage all students'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-6">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaChalkboard className="text-indigo-600" />
                Filter by Class
              </h2>
              
              <div className="space-y-2">
                <Link 
                  href="/student"
                  className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    !selectedClassId 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'hover:bg-indigo-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">All Students</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${!selectedClassId ? 'bg-white/20' : 'bg-indigo-100'}`}>
                      {role === 'teacher' ? filteredStudents?.length || 0 : students?.length || 0}
                    </span>
                  </div>
                </Link>

                <div className="border-t my-3"></div>

                {classes?.map(cls => {
                  const count = filteredStudents?.filter(s => 
                    s.Class?.toString() === cls._id?.toString()
                  ).length || 0;
                  
                  return (
                    <Link
                      key={cls._id}
                      href={`/student?class=${cls._id}`}
                      className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                        selectedClassId === cls._id?.toString()
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'hover:bg-indigo-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{cls.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          selectedClassId === cls._id?.toString() ? 'bg-white/20' : 'bg-indigo-100'
                        } ${selectedClassId === cls._id?.toString() ? 'text-white' : 'text-indigo-700'}`}>
                          {count}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {role === 'admin' && (
              <div className="border-t mt-4 pt-4">
                <Link 
                  href="/student/add-student"
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <FaPlus /> Add Student
                </Link>
              </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedClassId && (
              <div className="bg-indigo-600 text-white rounded-xl p-4 mb-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {getClassName(selectedClassId)}
                    </h3>
                    <p className="text-indigo-200 text-sm">
                      Showing {filteredStudents?.length || 0} student{filteredStudents?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Link 
                    href="/student"
                    className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Clear Filter
                  </Link>
                </div>
              </div>
            )}

            <StudentTable 
              students={studentsWithClassName} 
              showClass={!selectedClassId}
            />
          </div>
        </div>

        {!selectedClassId && groupedStudents.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Students by Class</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedStudents.map(group => (
                <div key={group.classId} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
                    <div className="flex items-center justify-between text-white">
                      <h3 className="font-semibold">{group.className}</h3>
                      <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                        {group.students.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <Link 
                      href={`/student?class=${group.classId}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                    >
                      View All <FaSearch className="text-xs" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentPage;
