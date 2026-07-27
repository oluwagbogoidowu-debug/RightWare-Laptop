import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, Plus } from 'lucide-react';

interface CustomSelectProps {
  label?: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
  allowCustom?: boolean;
  customPlaceholder?: string;
  required?: boolean;
  className?: string;
}

export function CustomSelect({
  label,
  value,
  options,
  onChange,
  placeholder = '-- Select --',
  allowCustom = true,
  customPlaceholder = 'Type custom value...',
  required = false,
  className = ''
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isValueInOptions = options.includes(value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
          {label} {required && '*'}
        </label>
      )}

      {/* Select Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] flex items-center justify-between text-left focus:outline-hidden focus:border-[#111111] cursor-pointer hover:border-neutral-400 transition-colors"
      >
        <span className={`truncate ${!value ? 'text-neutral-400' : 'font-semibold'}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-neutral-500 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-[#FF3B30]' : ''
          }`}
        />
      </button>

      {/* Downward Dropdown Menu - Attached inside layout flow */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#111111] shadow-xl z-50 max-h-64 overflow-hidden flex flex-col transition-all">
          {options.length > 5 && (
            <div className="p-1.5 border-b border-[#E5E5E5] bg-neutral-50 flex items-center space-x-1.5 sticky top-0 z-10">
              <Search className="h-3 w-3 text-neutral-400 shrink-0 ml-1" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search list..."
                className="w-full bg-transparent border-none py-1 font-sans text-xs text-[#111111] focus:outline-hidden placeholder-neutral-400"
                autoFocus
              />
            </div>
          )}

          <div className="overflow-y-auto max-h-48 py-1 divide-y divide-neutral-100">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setIsCustomMode(false);
                    onChange(option);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full text-left px-3 py-2 font-sans text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    value === option
                      ? 'bg-neutral-100 font-bold text-[#111111]'
                      : 'hover:bg-neutral-50 text-neutral-800'
                  }`}
                >
                  <span className="truncate">{option}</span>
                  {value === option && <Check className="h-3.5 w-3.5 text-[#FF3B30] shrink-0 ml-2" />}
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-xs font-mono text-neutral-400">
                No matching option found
              </div>
            )}

            {allowCustom && (
              <button
                type="button"
                onClick={() => {
                  setIsCustomMode(true);
                  onChange('');
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="w-full text-left px-3 py-2 font-mono text-xs text-[#FF3B30] font-bold hover:bg-red-50 flex items-center space-x-1.5 cursor-pointer bg-neutral-50"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Custom / Other Value...</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Input field for custom entries */}
      {allowCustom && (isCustomMode || (value !== '' && !isValueInOptions)) && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={customPlaceholder}
          className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111] mt-2"
          autoFocus
        />
      )}
    </div>
  );
}
