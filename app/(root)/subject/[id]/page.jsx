import TopFied from "@/components/common-components/TopFied";
import SubjectTable from "@/components/common-components/ULComponent";
import Pagination from "@/components/shared-component/Pagination";
import { FetchSubjectByClass } from "@/lib/actions/subject.action";
import { serializeMongoDoc } from "@/lib/utils/serialize";
import { fetchIndividualClassData } from "@/lib/DataFech/All-data";
import { FaBookOpen, FaLayerGroup, FaPlus, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';

const SubjectPage = async ({params, searchParams}) =>{

    const paramss = await searchParams
    const q = paramss?.q || ""
    const page = paramss?.page || 1

    const param = await params
    const {id} = param;
    
    const classData = await fetchIndividualClassData(id)
    const {subjects, count} = await FetchSubjectByClass(id, q, page)
    
    return (
        <>
            <div className="p-3 sm:p-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 text-white">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                <FaLayerGroup className="text-xl sm:text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-2xl font-bold">
                                    {classData?.name || 'Class'}
                                </h1>
                                <p className="text-purple-200 text-xs sm:text-sm">Subjects assigned to this class</p>
                            </div>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-2xl sm:text-3xl font-bold">{classData?.subjectList?.length || count}</p>
                            <p className="text-purple-200 text-xs sm:text-sm">Total Subjects</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Subject List</h2>
                        <p className="text-gray-500 text-sm">Manage subjects for this class</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                        <Link 
                            href="/subject/assign" 
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-colors text-sm w-full sm:w-auto justify-center"
                        >
                            <FaLayerGroup size={14} />
                            Assign Subjects
                        </Link>
                        <div className="w-full sm:w-auto">
                            <TopFied title="Subject" path="/subject/add-subject" searchType="subject"/>
                        </div>
                    </div>
                </div>

                {/* Subject Table */}
                <SubjectTable sub={serializeMongoDoc(subjects)} />

                <Pagination count={count}/>
            </div>
        </>
    )
}


export default SubjectPage;
