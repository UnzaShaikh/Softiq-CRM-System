"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Build page number array with ellipsis logic
  function getPageNumbers(): (number | "...")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  }

  const btnBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "34px",
    height: "34px",
    padding: "0 8px",
    borderRadius: "7px",
    border: "1.5px solid #e2e8f0",
    background: "#ffffff",
    color: "#475569",
    fontSize: "0.8125rem",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "border-color 0.15s ease, background 0.15s ease, color 0.15s ease",
  };

  const activeBtnStyle: React.CSSProperties = {
    ...btnBase,
    background: "#4f46e5",
    borderColor: "#4f46e5",
    color: "#ffffff",
    fontWeight: 700,
    boxShadow: "0 2px 8px rgba(79,70,229,0.35)",
    cursor: "default",
  };

  const disabledBtnStyle: React.CSSProperties = {
    ...btnBase,
    opacity: 0.4,
    cursor: "not-allowed",
  };

  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        padding: "16px 0 4px",
      }}
    >
      {/* Left — info text */}
      <p
        style={{
          margin: 0,
          fontSize: "0.8125rem",
          color: "#64748b",
        }}
      >
        Showing{" "}
        <strong style={{ color: "#0f172a" }}>
          {startItem}–{endItem}
        </strong>{" "}
        of <strong style={{ color: "#0f172a" }}>{totalItems}</strong> customers
      </p>

      {/* Right — page buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={currentPage === 1 ? disabledBtnStyle : btnBase}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#4f46e5";
              (e.currentTarget as HTMLButtonElement).style.color = "#4f46e5";
              (e.currentTarget as HTMLButtonElement).style.background = "#eef2ff";
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
              (e.currentTarget as HTMLButtonElement).style.color = "#475569";
              (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
            }
          }}
          title="Previous page"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              style={{ padding: "0 4px", color: "#94a3b8", fontSize: "0.875rem", userSelect: "none" }}
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              style={page === currentPage ? activeBtnStyle : btnBase}
              onMouseEnter={(e) => {
                if (page !== currentPage) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#4f46e5";
                  (e.currentTarget as HTMLButtonElement).style.color = "#4f46e5";
                  (e.currentTarget as HTMLButtonElement).style.background = "#eef2ff";
                }
              }}
              onMouseLeave={(e) => {
                if (page !== currentPage) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
                  (e.currentTarget as HTMLButtonElement).style.color = "#475569";
                  (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
                }
              }}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={currentPage === totalPages ? disabledBtnStyle : btnBase}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#4f46e5";
              (e.currentTarget as HTMLButtonElement).style.color = "#4f46e5";
              (e.currentTarget as HTMLButtonElement).style.background = "#eef2ff";
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== totalPages) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
              (e.currentTarget as HTMLButtonElement).style.color = "#475569";
              (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
            }
          }}
          title="Next page"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
