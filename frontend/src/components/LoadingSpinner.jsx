export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-navy rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  )
}
