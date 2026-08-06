"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  ApiLead,
  LeadFormValues,
  LeadStatus,
  LeadSource,
  STATUS_TO_API,
  SOURCE_TO_API,
} from "@/data/leads";

const EMPTY_FORM: LeadFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  company: "",
  source: "Website",
  status: "New",
  score: 0,
};

type FieldErrors = Partial<Record<keyof LeadFormValues, string>>;

const STATUS_OPTIONS: LeadStatus[] = ["New", "Contacted", "Qualified", "Lost"];
const SOURCE_OPTIONS: LeadSource[] = ["Website", "Referral", "Social Media", "Email", "Other"];

const S = {
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  },
  group: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.375rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#0f172a",
  },
  required: {
    color: "#ef4444",
  },
  input: (hasErr: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "0.625rem 0.875rem",
    borderRadius: "0.625rem",
    border: `1.5px solid ${hasErr ? "#ef4444" : "#e2e8f0"}`,
    background: hasErr ? "#fef2f2" : "#ffffff",
    color: "#0f172a",
    fontSize: "0.9375rem",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  }),
  hint: {
    fontSize: "0.75rem",
    color: "#94a3b8",
  },
  fieldErr: {
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
    fontSize: "0.8125rem",
    color: "#ef4444",
  },
  alertError: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.5rem",
    padding: "0.875rem 1rem",
    borderRadius: "0.625rem",
    background: "#fef2f2",
    border: "1px solid rgba(239,68,68,0.25)",
    color: "#b91c1c",
    fontSize: "0.875rem",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    paddingTop: "0.25rem",
  },
  cancelBtn: {
    padding: "0.625rem 1.25rem",
    borderRadius: "0.625rem",
    border: "1.5px solid #e2e8f0",
    background: "#ffffff",
    color: "#475569",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  submitBtn: (disabled: boolean): React.CSSProperties => ({
    padding: "0.625rem 1.5rem",
    borderRadius: "0.625rem",
    border: "none",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
    opacity: disabled ? 0.7 : 1,
  }),
};

function ErrIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

interface LeadFormProps {
  leadId?: string;
  initial?: LeadFormValues | null;
  submitLabel: string;
  onSuccess: (lead: ApiLead) => void;
  onCancel?: () => void;
}

export default function LeadForm({
  leadId,
  initial,
  submitLabel,
  onSuccess,
  onCancel,
}: LeadFormProps) {
  const isEdit = Boolean(leadId);
  const [form, setForm] = useState<LeadFormValues>(initial ?? EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [gError, setGError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof LeadFormValues>(k: K, v: LeadFormValues[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  }

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!form.first_name.trim()) e.first_name = "First name is required.";
    if (!form.last_name.trim()) e.last_name = "Last name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.phone.trim()) e.phone = "Phone is required.";
    if (Number.isNaN(form.score) || form.score < 0) e.score = "Score must be 0 or higher.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGError(null);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const payload = {
      ...form,
      source: SOURCE_TO_API[form.source],
      status: STATUS_TO_API[form.status],
      score: Number(form.score),
    };
    try {
      const url = isEdit ? `/api/leads/${leadId}/` : "/api/leads/";
      const lead = await apiRequest<ApiLead>(url, {
        method: isEdit ? "PATCH" : "POST",
        body: payload,
      });
      onSuccess(lead);
    } catch (err) {
      setGError((err as Error).message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function fieldErr(key: keyof LeadFormValues): string | undefined {
    return errors[key];
  }

  return (
    <form onSubmit={handleSubmit} style={S.form}>
      {gError && (
        <div style={S.alertError}>
          <ErrIcon />
          <span>{gError}</span>
        </div>
      )}

      <div style={S.row}>
        <div style={S.group}>
          <label style={S.label}>
            First name <span style={S.required}>*</span>
          </label>
          <input
            type="text"
            value={form.first_name}
            onChange={(e) => set("first_name", e.target.value)}
            style={S.input(!!fieldErr("first_name"))}
            placeholder="e.g. Ahmed"
          />
          {fieldErr("first_name") && (
            <span style={S.fieldErr}>
              <ErrIcon />
              {fieldErr("first_name")}
            </span>
          )}
        </div>

        <div style={S.group}>
          <label style={S.label}>
            Last name <span style={S.required}>*</span>
          </label>
          <input
            type="text"
            value={form.last_name}
            onChange={(e) => set("last_name", e.target.value)}
            style={S.input(!!fieldErr("last_name"))}
            placeholder="e.g. Ali"
          />
          {fieldErr("last_name") && (
            <span style={S.fieldErr}>
              <ErrIcon />
              {fieldErr("last_name")}
            </span>
          )}
        </div>
      </div>

      <div style={S.row}>
        <div style={S.group}>
          <label style={S.label}>
            Email <span style={S.required}>*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            style={S.input(!!fieldErr("email"))}
            placeholder="e.g. ahmed@company.com"
          />
          {fieldErr("email") && (
            <span style={S.fieldErr}>
              <ErrIcon />
              {fieldErr("email")}
            </span>
          )}
        </div>

        <div style={S.group}>
          <label style={S.label}>
            Phone <span style={S.required}>*</span>
          </label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            style={S.input(!!fieldErr("phone"))}
            placeholder="e.g. +92 300 1234567"
          />
          {fieldErr("phone") && (
            <span style={S.fieldErr}>
              <ErrIcon />
              {fieldErr("phone")}
            </span>
          )}
        </div>
      </div>

      <div style={S.row}>
        <div style={S.group}>
          <label style={S.label}>Company</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
            style={S.input(false)}
            placeholder="e.g. TechVision Pvt Ltd"
          />
        </div>

        <div style={S.group}>
          <label style={S.label}>Source</label>
          <select
            value={form.source}
            onChange={(e) => set("source", e.target.value as LeadSource)}
            style={{ ...S.input(false), cursor: "pointer" }}
          >
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={S.row}>
        <div style={S.group}>
          <label style={S.label}>Status</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value as LeadStatus)}
            style={{ ...S.input(false), cursor: "pointer" }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span style={S.hint}>New leads default to New.</span>
        </div>

        <div style={S.group}>
          <label style={S.label}>Score</label>
          <input
            type="number"
            min={0}
            value={form.score}
            onChange={(e) => set("score", Number(e.target.value))}
            style={S.input(!!fieldErr("score"))}
            placeholder="0"
          />
          {fieldErr("score") && (
            <span style={S.fieldErr}>
              <ErrIcon />
              {fieldErr("score")}
            </span>
          )}
        </div>
      </div>

      <div style={S.actions}>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={loading} style={S.cancelBtn}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={loading} style={S.submitBtn(loading)}>
          {loading ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
