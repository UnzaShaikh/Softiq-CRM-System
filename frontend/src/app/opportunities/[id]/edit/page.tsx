"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { opportunities as oppData, OpportunityStage, OpportunityStatus } from "@/data/opportunities";

interface FormErrors {
  name?: string; customer?: string; value?: string;
  stage?: string; probability?: string; expectedCloseDate?: string; status?: string;
}

const selectStyle = {
  padding: "12px 14px", border: "1px solid #E5E7EB", borderRadius: "10px",
  background: "#fff", color: "#1F2937", fontSize: "14px",
  fontFamily: "inherit", outline: "none", width: "100%",
};

export default function EditOpportunityPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState<FormValues>({
    name: "", customerName: "", company: "", dealValue: "",
    stage: "", probability: "", expectedCloseDate: "",
    status: "", assignedTo: "", notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);

  useEffect(() => {
    const opp = oppData.find(o => o.id === id);
    if (!opp) { setNotFound(true); setLoading(false); return; }
    setForm({
      name: opp.name, customerName: opp.customerName, company: opp.company,
      dealValue: String(opp.dealValue), stage: opp.stage,
      probability: String(opp.probability), expectedCloseDate: opp.expectedCloseDate,
      status: opp.status, assignedTo: opp.assignedTo, notes: opp.notes,
    });
    setLoading(false);
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  function validate(): boolean {
    const f = form as OpportunityFormValues;
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Opportunity name is required.";
    if (!form.customerName.trim()) e.customerName = "Customer name is required.";
    if (!form.company.trim()) e.company = "Company is required.";
    if (!form.dealValue.trim()) e.dealValue = "Deal value is required.";
    else if (isNaN(Number(form.dealValue)) || Number(form.dealValue) < 0) e.dealValue = "Enter a valid amount.";
    if (!form.stage) e.stage = "Please select a stage.";
    if (!form.probability.trim()) e.probability = "Probability is required.";
    else if (isNaN(Number(form.probability)) || Number(form.probability) < 0 || Number(form.probability) > 100) e.probability = "Enter 0–100.";
    if (!form.expectedCloseDate) e.expectedCloseDate = "Close date is required.";
    if (!form.status) e.status = "Please select a status.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setSuccess("Opportunity updated successfully.");
    setTimeout(() => router.push(`/opportunities/${id}`), 1500);
  }

  if (loading) return (
    <DashboardLayout>
      <div className="loading-state">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
        Loading...
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </DashboardLayout>
  );

  if (notFound || !form) return (
    <DashboardLayout>
      <div className="not-found-state">
        <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>🔍</p>
        <h2>Opportunity Not Found</h2>
        <button className="save-company-btn" onClick={() => router.push("/opportunities")}>Back to Opportunities</button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="company-page">
        <div className="company-page-header">
          <div>
            <h1 className="company-page-title">Edit Opportunity</h1>
            <p className="company-page-subtitle">Update opportunity information.</p>
          </div>
          <button type="button" className="filter-btn" onClick={() => router.push(`/opportunities/${id}`)}>← Back</button>
        </div>

        <div className="company-form-card">
          {success && <div className="msg-success" role="status">✅ {success}</div>}

          <form onSubmit={handleSubmit} noValidate>

            {/* Opportunity Name */}
            <div className="form-group">
              <label htmlFor="name">Opportunity Name *</label>
              <input id="name" name="name" type="text" value={form.name} onChange={handleChange}
                placeholder="e.g. Enterprise CRM License"
                className={errors.name ? "input-error" : ""} disabled={saving} />
              {errors.name && <span className="form-field-error">{errors.name}</span>}
            </div>

            {/* Customer + Company */}
            <div className="company-form-card form-row">
              <div className="form-group">
                <label htmlFor="customerName">Customer Name *</label>
                <input id="customerName" name="customerName" type="text" value={form.customerName}
                  onChange={handleChange} className={errors.customerName ? "input-error" : ""} disabled={saving} />
                {errors.customerName && <span className="form-field-error">{errors.customerName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="company">Company *</label>
                <input id="company" name="company" type="text" value={form.company}
                  onChange={handleChange} className={errors.company ? "input-error" : ""} disabled={saving} />
                {errors.company && <span className="form-field-error">{errors.company}</span>}
              </div>
            </div>

            {/* Deal Value + Probability */}
            <div className="company-form-card form-row">
              <div className="form-group">
                <label htmlFor="dealValue">Deal Value ($) *</label>
                <input id="dealValue" name="dealValue" type="text" value={form.dealValue}
                  onChange={handleChange} className={errors.dealValue ? "input-error" : ""} disabled={saving} />
                {errors.dealValue && <span className="form-field-error">{errors.dealValue}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="probability">Probability (%) *</label>
                <input id="probability" name="probability" type="text" value={form.probability}
                  onChange={handleChange} className={errors.probability ? "input-error" : ""} disabled={saving} />
                {errors.probability && <span className="form-field-error">{errors.probability}</span>}
              </div>
            </div>

            {/* Stage + Status */}
            <div className="company-form-card form-row">
              <div className="form-group">
                <label htmlFor="stage">Stage *</label>
                <select id="stage" name="stage" value={form.stage} onChange={handleChange}
                  style={selectStyle} className={errors.stage ? "input-error" : ""} disabled={saving}>
                  <option value="">Select stage</option>
                  {["Prospecting","Qualification","Proposal","Negotiation","Closed Won","Closed Lost"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.stage && <span className="form-field-error">{errors.stage}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select id="status" name="status" value={form.status} onChange={handleChange}
                  style={selectStyle} className={errors.status ? "input-error" : ""} disabled={saving}>
                  <option value="">Select status</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {errors.status && <span className="form-field-error">{errors.status}</span>}
              </div>
            </div>

            {/* Close Date + Assigned To */}
            <div className="company-form-card form-row">
              <div className="form-group">
                <label htmlFor="expectedCloseDate">Expected Close Date *</label>
                <input id="expectedCloseDate" name="expectedCloseDate" type="date"
                  value={form.expectedCloseDate} onChange={handleChange}
                  style={{ padding: "12px 14px", border: "1px solid #E5E7EB", borderRadius: "10px", background: "#fff", color: "#1F2937", fontSize: "14px", fontFamily: "inherit", outline: "none", width: "100%" }}
                  className={errors.expectedCloseDate ? "input-error" : ""} disabled={saving} />
                {errors.expectedCloseDate && <span className="form-field-error">{errors.expectedCloseDate}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="assignedTo">Assigned To</label>
                <input id="assignedTo" name="assignedTo" type="text" value={form.assignedTo}
                  onChange={handleChange} disabled={saving} />
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea id="notes" name="notes" value={form.notes}
                onChange={handleChange} disabled={saving} />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button type="button" className="filter-btn" onClick={() => router.push(`/opportunities/${id}`)} disabled={saving}>Cancel</button>
              <button type="submit" className="save-company-btn" disabled={saving}>
                {saving ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving...</>
                ) : "Update Opportunity"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}
