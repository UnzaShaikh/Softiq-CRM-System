"use client";

import {
  useState,
} from "react";

import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import {
  ALL_CATEGORIES,
  AVAILABLE_VARIABLES,
  TemplateCategory,
  TemplateType,
  TemplateStatus,
} from "@/data/emailTemplates";

import {
  createEmailTemplate,
  CATEGORY_VALUES,
  TYPE_VALUES,
  STATUS_VALUES,
  mapEmailTemplateDetail,
} from "@/lib/emailTemplatesApi";

function extractTemplateVariables(content: string): string[] {
  if (!content) return [];

  const variables = content.match(/\{\{\s*[^{}]+\s*\}\}/g) ?? [];

  return Array.from(
    new Set(
      variables.map((variable) =>
        variable
          .replace(/^\{\{\s*/, "")
          .replace(/\s*\}\}$/, "")
          .trim()
      )
    )
  );
}

import {
  upsertCachedEmailTemplate,
} from "@/data/emailTemplatesCache";

import {
  HiChevronDown,
  HiSave,
  HiX,
} from "react-icons/hi";

interface FormValues {
  name: string;
  subject: string;
  content: string;
  category: TemplateCategory | "";
  type: TemplateType;
  status: TemplateStatus;
  description: string;
}

interface FormErrors {
  name?: string;
  subject?: string;
  content?: string;
  category?: string;
}

export default function AddEmailTemplatePage() {
  const router = useRouter();

  const [form, setForm] =
    useState<FormValues>({
      name: "",
      subject: "",
      content: "",
      category: "",
      type: "Public",
      status: "Active",
      description: "",
    });

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [submitError, setSubmitError] =
    useState("");

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

  function insertVariable(
    variable: string
  ) {
    setForm(prev => ({
      ...prev,
      content:
        prev.content +
        variable,
    }));
  }

  function insertVariableInSubject(
    variable: string
  ) {
    setForm(prev => ({
      ...prev,
      subject:
        prev.subject +
        variable,
    }));
  }

  function validate(): boolean {
    const nextErrors: FormErrors =
      {};

    if (!form.name.trim()) {
      nextErrors.name =
        "Template name is required.";
    }

    if (!form.subject.trim()) {
      nextErrors.subject =
        "Subject is required.";
    }

    if (!form.content.trim()) {
      nextErrors.content =
        "Email content is required.";
    }

    if (!form.category) {
      nextErrors.category =
        "Please select a category.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors)
        .length === 0
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

    setLoading(true);

    try {
      const variables = extractTemplateVariables(
        `${form.subject}\n${form.content}`
      );

      const created =
        await createEmailTemplate({
          name:
            form.name.trim(),
          subject:
            form.subject.trim(),
          content:
            form.content,
          category: CATEGORY_VALUES[form.category as TemplateCategory],
          template_type:
            TYPE_VALUES[
              form.type
            ],
          status:
            STATUS_VALUES[
              form.status
            ],
          description:
            form.description.trim(),
          language: "en",
          variables_used:
            variables,
        });

      /*
       * Save the actual backend record
       * immediately into cache.
       */
      const mapped =
        mapEmailTemplateDetail(
          created
        );

      upsertCachedEmailTemplate(
        mapped
      );

      setSuccess(
        "Template saved successfully."
      );

      window.setTimeout(
        () => {
          router.push(
            "/email-templates"
          );
        },
        800
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to save template."
      );
    } finally {
      setLoading(false);
    }
  }

  const wordCount =
    form.content
      .split(/\s+/)
      .filter(Boolean)
      .length;

  return (
    <DashboardLayout>
      <div
        style={{
          maxWidth:
            "1100px",
          margin:
            "0 auto",
        }}
      >
        <div
          style={{
            display:
              "flex",
            alignItems:
              "flex-start",
            justifyContent:
              "space-between",
            marginBottom:
              "24px",
            flexWrap:
              "wrap",
            gap:
              "12px",
          }}
        >
          <div>
            <h1
              style={{
                margin:
                  "0 0 4px",
                fontSize:
                  "1.75rem",
                fontWeight:
                  700,
                color:
                  "#0f172a",
              }}
            >
              Create Email Template
            </h1>

            <p
              style={{
                margin: 0,
                color:
                  "#64748b",
                fontSize:
                  "0.9rem",
              }}
            >
              Create a new email template
              to save time and communicate
              consistently.
            </p>
          </div>

          <div
            style={{
              display:
                "flex",
              gap:
                "10px",
            }}
          >
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/email-templates"
                )
              }
              disabled={loading}
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap:
                  "6px",
                padding:
                  "9px 20px",
                border:
                  "1.5px solid #e2e8f0",
                borderRadius:
                  "8px",
                background:
                  "#fff",
                color:
                  "#475569",
                fontWeight:
                  600,
                fontSize:
                  "0.9rem",
                cursor:
                  loading
                    ? "wait"
                    : "pointer",
                fontFamily:
                  "inherit",
              }}
            >
              <HiX
                size={14}
              />
              Cancel
            </button>

            <button
              type="submit"
              form="template-form"
              disabled={
                loading ||
                !!success
              }
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap:
                  "6px",
                padding:
                  "9px 20px",
                border:
                  "none",
                borderRadius:
                  "8px",
                background:
                  "linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)",
                color:
                  "#fff",
                fontWeight:
                  600,
                fontSize:
                  "0.9rem",
                cursor:
                  loading
                    ? "wait"
                    : "pointer",
                fontFamily:
                  "inherit",
                opacity:
                  loading ||
                  success
                    ? 0.8
                    : 1,
              }}
            >
              <HiSave
                size={14}
              />
              {loading
                ? "Saving..."
                : success
                  ? "Saved!"
                  : "Save Template"}
            </button>
          </div>
        </div>

        {success && (
          <div
            className="msg-success"
            style={{
              marginBottom:
                "20px",
            }}
          >
            ✅ {success}
          </div>
        )}

        {submitError && (
          <div
            className="msg-error"
            style={{
              marginBottom:
                "20px",
            }}
          >
            ❌ {submitError}
          </div>
        )}

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "1fr 300px",
            gap:
              "20px",
          }}
        >
          <form
            id="template-form"
            onSubmit={
              handleSubmit
            }
            noValidate
            style={{
              display:
                "flex",
              flexDirection:
                "column",
              gap:
                "16px",
            }}
          >
            <div
              style={{
                background:
                  "#fff",
                border:
                  "1px solid #e2e8f0",
                borderRadius:
                  "12px",
                overflow:
                  "hidden",
              }}
            >
              <div
                style={{
                  padding:
                    "14px 18px",
                  borderBottom:
                    "1px solid #f1f5f9",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap:
                    "8px",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius:
                      "6px",
                    background:
                      "#eef2ff",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  📋
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize:
                      "0.95rem",
                    fontWeight:
                      700,
                    color:
                      "#0f172a",
                  }}
                >
                  Template Information
                </h2>
              </div>

              <div
                style={{
                  padding:
                    "20px",
                }}
              >
                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap:
                      "16px",
                    marginBottom:
                      "16px",
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">
                      Template Name{" "}
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
                      name="name"
                      value={
                        form.name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter template name"
                      className={`form-input${
                        errors.name
                          ? " error"
                          : ""
                      }`}
                    />

                    {errors.name && (
                      <p className="form-error">
                        {
                          errors.name
                        }
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Subject{" "}
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
                      name="subject"
                      value={
                        form.subject
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter email subject"
                      className={`form-input${
                        errors.subject
                          ? " error"
                          : ""
                      }`}
                    />

                    {errors.subject && (
                      <p className="form-error">
                        {
                          errors.subject
                        }
                      </p>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "space-between",
                      marginBottom:
                        "6px",
                    }}
                  >
                    <label className="form-label">
                      Email Content{" "}
                      <span
                        style={{
                          color:
                            "var(--error)",
                        }}
                      >
                        *
                      </span>
                    </label>

                    <div
                      style={{
                        position:
                          "relative",
                      }}
                    >
                      <select
                        value=""
                        onChange={event => {
                          if (
                            event.target
                              .value
                          ) {
                            insertVariable(
                              event
                                .target
                                .value
                            );
                          }
                        }}
                        style={{
                          padding:
                            "5px 30px 5px 9px",
                          border:
                            "1.5px solid #e2e8f0",
                          borderRadius:
                            "6px",
                          background:
                            "#fff",
                          color:
                            "#4f46e5",
                          fontSize:
                            "0.75rem",
                          fontFamily:
                            "inherit",
                          cursor:
                            "pointer",
                          appearance:
                            "none",
                        }}
                      >
                        <option value="">
                          Insert Variable
                        </option>

                        {AVAILABLE_VARIABLES.map(
                          variable => (
                            <option
                              key={
                                variable
                              }
                              value={
                                variable
                              }
                            >
                              {
                                variable
                              }
                            </option>
                          )
                        )}
                      </select>

                      <HiChevronDown
                        size={12}
                        style={{
                          position:
                            "absolute",
                          right:
                            "9px",
                          top:
                            "50%",
                          transform:
                            "translateY(-50%)",
                          pointerEvents:
                            "none",
                        }}
                      />
                    </div>
                  </div>

                  <textarea
                    name="content"
                    value={
                      form.content
                    }
                    onChange={
                      handleChange
                    }
                    rows={10}
                    placeholder="Type your email content here..."
                    className={`form-input${
                      errors.content
                        ? " error"
                        : ""
                    }`}
                    style={{
                      resize:
                        "vertical",
                      minHeight:
                        "220px",
                    }}
                  />

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      marginTop:
                        "4px",
                    }}
                  >
                    {errors.content && (
                      <p className="form-error">
                        {
                          errors.content
                        }
                      </p>
                    )}

                    <p
                      style={{
                        margin:
                          "0 0 0 auto",
                        fontSize:
                          "0.75rem",
                        color:
                          "#94a3b8",
                      }}
                    >
                      {
                        wordCount
                      }{" "}
                      words
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                background:
                  "#fff",
                border:
                  "1px solid #e2e8f0",
                borderRadius:
                  "12px",
                padding:
                  "16px 18px",
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 10px",
                  fontSize:
                    "0.875rem",
                  fontWeight:
                    700,
                  color:
                    "#0f172a",
                }}
              >
                Variables Guide
              </h3>

              <p
                style={{
                  margin:
                    "0 0 10px",
                  fontSize:
                    "0.8rem",
                  color:
                    "#64748b",
                }}
              >
                Use these variables
                to personalize emails.
              </p>

              <div
                style={{
                  display:
                    "flex",
                  flexWrap:
                    "wrap",
                  gap:
                    "8px",
                }}
              >
                {AVAILABLE_VARIABLES.map(
                  variable => (
                    <button
                      key={
                        variable
                      }
                      type="button"
                      onClick={() =>
                        insertVariable(
                          variable
                        )
                      }
                      style={{
                        padding:
                          "4px 12px",
                        border:
                          "1.5px solid #e2e8f0",
                        borderRadius:
                          "6px",
                        background:
                          "#f8fafc",
                        color:
                          "#4f46e5",
                        fontSize:
                          "0.8rem",
                        fontFamily:
                          "inherit",
                        cursor:
                          "pointer",
                        fontWeight:
                          500,
                      }}
                    >
                      {
                        variable
                      }
                    </button>
                  )
                )}
              </div>
            </div>
          </form>

          <div
            style={{
              display:
                "flex",
              flexDirection:
                "column",
              gap:
                "16px",
            }}
          >
            <div
              style={{
                background:
                  "#fff",
                border:
                  "1px solid #e2e8f0",
                borderRadius:
                  "12px",
                padding:
                  "18px",
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 16px",
                  fontSize:
                    "0.9rem",
                  fontWeight:
                    700,
                  color:
                    "#0f172a",
                }}
              >
                ⚙️ Template Settings
              </h3>

              <div
                className="form-group"
                style={{
                  marginBottom:
                    "16px",
                }}
              >
                <label className="form-label">
                  Category
                </label>

                <div
                  style={{
                    position:
                      "relative",
                  }}
                >
                  <select
                    name="category"
                    value={
                      form.category
                    }
                    onChange={
                      handleChange
                    }
                    style={{
                      width:
                        "100%",
                      padding:
                        "10px 32px 10px 12px",
                      border:
                        "1.5px solid #e2e8f0",
                      borderRadius:
                        "8px",
                      background:
                        "#fff",
                      color:
                        form.category
                          ? "#374151"
                          : "#94a3b8",
                      fontSize:
                        "0.875rem",
                      fontFamily:
                        "inherit",
                      outline:
                        "none",
                      appearance:
                        "none",
                      cursor:
                        "pointer",
                    }}
                  >
                    <option value="">
                      Select category
                    </option>

                    {ALL_CATEGORIES.map(
                      category => (
                        <option
                          key={
                            category
                          }
                          value={
                            category
                          }
                        >
                          {
                            category
                          }
                        </option>
                      )
                    )}
                  </select>

                  <HiChevronDown
                    size={14}
                    style={{
                      position:
                        "absolute",
                      right:
                        "10px",
                      top:
                        "50%",
                      transform:
                        "translateY(-50%)",
                      color:
                        "#64748b",
                      pointerEvents:
                        "none",
                    }}
                  />
                </div>

                {errors.category && (
                  <p className="form-error">
                    {
                      errors.category
                    }
                  </p>
                )}
              </div>

              <div
                style={{
                  marginBottom:
                    "16px",
                }}
              >
                <label
                  className="form-label"
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "8px",
                  }}
                >
                  Template Type
                </label>

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap:
                      "8px",
                  }}
                >
                  {(
                    [
                      "Public",
                      "Private",
                    ] as TemplateType[]
                  ).map(type => (
                    <button
                      key={
                        type
                      }
                      type="button"
                      onClick={() =>
                        setForm(
                          prev => ({
                            ...prev,
                            type,
                          })
                        )
                      }
                      style={{
                        padding:
                          "10px 8px",
                        border:
                          `2px solid ${
                            form.type ===
                            type
                              ? "#4f46e5"
                              : "#e2e8f0"
                          }`,
                        borderRadius:
                          "8px",
                        background:
                          form.type ===
                          type
                            ? "#eef2ff"
                            : "#fff",
                        cursor:
                          "pointer",
                        fontFamily:
                          "inherit",
                        textAlign:
                          "center",
                      }}
                    >
                      <p
                        style={{
                          margin:
                            "0 0 2px",
                          fontSize:
                            "0.8rem",
                          fontWeight:
                            700,
                          color:
                            form.type ===
                            type
                              ? "#4f46e5"
                              : "#374151",
                        }}
                      >
                        {type ===
                        "Public"
                          ? "👥"
                          : "🔒"}{" "}
                        {type}
                      </p>

                      <p
                        style={{
                          margin: 0,
                          fontSize:
                            "0.68rem",
                          color:
                            "#94a3b8",
                        }}
                      >
                        {type ===
                        "Public"
                          ? "Available to all users"
                          : "Only visible to you"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="form-label"
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "8px",
                  }}
                >
                  Status
                </label>

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setForm(
                        prev => ({
                          ...prev,
                          status:
                            prev.status ===
                            "Active"
                              ? "Inactive"
                              : "Active",
                        })
                      )
                    }
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius:
                        "9999px",
                      border:
                        "none",
                      background:
                        form.status ===
                        "Active"
                          ? "#4f46e5"
                          : "#e2e8f0",
                      cursor:
                        "pointer",
                      position:
                        "relative",
                    }}
                  >
                    <span
                      style={{
                        position:
                          "absolute",
                        top: 2,
                        left:
                          form.status ===
                          "Active"
                            ? 22
                            : 2,
                        width: 20,
                        height: 20,
                        borderRadius:
                          "50%",
                        background:
                          "#fff",
                        boxShadow:
                          "0 1px 3px rgba(0,0,0,0.2)",
                      }}
                    />
                  </button>

                  <span
                    style={{
                      fontSize:
                        "0.875rem",
                      fontWeight:
                        600,
                      color:
                        form.status ===
                        "Active"
                          ? "#16a34a"
                          : "#64748b",
                    }}
                  >
                    {
                      form.status
                    }
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                background:
                  "#fff",
                border:
                  "1px solid #e2e8f0",
                borderRadius:
                  "12px",
                padding:
                  "18px",
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 12px",
                  fontSize:
                    "0.9rem",
                  fontWeight:
                    700,
                  color:
                    "#0f172a",
                }}
              >
                👁️ Preview
              </h3>

              {form.content ? (
                <div
                  style={{
                    border:
                      "1px solid #e2e8f0",
                    borderRadius:
                      "8px",
                    padding:
                      "14px",
                    background:
                      "#fafafa",
                    fontSize:
                      "0.8rem",
                    color:
                      "#374151",
                    lineHeight:
                      1.8,
                    maxHeight:
                      "220px",
                    overflowY:
                      "auto",
                    whiteSpace:
                      "pre-wrap",
                  }}
                >
                  {form.content
                    .split(
                      /({{[^}]+}})/
                    )
                    .map(
                      (
                        part,
                        index
                      ) =>
                        part.startsWith(
                          "{{"
                        ) &&
                        part.endsWith(
                          "}}"
                        ) ? (
                          <span
                            key={
                              index
                            }
                            style={{
                              background:
                                "#fef3c7",
                              color:
                                "#b45309",
                              padding:
                                "1px 4px",
                              borderRadius:
                                "3px",
                              fontStyle:
                                "italic",
                            }}
                          >
                            [
                            {part.replace(
                              /[{}]/g,
                              ""
                            )}
                            ]
                          </span>
                        ) : (
                          part
                        )
                    )}
                </div>
              ) : (
                <div
                  style={{
                    border:
                      "1px solid #e2e8f0",
                    borderRadius:
                      "8px",
                    padding:
                      "24px",
                    background:
                      "#fafafa",
                    textAlign:
                      "center",
                  }}
                >
                  📧

                  <p
                    style={{
                      margin:
                        "8px 0 0",
                      fontSize:
                        "0.78rem",
                      color:
                        "#94a3b8",
                    }}
                  >
                    Your email preview
                    will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}