import { fetchIndividualStudentData, AllClassFetch } from '@/lib/DataFech/All-data';
import { FetchSubjectByClass } from '@/lib/actions/subject.action';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaVenusMars, FaMapMarkerAlt, FaGraduationCap, FaEdit, FaArrowLeft, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaBook, FaUserTie } from 'react-icons/fa';
import { getServerSession } from "next-auth/next"
import { authConfig } from '@/auth.config'
import { redirect } from 'next/navigation';
import { connectToDB } from '@/lib/Database/connectToDB';
import { Student } from '@/models/student.model';
import { Parent } from '@/models/parent.model';
import { Class as ClassSection } from '@/models/section.model';

async function getStudentByEmail(email) {
  await connectToDB();
  const student = await Student.findOne({ Email: email }).populate('Parent');
  return student ? JSON.parse(JSON.stringify(student)) : null;
}

async function getSectionName(sectionId) {
  if (!sectionId) return null;
  await connectToDB();
  const section = await ClassSection.findById(sectionId);
  return section ? section.Name : null;
}
async function StudentProfilePage() {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    redirect('/signin')
  }

  // For students, get their profile by email
  let student = null;
  if (session.user?.role === 'student') {
    student = await getStudentByEmail(session.user?.email)
  }
  
  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Profile not found</h1>
          <p className="text-gray-500 mt-2">Your profile could not be found.</p>
          <Link href="/dashboard" className="text-indigo-600 hover:underline mt-2 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const classes = await AllClassFetch()
  const classInfo = classes?.find(c => c._id === student.Class?.toString());
  
  const sectionName = student.section ? await getSectionName(student.section) : null;
  
  let subjects = [];
  if (student.Class) {
    const subjectData = await FetchSubjectByClass(student.Class.toString(), '', 1);
    subjects = subjectData?.subjects || [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium"
        >
          <FaArrowLeft /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 h-32"></div>
          
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6 flex flex-col md:flex-row items-center md:items-end gap-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                {student.photo ? (
                  <Image 
                    src={student.photo} 
                    alt={student.Name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-4xl font-bold">
                    {student.Name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{student.Name}</h1>
                <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 mt-1">
                  <FaGraduationCap className="text-indigo-600" />
                  {classInfo?.name || 'No Class Assigned'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <FaUser />
                  </div>
                  <div>
                    <p className="text-xs text-indigo-600 font-medium uppercase">Student Name</p>
                    <p className="font-semibold text-gray-900">{student.Name}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                    <FaGraduationCap />
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 font-medium uppercase">Class</p>
                    <p className="font-semibold text-gray-900">{classInfo?.name || 'Not Assigned'}</p>
                  </div>
                </div>
              </div>

              {sectionName && (
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-5 border border-cyan-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center text-white">
                      <FaGraduationCap />
                    </div>
                    <div>
                      <p className="text-xs text-cyan-600 font-medium uppercase">Section</p>
                      <p className="font-semibold text-gray-900">{sectionName}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-5 border border-pink-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center text-white">
                    <FaVenusMars />
                  </div>
                  <div>
                    <p className="text-xs text-pink-600 font-medium uppercase">Gender</p>
                    <p className="font-semibold text-gray-900">{student.Gender || 'Not Specified'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                    <FaCalendar />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium uppercase">Date of Birth</p>
                    <p className="font-semibold text-gray-900">{student.DOB || 'Not Specified'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white">
                    <FaEnvelope />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-medium uppercase">Email</p>
                    <p className="font-semibold text-gray-900">{student.Email || 'Not Specified'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white">
                    <FaPhone />
                  </div>
                  <div>
                    <p className="text-xs text-orange-600 font-medium uppercase">Phone</p>
                    <p className="font-semibold text-gray-900">{student.Phone || 'Not Specified'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border border-red-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <p className="text-xs text-red-600 font-medium uppercase">Address</p>
                    <p className="font-semibold text-gray-900">{student.Address || 'Not Specified'}</p>
                  </div>
                </div>
              </div>

              {student.Bio && (
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-5 border border-teal-200 md:col-span-2">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white">
                      <FaBook />
                    </div>
                    <div>
                      <p className="text-xs text-teal-600 font-medium uppercase">Bio</p>
                      <p className="font-semibold text-gray-900">{student.Bio}</p>
                    </div>
                  </div>
                </div>
              )}

              {student.Parent && (
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200 md:col-span-2 lg:col-span-3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                      <FaUserTie />
                    </div>
                    <div>
                      <p className="text-xs text-indigo-600 font-medium uppercase">Parent/Guardian</p>
                      <p className="font-semibold text-gray-900">{student.Parent.Name || 'Not Specified'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {student.Parent.Email && (
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-indigo-600 text-sm" />
                        <span className="text-sm text-gray-700">{student.Parent.Email}</span>
                      </div>
                    )}
                    {student.Parent.Phone && (
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-indigo-600 text-sm" />
                        <span className="text-sm text-gray-700">{student.Parent.Phone}</span>
                      </div>
                    )}
                    {student.Parent.Profession && (
                      <div className="flex items-center gap-2">
                        <FaUserTie className="text-indigo-600 text-sm" />
                        <span className="text-sm text-gray-700">{student.Parent.Profession}</span>
                      </div>
                    )}
                    {student.Parent.Address && (
                      <div className="flex items-center gap-2 md:col-span-3">
                        <FaMapMarkerAlt className="text-indigo-600 text-sm" />
                        <span className="text-sm text-gray-700">{student.Parent.Address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className={`rounded-xl p-5 border ${
                student.hasPaid 
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                  : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                    student.hasPaid ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {student.hasPaid ? <FaCheckCircle /> : <FaTimesCircle />}
                  </div>
                  <div>
                    <p className={`text-xs font-medium uppercase ${
                      student.hasPaid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Payment Status
                    </p>
                    <p className="font-semibold text-gray-900">
                      {student.hasPaid ? 'Paid' : 'Not Paid'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {subjects.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl mt-6 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-8 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaBook /> My Subjects
              </h2>
              <p className="text-indigo-100 text-sm">Subjects offered for your class</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                  <div key={subject._id} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                        {subject.Name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{subject.Name}</h3>
                        {subject.assignedTeacher && (
                          <p className="text-sm text-gray-500">
                            Teacher: {subject.assignedTeacher.name}
                          </p>
                        )}
                        {subject.description && (
                          <p className="text-xs text-gray-400 mt-1">{subject.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentProfilePage;
