"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronsUpDown, Check, Search } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
}

export default function Combobox({
  options,
  value,
  onChange,
  placeholder = "Seleccionar opción...",
  searchPlaceholder = "Buscar...",
  emptyText = "No se encontraron resultados."
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="input-field"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          color: value ? '#0f172a' : '#94a3b8',
          height: '40px'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedLabel}
        </span>
        <ChevronsUpDown size={16} color="#94a3b8" style={{ flexShrink: 0, marginLeft: '8px' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 50,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '300px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>
            <Search size={16} color="#94a3b8" style={{ marginRight: '8px' }} />
            <input 
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '0.875rem',
                color: '#0f172a'
              }}
            />
          </div>
          
          <div style={{ overflowY: 'auto', padding: '4px' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                {emptyText}
              </div>
            ) : (
              filteredOptions.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    backgroundColor: value === opt.value ? '#f1f5f9' : 'transparent',
                    fontSize: '0.875rem',
                    color: '#0f172a'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = value === opt.value ? '#f1f5f9' : 'transparent'}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {opt.label}
                  </span>
                  {value === opt.value && <Check size={16} color="#0f172a" style={{ flexShrink: 0, marginLeft: '8px' }} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
