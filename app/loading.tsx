import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50/50">
      <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Loading...</h3>
          <p className="text-sm text-gray-500">Preparing something beautiful for you</p>
        </div>
      </div>
    </div>
  )
}
