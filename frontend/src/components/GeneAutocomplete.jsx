import { useState, useRef, useId, useCallback, useEffect } from 'react'
import { api } from '../api.js'

// @MX:ANCHOR: [AUTO] WAI-ARIA combobox+listbox – consumed by Header, Gene, GenePair
// @MX:REASON: fan_in >= 3 call sites; prop signature must stay stable

/**
 * Accessible gene autocomplete input (WAI-ARIA combobox pattern).
 *
 * Props:
 *   value        {string}   – controlled input value
 *   onChange     {fn(e)}    – native change handler (receives synthetic event)
 *   onSelect     {fn(sym)}  – called with the chosen gene symbol string
 *   placeholder  {string}
 *   id           {string}   – forwarded to <input id>
 *   className    {string}   – extra classes on the <input>
 *   inputClassName {string} – alias for className (preferred at call sites)
 *   autoFocus    {bool}
 *   mobile       {bool}     – used by Header's mobile variant for styling
 *   label        {string}   – visible <label> text; if omitted, aria-label is used
 *   aria-label   {string}   – aria-label when no visible label is desired
 *   disabled     {bool}
 *   debounceMs   {number}   – autocomplete debounce delay (default 250)
 *   limit        {number}   – max suggestions to show (default 8)
 *   onKeyDown    {fn(e)}    – extra keydown handler merged with internal one
 */
export default function GeneAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Search a gene...',
  id,
  className,
  inputClassName,
  autoFocus,
  mobile = false,
  label,
  'aria-label': ariaLabel,
  disabled = false,
  debounceMs = 250,
  limit = 8,
  onKeyDown: externalKeyDown,
}) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const debounceRef = useRef(null)
  const inputRef = useRef(null)

  // Clear any pending debounce timer on unmount to prevent setState on unmounted component
  useEffect(() => () => clearTimeout(debounceRef.current), [])

  // Stable unique IDs for ARIA relationships
  const uid = useId()
  const listboxId = `ga-listbox-${uid}`
  const inputId = id || `ga-input-${uid}`

  // Fetch suggestions with debounce
  // @MX:WARN: [AUTO] async without .catch boundary – error silently drops suggestions
  // @MX:REASON: deliberate silent failure; empty suggestions is the correct UX on error
  const fetchSuggestions = useCallback((q) => {
    clearTimeout(debounceRef.current)
    if (q.trim().length < 2) {
      setSuggestions([])
      setOpen(false)
      setActiveIndex(-1)
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await api.autocompleteGenes(q.trim(), limit)
        const list = (r?.data || r || []).slice(0, limit)
        setSuggestions(list)
        setOpen(list.length > 0)
        setActiveIndex(-1)
      } catch {
        setSuggestions([])
        setOpen(false)
      }
    }, debounceMs)
  }, [debounceMs, limit])

  function handleChange(e) {
    onChange?.(e)
    fetchSuggestions(e.target.value)
  }

  function select(sym) {
    clearTimeout(debounceRef.current)
    setSuggestions([])
    setOpen(false)
    setActiveIndex(-1)
    onSelect?.(sym)
  }

  function handleKeyDown(e) {
    externalKeyDown?.(e)
    if (!open) {
      if (e.key === 'Escape') {
        setActiveIndex(-1)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault()
        select(suggestions[activeIndex].symbol)
      }
      // If no active option, let the form's onSubmit handle it
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      setActiveIndex(-1)
      inputRef.current?.focus()
    } else if (e.key === 'Tab') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  function handleBlur() {
    // Delay so mousedown on list items fires first
    setTimeout(() => {
      setOpen(false)
      setActiveIndex(-1)
    }, 150)
  }

  const activeSym = activeIndex >= 0 && suggestions[activeIndex]
    ? `ga-opt-${uid}-${activeIndex}`
    : undefined

  const resolvedInputCls = inputClassName || className || ''

  return (
    <div className="relative">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-gray-600 mb-1">
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeSym}
        aria-label={!label ? (ariaLabel || placeholder) : undefined}
        autoComplete="off"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        className={resolvedInputCls}
      />
      <ul
        id={listboxId}
        role="listbox"
        aria-label="Gene suggestions"
        hidden={!open}
        className={`absolute z-50 left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto ${
          mobile ? 'w-full' : 'w-60 max-w-[80vw]'
        }`}
      >
        {suggestions.map((s, i) => (
          <li
            key={s.symbol || s.gene_id}
            id={`ga-opt-${uid}-${i}`}
            role="option"
            aria-selected={i === activeIndex}
            onMouseDown={(e) => {
              // Prevent blur from firing before click completes
              e.preventDefault()
              select(s.symbol)
            }}
            onMouseEnter={() => setActiveIndex(i)}
            className={`px-3 py-2 cursor-pointer text-sm flex items-baseline gap-2 ${
              i === activeIndex ? 'bg-blue-100' : 'hover:bg-blue-50'
            }`}
          >
            <span className="font-medium text-navy">{s.symbol}</span>
            {s.description && (
              <span className="text-gray-400 text-xs truncate">{s.description}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
