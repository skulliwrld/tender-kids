import { AllClassFetch } from '@/lib/DataFech/All-data';
import { fetchAllParents } from '@/lib/actions/parent.action';
import StudentForm from '@/components/common-components/StudentForm';
import { addStudent } from '@/lib/actions/student.action';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

const AddStudentPage = async () => {
  const classes = await AllClassFetch();
  const parents = await fetchAllParents();

  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/student"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium"
        >
          <FaArrowLeft /> Back to Students
        </Link>
        
        <StudentForm handleAdd={addStudent} classes={classes || []} sections={[]} parents={parents || []} type="add" />
      </div>
    </section>
  )
}

export default AddStudentPage