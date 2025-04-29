export default function Loading() {
  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%", margin: "0 auto" }}>
      <main className="py-6" style={{ width: "65%", maxWidth: "850px" }}>
        <div className="flex flex-col gap-8" style={{ width: "100%" }}>
          {/* User Profile Skeleton */}
          <div className="rounded-lg border p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-300 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-6 w-48 bg-gray-300 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="h-10 w-24 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="mt-4 flex gap-4">
              <div className="h-6 w-24 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-6 w-24 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-6 w-24 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* Posts Skeleton */}
          <div className="border-t pt-6">
            <div className="h-8 w-24 bg-gray-300 rounded animate-pulse mb-4"></div>
            
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 rounded-lg border p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300 animate-pulse"></div>
                    <div className="h-5 w-32 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                  <div className="h-24 w-full bg-gray-300 rounded animate-pulse"></div>
                  <div className="flex justify-between">
                    <div className="h-6 w-24 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 