import Link from 'next/link'
import { FaMoneyBillWave, FaArrowLeft, FaCheckCircle, FaClock } from 'react-icons/fa'

export default function PaymentRequiredPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-600">
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6">
            <div className="flex items-center justify-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <FaMoneyBillWave className="text-5xl text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white text-center mt-4">Payment Required</h1>
          </div>
          
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaClock className="text-3xl text-red-500" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Tuition Fee Not Paid
            </h2>
            
            <p className="text-gray-600 mb-6">
              You need to pay your tuition fees to access your results. 
              Please contact the school administration or make your payment to view your academic records.
            </p>
            
            <div className="bg-purple-50 rounded-xl p-4 mb-6">
              <p className="text-purple-800 text-sm font-medium">
                <FaCheckCircle className="inline mr-2" />
                Results are available immediately after payment confirmation
              </p>
            </div>
            
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              <FaArrowLeft /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
