import React from 'react'
import Link from 'next/link'
import { 
  FaBookOpen, FaEdit, FaTrashAlt, FaChalkboardTeacher, FaLayerGroup,
  FaCalculator, FaFlask, FaGlobe, FaPalette, FaMusic, FaRunning,
  FaLaptop, FaLanguage, FaHistory, FaLandmark, FaStar, FaBrain,
  FaTree, FaFlag, FaHeart, FaCogs, FaPlus, FaHome,
  FaMicroscope, FaMoneyBillWave
} from 'react-icons/fa'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteSubject } from '@/lib/actions/subject.action'
import { BookOpen, Calculator, Globe, Music, Microscope, Landmark, HeartPulse, Lightbulb } from 'lucide-react'

const getSubjectIcon = (subjectName, colorClass) => {
  const name = (subjectName || '').toLowerCase()
  
  const iconMap = {
    // Mathematics & Numbers
    'mathematics': <Calculator className={colorClass} />,
    'math': <Calculator className={colorClass} />,
    'algebra': <Calculator className={colorClass} />,
    'geometry': <Calculator className={colorClass} />,
    
    // Sciences
    'science': <Microscope className={colorClass} />,
    'physics': <FaFlask className={colorClass} />,
    'chemistry': <FaFlask className={colorClass} />,
    'biology': <FaMicroscope className={colorClass} />,
    'botany': <FaTree className={colorClass} />,
    'zoology': <FaMicroscope className={colorClass} />,
    
    // Languages
    'english': <FaLanguage className={colorClass} />,
    'literature': <FaBookOpen className={colorClass} />,
    'french': <FaLanguage className={colorClass} />,
    'spanish': <FaLanguage className={colorClass} />,
    'writing': <FaLanguage className={colorClass} />,
    'grammar': <FaLanguage className={colorClass} />,
    'reading': <FaBookOpen className={colorClass} />,
    'phonics': <FaLanguage className={colorClass} />,
    
    // Social Studies
    'history': <FaHistory className={colorClass} />,
    'geography': <FaGlobe className={colorClass} />,
    'social studies': <FaLandmark className={colorClass} />,
    'civic': <FaLandmark className={colorClass} />,
    'government': <FaLandmark className={colorClass} />,
    
    // Arts
    'art': <FaPalette className={colorClass} />,
    'drawing': <FaPalette className={colorClass} />,
    'painting': <FaPalette className={colorClass} />,
    'music': <FaMusic className={colorClass} />,
    
    // Technology
    'computer': <FaLaptop className={colorClass} />,
    'ict': <FaLaptop className={colorClass} />,
    'technology': <FaLaptop className={colorClass} />,
    
    // Health & Sports
    'physical education': <FaRunning className={colorClass} />,
    'pe': <FaRunning className={colorClass} />,
    'health': <HeartPulse className={colorClass} />,
    'sports': <FaRunning className={colorClass} />,
    
    // Religious & Moral
    'religious education': <FaStar className={colorClass} />,
    're': <FaStar className={colorClass} />,
    'moral': <FaStar className={colorClass} />,
    'bible': <FaStar className={colorClass} />,
    'islam': <FaStar className={colorClass} />,
    
    // Vocational
    'vocational': <FaCogs className={colorClass} />,
    'technical': <FaCogs className={colorClass} />,
    'home economics': <FaHome className={colorClass} />,
    
    // Languages (African)
    'twi': <FaLanguage className={colorClass} />,
    'ga': <FaLanguage className={colorClass} />,
    'ewe': <FaLanguage className={colorClass} />,
    
    // Commerce & Business
    'commerce': <FaMoneyBillWave className={colorClass} />,
    'business': <FaMoneyBillWave className={colorClass} />,
    'accounting': <FaCalculator className={colorClass} />,
    
    // Other
    'creativity': <Lightbulb className={colorClass} />,
    'thinking': <FaBrain className={colorClass} />,
    'stem': <FaFlask className={colorClass} />,
  }
  
  for (const [key, icon] of Object.entries(iconMap)) {
    if (name.includes(key)) {
      return icon
    }
  }
  
  return <BookOpen className={colorClass} />
}

const SubjectTable = ({ sub }) => {
  return (
    <div className="w-full">
      {/* Subject Cards Grid */}
      {sub && sub.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {sub.map((data, index) => {
            const colors = [
              { bg: 'from-blue-500 to-cyan-500', icon: 'text-blue-600' },
              { bg: 'from-purple-500 to-pink-500', icon: 'text-purple-600' },
              { bg: 'from-emerald-500 to-teal-500', icon: 'text-emerald-600' },
              { bg: 'from-orange-500 to-red-500', icon: 'text-orange-600' },
              { bg: 'from-indigo-500 to-blue-500', icon: 'text-indigo-600' },
              { bg: 'from-rose-500 to-pink-500', icon: 'text-rose-600' },
              { bg: 'from-violet-500 to-purple-500', icon: 'text-violet-600' },
              { bg: 'from-teal-500 to-green-500', icon: 'text-teal-600' },
              { bg: 'from-amber-500 to-yellow-500', icon: 'text-amber-600' },
              { bg: 'from-cyan-500 to-blue-500', icon: 'text-cyan-600' },
              { bg: 'from-lime-500 to-green-500', icon: 'text-lime-600' },
              { bg: 'from-fuchsia-500 to-pink-500', icon: 'text-fuchsia-600' },
            ]
            const color = colors[index % colors.length]
            
            return (
              <div 
                key={data?._id || `subject-${index}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Header with gradient */}
                <div className={`bg-gradient-to-r ${color.bg} p-4 sm:p-5 relative overflow-hidden`}>
                  {/* Decorative circles */}
                  <div className="absolute -top-6 -right-6 w-16 sm:w-20 h-16 sm:h-20 bg-white/10 rounded-full"></div>
                  <div className="absolute -bottom-3 -left-3 w-10 sm:w-14 h-10 sm:h-14 bg-white/10 rounded-full"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div className={`w-10 sm:w-14 h-10 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg`}>
                        {getSubjectIcon(data.Name, "w-5 sm:w-7 h-5 sm:h-7 text-white")}
                      </div>
                      
                      {/* Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="bg-white/20 hover:bg-white/30 text-white p-1.5 sm:p-2 rounded-lg transition-colors">
                          <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                          </svg>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-40">
                          <DropdownMenuLabel>Subject Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <Link href={`/subject/${data._id}/update`}>
                            <DropdownMenuItem className="cursor-pointer">
                              <FaEdit className="mr-2 text-green-600" />
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <form action={deleteSubject}>
                            <input type="hidden" name="id" value={data._id}/>
                            <button className="w-full">
                              <DropdownMenuItem className="cursor-pointer text-red-600">
                                <FaTrashAlt className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </button>
                          </form>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <h3 className="text-white font-bold text-base sm:text-xl mt-3 sm:mt-4">{data.Name}</h3>
                  </div>
                </div>
                
                {/* Body */}
                <div className="p-4 sm:p-5">
                  <div className="space-y-2 sm:space-y-3">
                    {data.assignedTeacher ? (
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 sm:w-8 h-7 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <FaChalkboardTeacher className="text-purple-600 text-xs" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Teacher</p>
                          <p className="text-sm font-medium text-gray-900">{data.assignedTeacher.name}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 sm:w-8 h-7 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <FaChalkboardTeacher className="text-gray-400 text-xs" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Teacher</p>
                          <p className="text-sm font-medium text-gray-400">Not assigned</p>
                        </div>
                      </div>
                    )}
                    
                    {data.description && (
                      <div className="pt-2 sm:pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Description</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{data.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
          <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <FaBookOpen className="text-2xl sm:text-3xl text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Subjects Found</h3>
          <p className="text-gray-500 mb-3 sm:mb-4 text-sm">This class doesn't have any subjects yet.</p>
          <Link 
            href="/subject/add-subject" 
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-5 py-2 rounded-lg transition-colors text-sm"
          >
            <FaPlus />
            Add Subject
          </Link>
        </div>
      )}
    </div>
  )
}

export default SubjectTable
