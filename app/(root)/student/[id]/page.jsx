import { fetchIndividualStudentData, AllClassFetch } from '@/lib/DataFech/All-data';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaVenusMars, FaMapMarkerAlt, FaGraduationCap, FaEdit, FaArrowLeft, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaBook, FaUserTie } from 'react-icons/fa';
import { connectToDB } from '@/lib/Database/connectToDB';
import { Student } from '@/models/student.model';
import { Parent } from '@/models/parent.model';
import StudentPhotoDialog from '@/components/StudentPhotoDialog';

async function StudentProfilePage(props) {
  const params = await props.params;
  const { id } = params;

  // Validate ObjectId
  const mongoose = require('mongoose')
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Invalid Student ID</h1>
          <Link href="/dashboard" className="text-indigo-600 hover:underline mt-2 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  const [student, classes] = await Promise.all([
    fetchIndividualStudentData(id),
    AllClassFetch()
  ]);

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Student not found</h1>
          <Link href="/student" className="text-indigo-600 hover:underline mt-2 inline-block">
            Back to Students
          </Link>
        </div>
      </div>
    );
  }

  let parentData = null;
  if (student.Parent) {
    await connectToDB();
    parentData = await Parent.findById(student.Parent).lean();
    parentData = JSON.parse(JSON.stringify(parentData));
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Student not found</h1>
          <Link href="/student" className="text-indigo-600 hover:underline mt-2 inline-block">
            Back to Students
          </Link>
        </div>
      </div>
    );
  }

  const classInfo = classes?.find(c => c._id === student.Class?.toString());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Link 
          href="/student" 
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium"
        >
          <FaArrowLeft /> Back to Students
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 h-32"></div>
          
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6 flex flex-col md:flex-row items-center md:items-end gap-6">
              <StudentPhotoDialog student={student} imageSize="w-32 h-32" borderSize="border-4" />
              
              <div className="flex-1 text-center md:text-left mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{student.Name}</h1>
                <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 mt-1">
                  <FaGraduationCap className="text-indigo-600" />
                  {classInfo?.name || 'No Class Assigned'}
                </p>
              </div>

              <div className="flex gap-3 mb-2">
                <Link 
                  href={`/student/${student._id}/edit`}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <FaEdit /> Edit
                </Link>
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

              {parentData && (
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200 md:col-span-2 lg:col-span-3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                      <FaUserTie />
                    </div>
                    <div>
                      <p className="text-xs text-indigo-600 font-medium uppercase">Parent/Guardian</p>
                      <p className="font-semibold text-gray-900">{parentData.Name || 'Not Specified'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {parentData.Email && (
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-indigo-600 text-sm" />
                        <span className="text-sm text-gray-700">{parentData.Email}</span>
                      </div>
                    )}
                    {parentData.Phone && (
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-indigo-600 text-sm" />
                        <span className="text-sm text-gray-700">{parentData.Phone}</span>
                      </div>
                    )}
                    {parentData.Profession && (
                      <div className="flex items-center gap-2">
                        <FaUserTie className="text-indigo-600 text-sm" />
                        <span className="text-sm text-gray-700">{parentData.Profession}</span>
                      </div>
                    )}
                    {parentData.Address && (
                      <div className="flex items-center gap-2 md:col-span-3">
                        <FaMapMarkerAlt className="text-indigo-600 text-sm" />
                        <span className="text-sm text-gray-700">{parentData.Address}</span>
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

            <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaUser className="text-indigo-600" />
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Student ID</p>
                  <p className="font-mono text-gray-700">{student._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registration Date</p>
                  <p className="font-medium text-gray-700">
                    {student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfilePage;
