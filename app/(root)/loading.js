export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="h-16 bg-white rounded-xl shadow-md mb-6"></div>
      
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="h-32 bg-white rounded-xl shadow-md"></div>
        <div className="h-32 bg-white rounded-xl shadow-md"></div>
        <div className="h-32 bg-white rounded-xl shadow-md"></div>
        <div className="h-32 bg-white rounded-xl shadow-md"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="h-64 bg-white rounded-xl shadow-md"></div>
        <div className="h-64 bg-white rounded-xl shadow-md"></div>
      </div>
    </div>
  )
}
