"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search customers by name, email, or company…",
  resultCount,
}: SearchBarProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
      {/* Search input */}
      <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
        {/* Search icon */}
        <svg
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#94a3b8",
            pointerEvents: "none",
            flexShrink: 0,
          }}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "9px 36px 9px 38px",
            border: "1.5px solid #e2e8f0",
            borderRadius: "8px",
            background: "#f8fafc",
            color: "#0f172a",
            fontSize: "0.875rem",
            fontFamily: "inherit",
            outline: "none",
            transition: "border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#4f46e5";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.12)";
            e.currentTarget.style.background = "#ffffff";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.background = "#f8fafc";
          }}
        />

        {/* Clear button — shown when there's a value */}
        {value && (
          <button
            onClick={() => onChange("")}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "#e2e8f0",
              border: "none",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748b",
              padding: 0,
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "#cbd5e1")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "#e2e8f0")
            }
            title="Clear search"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Result count pill */}
      {resultCount !== undefined && (
        <span
          style={{
            fontSize: "0.8125rem",
            color: "#64748b",
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
            borderRadius: "9999px",
            padding: "4px 12px",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {resultCount} result{resultCount !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
