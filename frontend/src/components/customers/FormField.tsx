"use client";

import React from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "select" | "textarea";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
  disabled?: boolean;
}

export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  options,
  required,
  disabled,
}: FormFieldProps) {
  const baseInputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: `1.5px solid ${error ? "#fca5a5" : "#e2e8f0"}`,
    borderRadius: "8px",
    background: disabled ? "#f8fafc" : error ? "#fff5f5" : "#fff",
    color: "#0f172a",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {/* Label */}
      <label
        htmlFor={name}
        style={{
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "#374151",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>
        )}
      </label>

      {/* Input / Select / Textarea */}
      {type === "select" ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{ ...baseInputStyle, cursor: disabled ? "not-allowed" : "pointer" }}
          onFocus={(e) => {
            if (!error) e.currentTarget.style.borderColor = "#4f46e5";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
          }}
          onBlur={(e) => {
            if (!error) e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <option value="">Select {label}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={4}
          style={{
            ...baseInputStyle,
            resize: "vertical",
            minHeight: "100px",
          }}
          onFocus={(e) => {
            if (!error) e.currentTarget.style.borderColor = "#4f46e5";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
          }}
          onBlur={(e) => {
            if (!error) e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          style={{ ...baseInputStyle, cursor: disabled ? "not-allowed" : "text" }}
          onFocus={(e) => {
            if (!error) e.currentTarget.style.borderColor = "#4f46e5";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
          }}
          onBlur={(e) => {
            if (!error) e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      )}

      {/* Error message */}
      {error && (
        <p
          style={{
            margin: 0,
            fontSize: "0.775rem",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
