import { fetchIndividualStudentData, AllClassFetch, AllDayFetch } from '@/lib/DataFech/All-data';
import { fetchAllParents } from '@/lib/actions/parent.action';
import StudentForm from '@/components/common-components/StudentForm';
import { updateStudent } from '@/lib/actions/student.action';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

async function StudentEditPage(props) {
  const params = await props.params;
  const { id } = params;
  
  const [student, classes, parents] = await Promise.all([
    fetchIndividualStudentData(id),
    AllClassFetch(),
    fetchAllParents()
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

  return (
    <section className="w-full bg-primary outline-none border min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <Link 
          href={`/student/${id}`}
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium"
        >
          <FaArrowLeft /> Back to Profile
        </Link>
        
        <StudentForm 
          handleAdd={updateStudent} 
          classes={classes || []} 
          sections={[]} 
          parents={parents || []} 
          studentData={student}
          type="edit"
        />
      </div>
    </section>
  );
}

export default StudentEditPage;
