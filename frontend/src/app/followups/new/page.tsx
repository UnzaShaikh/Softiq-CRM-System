"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FormField from "@/components/customers/FormField";

import {
  FollowupType,
  FollowupStatus,
  FollowupPriority,
} from "@/data/followups";

import {
  createFollowUp,
  mapFollowUp,
  toTypeValue,
  toStatusValue,
  toPriorityValue,
  parseRelatedKey,
  getCustomerOptions,
  getLeadOptions,
  getDealOptions,
  getCompanyOptions,
  type RelatedOption,
  type CompanyOption,
} from "@/lib/followupsApi";

import {
  addCachedFollowup,
} from "@/data/followupCache";

interface FormValues {
  subject: string;
  relatedKey: string;
  companyId: string;
  type: FollowupType | "";
  status: FollowupStatus | "";
  priority: FollowupPriority | "";
  dueDate: string;
  dueTime: string;
  notes: string;
}

interface FormErrors {
  subject?: string;
  relatedKey?: string;
  type?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
}

const EMPTY_FORM: FormValues = {
  subject: "",
  relatedKey: "",
  companyId: "",
  type: "",
  status: "",
  priority: "",
  dueDate: "",
  dueTime: "",
  notes: "",
};

export default function AddFollowupPage() {
  const router = useRouter();

  const [form, setForm] =
    useState<FormValues>(
      EMPTY_FORM
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [saving, setSaving] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  const [relatedOptions, setRelatedOptions] =
    useState<RelatedOption[]>([]);

  const [companies, setCompanies] =
    useState<CompanyOption[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      const [
        customers,
        leads,
        deals,
        companyOptions,
      ] = await Promise.all([
        getCustomerOptions().catch(
          () =>
            [] as RelatedOption[]
        ),

        getLeadOptions().catch(
          () =>
            [] as RelatedOption[]
        ),

        getDealOptions().catch(
          () =>
            [] as RelatedOption[]
        ),

        getCompanyOptions().catch(
          () =>
            [] as CompanyOption[]
        ),
      ]);

      if (cancelled) {
        return;
      }

      setRelatedOptions([
        ...customers,
        ...leads,
        ...deals,
      ]);

      setCompanies(
        companyOptions
      );
    }

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) {
    const {
      name,
      value,
    } = event.target;

    setForm(prev => ({
      ...prev,
      [name]: value,
    }));

    if (
      errors[
        name as keyof FormErrors
      ]
    ) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  }

  function validate(): boolean {
    const nextErrors: FormErrors =
      {};

    if (!form.subject.trim()) {
      nextErrors.subject =
        "Subject is required";
    }

    if (!form.relatedKey) {
      nextErrors.relatedKey =
        "Please select a related record";
    }

    if (!form.type) {
      nextErrors.type =
        "Please select a type";
    }

    if (!form.status) {
      nextErrors.status =
        "Please select a status";
    }

    if (!form.priority) {
      nextErrors.priority =
        "Please select a priority";
    }

    if (!form.dueDate) {
      nextErrors.dueDate =
        "Due date is required";
    }

    setErrors(
      nextErrors
    );

    return (
      Object.keys(
        nextErrors
      ).length === 0
    );
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setSubmitError("");

    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      const created =
        await createFollowUp({
          subject:
            form.subject.trim(),

          notes:
            form.notes,

          ...parseRelatedKey(
            form.relatedKey
          ),

          company:
            form.companyId
              ? Number(
                  form.companyId
                )
              : null,

          type:
            toTypeValue(
              form.type
            ),

          status:
            toStatusValue(
              form.status
            ),

          priority:
            toPriorityValue(
              form.priority
            ),

          due_date:
            form.dueDate,

          due_time:
            form.dueTime ||
            null,
        });

      /*
       * Save the actual backend record
       * immediately into cache.
       */
      const mapped =
        mapFollowUp(
          created
        );

      addCachedFollowup(
        mapped
      );

      setSuccess(true);

      /*
       * No artificial 1.2 second delay.
       */
      router.push(
        `/followups/${created.id}`
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to create follow-up."
      );

      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div>
          <button
            className="back-btn"
            onClick={() =>
              router.push(
                "/followups"
              )
            }
            style={{
              marginBottom:
                "8px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>

            Back to Follow-ups
          </button>

          <h1 className="page-title">
            Create Follow-up
          </h1>

          <p className="page-subtitle">
            Fill in the details to
            schedule a new follow-up.
          </p>
        </div>

        {success && (
          <div className="msg-success">
            Follow-up created
            successfully.
          </div>
        )}

        {submitError && (
          <div className="msg-error">
            {submitError}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          noValidate
          className="company-form-card"
        >
          <div className="form-section">
            <div className="form-section-header">
              <h2>
                Follow-up Details
              </h2>

              <p>
                Fill in all the
                required fields below.
              </p>
            </div>

            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                gap:
                  "20px",
              }}
            >
              <FormField
                label="Subject"
                name="subject"
                value={
                  form.subject
                }
                onChange={
                  handleChange
                }
                error={
                  errors.subject
                }
                placeholder="e.g. Product Demo Follow-up"
                required
              />

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">
                    Related To{" "}
                    <span
                      style={{
                        color:
                          "var(--error)",
                      }}
                    >
                      *
                    </span>
                  </label>

                  <select
                    name="relatedKey"
                    value={
                      form.relatedKey
                    }
                    onChange={
                      handleChange
                    }
                    className={`form-input${
                      errors.relatedKey
                        ? " error"
                        : ""
                    }`}
                  >
                    <option value="">
                      Select customer,
                      lead, or deal
                    </option>

                    <optgroup label="Customers">
                      {relatedOptions
                        .filter(
                          option =>
                            option.key.startsWith(
                              "customer:"
                            )
                        )
                        .map(
                          option => (
                            <option
                              key={
                                option.key
                              }
                              value={
                                option.key
                              }
                            >
                              {
                                option.name
                              }
                              {option.detail
                                ? ` — ${option.detail}`
                                : ""}
                            </option>
                          )
                        )}
                    </optgroup>

                    <optgroup label="Leads">
                      {relatedOptions
                        .filter(
                          option =>
                            option.key.startsWith(
                              "lead:"
                            )
                        )
                        .map(
                          option => (
                            <option
                              key={
                                option.key
                              }
                              value={
                                option.key
                              }
                            >
                              {
                                option.name
                              }
                              {option.detail
                                ? ` — ${option.detail}`
                                : ""}
                            </option>
                          )
                        )}
                    </optgroup>

                    <optgroup label="Deals">
                      {relatedOptions
                        .filter(
                          option =>
                            option.key.startsWith(
                              "deal:"
                            )
                        )
                        .map(
                          option => (
                            <option
                              key={
                                option.key
                              }
                              value={
                                option.key
                              }
                            >
                              {
                                option.name
                              }
                            </option>
                          )
                        )}
                    </optgroup>
                  </select>

                  {errors.relatedKey && (
                    <p className="form-error">
                      {
                        errors.relatedKey
                      }
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Company
                  </label>

                  <select
                    name="companyId"
                    value={
                      form.companyId
                    }
                    onChange={
                      handleChange
                    }
                    className="form-input"
                  >
                    <option value="">
                      No company
                    </option>

                    {companies.map(
                      company => (
                        <option
                          key={
                            company.id
                          }
                          value={String(
                            company.id
                          )}
                        >
                          {
                            company.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <FormField
                  label="Type"
                  name="type"
                  type="select"
                  value={
                    form.type
                  }
                  onChange={
                    handleChange
                  }
                  error={
                    errors.type
                  }
                  required
                  options={[
                    "Call",
                    "Email",
                    "Meeting",
                    "Task",
                    "Follow-up",
                  ].map(
                    value => ({
                      label:
                        value,
                      value,
                    })
                  )}
                />

                <FormField
                  label="Priority"
                  name="priority"
                  type="select"
                  value={
                    form.priority
                  }
                  onChange={
                    handleChange
                  }
                  error={
                    errors.priority
                  }
                  required
                  options={[
                    {
                      label:
                        "High",
                      value:
                        "High",
                    },
                    {
                      label:
                        "Medium",
                      value:
                        "Medium",
                    },
                    {
                      label:
                        "Low",
                      value:
                        "Low",
                    },
                  ]}
                />
              </div>

              <div className="form-row-2">
                <FormField
                  label="Status"
                  name="status"
                  type="select"
                  value={
                    form.status
                  }
                  onChange={
                    handleChange
                  }
                  error={
                    errors.status
                  }
                  required
                  options={[
                    "Upcoming",
                    "Completed",
                    "Overdue",
                    "Cancelled",
                  ].map(
                    value => ({
                      label:
                        value,
                      value,
                    })
                  )}
                />

                <div className="form-group">
                  <label className="form-label">
                    Assigned To
                  </label>

                  <input
                    value="You (creator)"
                    disabled
                    className="form-input"
                    style={{
                      background:
                        "#f8fafc",
                      color:
                        "#94a3b8",
                      cursor:
                        "not-allowed",
                    }}
                  />

                  <p
                    className="form-error"
                    style={{
                      color:
                        "#94a3b8",
                    }}
                  >
                    Follow-ups are
                    assigned to you
                    when created.
                  </p>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">
                    Due Date{" "}
                    <span
                      style={{
                        color:
                          "var(--error)",
                      }}
                    >
                      *
                    </span>
                  </label>

                  <input
                    type="date"
                    name="dueDate"
                    value={
                      form.dueDate
                    }
                    onChange={
                      handleChange
                    }
                    className={`form-input${
                      errors.dueDate
                        ? " error"
                        : ""
                    }`}
                  />

                  {errors.dueDate && (
                    <p className="form-error">
                      {
                        errors.dueDate
                      }
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Due Time
                  </label>

                  <input
                    type="time"
                    name="dueTime"
                    value={
                      form.dueTime
                    }
                    onChange={
                      handleChange
                    }
                    className="form-input"
                  />
                </div>
              </div>

              <FormField
                label="Notes"
                name="notes"
                type="textarea"
                value={
                  form.notes
                }
                onChange={
                  handleChange
                }
                placeholder="Add any notes or details…"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                router.push(
                  "/followups"
                )
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-add"
              disabled={
                saving ||
                success
              }
            >
              {saving ? (
                <>
                  <span
                    style={{
                      width:
                        14,
                      height:
                        14,
                      border:
                        "2px solid rgba(255,255,255,0.45)",
                      borderTopColor:
                        "#fff",
                      borderRadius:
                        "50%",
                      animation:
                        "followup-spin 0.7s linear infinite",
                    }}
                  />

                  Creating...
                </>
              ) : (
                "Create Follow-up"
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes followup-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </DashboardLayout>
  );
}