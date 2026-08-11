"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search companies...",
}: SearchBarProps) {
  return (
    <div className="contacts-search-wrap">
      <Search size={19} className="contacts-search-icon" />

      <input
        type="text"
        className="contacts-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Search companies"
      />
    </div>
  );
}
