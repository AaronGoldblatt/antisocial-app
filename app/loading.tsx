export default function AppLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-t-orange-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-700 dark:text-slate-300">Loading content...</p>
        </div>
      </div>
    </div>
  );
} 