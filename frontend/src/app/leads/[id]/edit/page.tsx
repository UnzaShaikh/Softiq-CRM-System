"use client";

import {
  useState,
  useEffect,
} from "react";

import {
  useRouter,
  useParams,
} from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LeadForm from "@/components/leads/LeadForm";
import ThemeLoader from "@/components/ui/ThemeLoader";

import {
  ApiLead,
  LeadFormValues,
  toFormValues,
  toLead,
} from "@/data/leads";

import {
  apiRequest,
  getAccessToken,
} from "@/lib/api";

import {
  getCachedApiLead,
  setCachedLead,
} from "@/data/leadCache";

export default function EditLeadPage() {
  const router = useRouter();

  const params = useParams();

  const id = params?.id as string;

  const [initial, setInitial] =
    useState<LeadFormValues | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [hydrated, setHydrated] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState(false);

  /* =========================================================
     RESTORE CACHE + BACKGROUND REFRESH
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const cached =
      getCachedApiLead(id);

    if (cached) {
      /*
       * Cached API object already contains the
       * exact values required by the form.
       */
      setInitial(
        toFormValues(cached)
      );

      setLoading(false);
    } else {
      /*
       * First visit to this edit page.
       */
      setLoading(true);
    }

    setHydrated(true);

    const run = async () => {
      try {
        const data =
          await apiRequest<ApiLead>(
            `/api/leads/${id}/`
          );

        if (cancelled) return;

        const formValues =
          toFormValues(data);

        const lead =
          toLead(data);

        setInitial(formValues);
        setError(null);

        /*
         * Keep both detail and edit cache
         * synchronized with the backend.
         */
        setCachedLead(
          data,
          lead
        );
      } catch (err) {
        if (cancelled) return;

        /*
         * If cached data exists, don't destroy
         * the already-visible edit form.
         */
        if (!cached) {
          setError(
            (err as Error).message
          );
        }

        if (!getAccessToken()) {
          router.push("/login");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  /*
   * SSR-safe initial render.
   */
  if (!hydrated) {
    return (
      <DashboardLayout>
        <div
          style={{
            minHeight: 420,
          }}
        />
      </DashboardLayout>
    );
  }

  if (loading && !initial) {
    return (
      <DashboardLayout>
        <ThemeLoader label="Loading lead..." />
      </DashboardLayout>
    );
  }

  if (error && !initial) {
    return (
      <DashboardLayout>
        <div className="not-found-state">

          <p
            style={{
              fontSize: "3rem",
              margin: "0 0 12px",
            }}
          >
            🔍
          </p>

          <h2>
            Lead Not Found
          </h2>

          <p>
            No lead found with ID: {id}
          </p>

          <button
            className="btn-add"
            onClick={() =>
              router.push("/leads")
            }
          >
            Back to Leads
          </button>

        </div>
      </DashboardLayout>
    );
  }

  if (!initial) {
    return (
      <DashboardLayout>
        <ThemeLoader label="Loading lead..." />
      </DashboardLayout>
    );
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

        {/* Header */}
        <div>

          <button
            className="back-btn"
            onClick={() =>
              router.push(
                `/leads`
              )
            }
            style={{
              marginBottom: "8px",
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

            Back to Lead
          </button>

          <h1 className="page-title">
            Edit Lead
          </h1>

          <p className="page-subtitle">
            Update the lead details below.
          </p>

        </div>

        {/* Success */}
        {success && (
          <div className="msg-success">

            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>

            Changes saved successfully!
            Redirecting...

          </div>
        )}

        {/* Error */}
        {error && (
          <div className="msg-error">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="company-form-card">

          <div className="form-section">

            <div className="form-section-header">
              <h2>
                Lead Information
              </h2>

              <p>
                Update all the required
                fields below.
              </p>
            </div>

            <LeadForm
              leadId={id}
              initial={initial}
              submitLabel="Save Changes"

              onSuccess={(updatedLead) => {
                /*
                 * LeadForm already returns the
                 * updated ApiLead after PATCH.
                 *
                 * Update the cache immediately.
                 */
                if (updatedLead) {
                  const frontendLead =
                    toLead(
                      updatedLead
                    );

                  setCachedLead(
                    updatedLead,
                    frontendLead
                  );
                }

                setSuccess(true);

                setTimeout(() => {
                  router.push(
                    `/leads/`
                  );
                }, 1800);
              }}

              onCancel={() =>
                router.push(
                  `/leads`
                )
              }
            />

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}