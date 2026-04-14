import { useState } from 'react'

export default function ExportDropdown({ children, label = 'Export' }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs bg-navy hover:bg-navy-dark text-white px-3 py-1.5 rounded transition-colors flex items-center gap-1"
      >
        {label} <span className="text-[10px]">{open ? '\u25B2' : '\u25BC'}</span>
      </button>
      {open && (
        <div
          className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[140px]"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  )
}
