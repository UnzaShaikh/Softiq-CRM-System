"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
  useParams,
} from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import FormField from "@/components/customers/FormField";

import {
  FollowupType,
  FollowupStatus,
  FollowupPriority,
} from "@/data/followups";

import {
  getFollowUp,
  updateFollowUp,
  mapFollowUp,
  relatedKey,
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
  getCachedFollowup,
  updateCachedFollowup,
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

function timeToInput(
  value: string
): string {
  if (
    !value ||
    value === "—"
  ) {
    return "";
  }

  const match =
    value.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    );

  if (!match) {
    return value.slice(
      0,
      5
    );
  }

  let hour =
    Number(match[1]);

  const minute =
    match[2];

  const period =
    match[3].toUpperCase();

  if (
    period === "AM"
  ) {
    if (hour === 12) {
      hour = 0;
    }
  } else if (
    hour !== 12
  ) {
    hour += 12;
  }

  return `${String(
    hour
  ).padStart(2, "0")}:${minute}`;
}

function formFromCached(
  cached: NonNullable<
    ReturnType<
      typeof getCachedFollowup
    >
  >
): FormValues {
  return {
    subject:
      cached.subject,

    relatedKey:
      cached.relatedKey ??
      "",

    companyId:
      cached.companyId ??
      "",

    type:
      cached.type,

    status:
      cached.status,

    priority:
      cached.priority,

    dueDate:
      cached.dueDate,

    dueTime:
      timeToInput(
        cached.dueTime
      ),

    notes:
      cached.notes,
  };
}

export default function EditFollowupPage() {
  const router = useRouter();

  const params =
    useParams();

  const id =
    params?.id as string;

  const [form, setForm] =
    useState<FormValues>(
      EMPTY_FORM
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [notFound, setNotFound] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  const [relatedOptions, setRelatedOptions] =
    useState<RelatedOption[]>([]);

  const [companies, setCompanies] =
    useState<CompanyOption[]>([]);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    const cached =
      getCachedFollowup(id);

    /*
     * CACHE FIRST
     */
    if (cached) {
      setForm(
        formFromCached(
          cached
        )
      );

      setLoading(false);
      setNotFound(false);
    } else {
      setLoading(true);
    }

    /*
     * Load the actual record.
     *
     * If cache exists, this runs silently.
     */
    async function loadFollowup() {
      try {
        const data =
          await getFollowUp(
            id
          );

        if (cancelled) {
          return;
        }

        const mapped =
          mapFollowUp(
            data
          );

        /*
         * Always preserve relationship/company
         * information in cache.
         */
        mapped.relatedKey =
          relatedKey(data);

        mapped.companyId =
          data.company
            ? String(
                data.company
              )
            : "";

        updateCachedFollowup(
          mapped
        );

        /*
         * Backend wins after refresh.
         */
        setForm({
          subject:
            mapped.subject,

          relatedKey:
            mapped.relatedKey ??
            "",

          companyId:
            mapped.companyId ??
            "",

          type:
            mapped.type,

          status:
            mapped.status,

          priority:
            mapped.priority,

          dueDate:
            mapped.dueDate,

          dueTime:
            timeToInput(
              mapped.dueTime
            ),

          notes:
            mapped.notes,
        });

        setNotFound(false);
        setLoadError("");
        setLoading(false);
      } catch (error) {
        if (cancelled) {
          return;
        }

        /*
         * Cache remains usable.
         */
        if (cached) {
          setLoading(false);
          return;
        }

        if (
          error instanceof Error &&
          /not found|404/i.test(
            error.message
          )
        ) {
          setNotFound(true);
        } else {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Failed to load follow-up."
          );
        }

        setLoading(false);
      }
    }

    /*
     * Dropdowns are completely independent.
     */
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

      const combined = [
        ...customers,
        ...leads,
        ...deals,
      ];

      /*
       * Make sure cached selected relation
       * doesn't disappear if it isn't returned
       * by the options endpoint.
       */
      const cachedKey =
        cached?.relatedKey ??
        "";

      if (
        cachedKey &&
        !combined.some(
          option =>
            option.key ===
            cachedKey
        )
      ) {
        combined.push({
          key:
            cachedKey,

          name:
            cached?.relatedTo ||
            cached?.code ||
            cached?.id ||
            "Selected record",

          detail: "",
        });
      }

      setRelatedOptions(
        combined
      );

      setCompanies(
        companyOptions
      );
    }

    loadFollowup();
    loadOptions();

    return () => {
      cancelled = true;
    };
  }, [id]);

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

    if (!validate()) {
      return;
    }

    setSaving(true);
    setLoadError("");

    try {
      const updated =
        await updateFollowUp(
          id,
          {
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
          }
        );

      /*
       * IMPORTANT:
       * Cache the actual backend response
       * before navigating.
       */
      const mapped =
        mapFollowUp(
          updated
        );

      mapped.relatedKey =
        relatedKey(
          updated
        );

      mapped.companyId =
        updated.company
          ? String(
              updated.company
            )
          : "";

      updateCachedFollowup(
        mapped
      );

      setSuccess(true);

      /*
       * No artificial delay.
       *
       * View page gets data from cache
       * immediately.
       */
      router.push(
        `/followups/${id}`
      );
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to update follow-up."
      );

      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <ThemeLoader
          label="Loading follow-up..."
        />
      </DashboardLayout>
    );
  }

  if (notFound) {
    return (
      <DashboardLayout>
        <div className="not-found-state">
          <p
            style={{
              fontSize:
                "3rem",
              margin:
                "0 0 12px",
            }}
          >
            🔍
          </p>

          <h2>
            Follow-up Not Found
          </h2>

          <button
            className="btn-add"
            onClick={() =>
              router.push(
                "/followups"
              )
            }
          >
            Back to Follow-ups
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (
    loadError &&
    !form.subject
  ) {
    return (
      <DashboardLayout>
        <div className="not-found-state">
          <p
            style={{
              fontSize:
                "3rem",
              margin:
                "0 0 12px",
            }}
          >
            ⚠️
          </p>

          <h2>
            Something went wrong
          </h2>

          <p
            style={{
              color:
                "#64748b",
            }}
          >
            {loadError}
          </p>

          <button
            className="btn-add"
            onClick={() =>
              router.push(
                "/followups"
              )
            }
          >
            Back to Follow-ups
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
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
        <div>
          <button
            className="back-btn"
            onClick={() =>
              router.push(
                `/followups/${id}`
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

            Back to Follow-up
          </button>

          <h1 className="page-title">
            Edit Follow-up
          </h1>

          <p className="page-subtitle">
            Update the follow-up
            details below.
          </p>
        </div>

        {success && (
          <div className="msg-success">
            Changes saved
            successfully.
          </div>
        )}

        {loadError &&
          !saving && (
            <div className="msg-error">
              {loadError}
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
                Update all the
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
                  `/followups/${id}`
                )
              }
              disabled={
                saving
              }
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
                        "followup-edit-spin 0.7s linear infinite",
                    }}
                  />

                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes followup-edit-spin {
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