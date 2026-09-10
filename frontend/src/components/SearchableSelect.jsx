import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function SearchableSelect({ options, value, onChange, placeholder = "Select...", className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  const selectedOption = options.find(o => o.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef}>
      <div 
        className="w-full bg-white shadow-inner border border-brand-500/50 rounded-lg px-3 py-1.5 min-h-[34px] text-xs text-gray-900 cursor-text flex items-center justify-between"
        onClick={() => setIsOpen(true)}
      >
        {isOpen ? (
          <input
            autoFocus
            type="text"
            className="w-full outline-none bg-transparent"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        ) : (
          <span className="truncate">{displayValue}</span>
        )}
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
      </div>

      {isOpen && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <li
                key={option.value}
                className={`px-3 py-2 text-xs cursor-pointer hover:bg-brand-50 hover:text-brand-700 flex justify-between items-center ${
                  option.value === value ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-700'
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearch('');
                }}
              >
                {option.label}
                {option.value === value && <Check className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 ml-2" />}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-xs text-gray-500">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
}
