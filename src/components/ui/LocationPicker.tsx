"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export interface LocationValue {
  location: string;
  lat: number | null;
  lng: number | null;
}

interface Suggestion {
  lat: number;
  lng: number;
  label: string;
  city: string;
}

interface Props {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
  placeholder?: string;
  inputClassName?: string;
}

export function LocationPicker({
  value,
  onChange,
  placeholder = "e.g. Berlin, Tokyo, New York…",
  inputClassName = "",
}: Props) {
  const [query, setQuery]           = useState(value.location);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen]             = useState(false);
  const [loading, setLoading]       = useState(false);
  const debounceRef                 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef                = useRef<HTMLDivElement>(null);

  // Sync external value changes (e.g. initial load)
  useEffect(() => {
    setQuery(value.location);
  }, [value.location]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data: Suggestion[] = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    // Clear coords when user types freely (not yet confirmed)
    onChange({ location: q, lat: null, lng: null });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 480);
  };

  const handleSelect = (s: Suggestion) => {
    setQuery(s.label);
    setSuggestions([]);
    setOpen(false);
    onChange({ location: s.label, lat: s.lat, lng: s.lng });
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasCoords = value.lat != null && value.lng != null;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={inputClassName}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
          {loading && (
            <svg className="w-3.5 h-3.5 animate-spin text-neutral-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          )}
          {hasCoords && !loading && (
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
              ✓ pinned
            </span>
          )}
        </div>
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white border border-neutral-200 rounded-2xl shadow-[0_8px_32px_rgba(26,25,24,0.10)] overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
              className="w-full text-left px-4 py-2.5 flex items-center gap-2.5 hover:bg-neutral-50 transition-colors border-b border-neutral-50 last:border-0"
            >
              <img
                src="/icons/iconsax-global-b704efed5310-.svg"
                alt=""
                className="w-3.5 h-3.5 shrink-0 brightness-0 opacity-25"
              />
              <span className="text-[13px] text-[#1A1918] truncate">{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
