"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Link from "next/link";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import CompanyForm from "@/components/company/CompanyForm";

import {
  apiErrorMessage,
  ApiCompany,
  CompanyFormValues,
  toCompany,
  toCompanyApiPayload,
  toCompanyFormValues,
} from "@/data/company";

import {
  getCachedCompany,
  setCachedCompany,
  subscribeCompanyCache,
} from "@/data/companyCache";

import {
  apiRequest,
  emitDataChanged,
  getAccessToken,
} from "@/lib/api";

export default function EditCompanyPage() {
  const params = useParams();
  const router = useRouter();

  const companyId = Number(params.id);

  const cachedCompany =
    useSyncExternalStore(
      subscribeCompanyCache,
      () =>
        companyId
          ? getCachedCompany(companyId)
          : null,
      () => null
    );

  const [initialData, setInitialData] =
    useState<CompanyFormValues | null>(
      null
    );

  const [fetching, setFetching] =
    useState(true);

  const [notFound, setNotFound] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [formRevision, setFormRevision] =
    useState(0);

  const cachedFormData =
    cachedCompany
      ? toCompanyFormValues(cachedCompany)
      : null;
  const displayFormData =
    initialData ?? cachedFormData;

  const missingId = !companyId;

  useEffect(() => {
    if (!companyId) return;

    let cancelled = false;

    /*
     * Cached company means the form can be shown
     * immediately without waiting for the API.
     */
    if (cachedCompany) {
      setInitialData(
        toCompanyFormValues(
          cachedCompany
        )
      );

      setFetching(false);
    }

    const run = async () => {
      try {
        const data =
          await apiRequest<ApiCompany>(
            `/api/companies/${companyId}/`
          );

        if (cancelled) return;

        const mapped =
          toCompany(data);

        setCachedCompany(mapped);

        setInitialData(
          toCompanyFormValues(data)
        );

        setFormRevision(
          (value) => value + 1
        );

        setNotFound(false);
      } catch (err) {
        if (cancelled) return;

        /*
         * Keep cached data if the background
         * refresh fails.
         */
        if (!cachedCompany) {
          setNotFound(true);
        }

        if (!getAccessToken()) {
          router.push("/login");
        }
      } finally {
        if (!cancelled) {
          setFetching(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    companyId,
    router,
    cachedCompany,
  ]);

  const handleSubmit = async (
    data: CompanyFormValues
  ) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const updated =
        await apiRequest<ApiCompany>(
          `/api/companies/${companyId}/`,
          {
            method: "PATCH",
            body:
              toCompanyApiPayload(data),
          }
        );

      /*
       * Update the individual cache immediately.
       */
      const mappedUpdated =
        toCompany(updated);

      setCachedCompany(mappedUpdated);

      /*
       * Also update the form state so the
       * next navigation is instant.
       */
      setInitialData(
        toCompanyFormValues(updated)
      );

      emitDataChanged();

      setSuccess(
        "Company updated successfully."
      );

      setTimeout(() => {
        router.push(
          `/company/${companyId}`
        );
      }, 1000);
    } catch (err) {
      setError(
        apiErrorMessage(err)
      );

      if (!getAccessToken()) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const notFoundView = (
    message: string
  ) => (
    <DashboardLayout>
      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              Company Not Found
            </h1>

            <p className="page-subtitle">
              {message}
            </p>
          </div>

          <Link href="/company">
            <button className="filter-btn">
              ← Back to Companies
            </button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );

  if (missingId || notFound) {
    return notFoundView(
      "We couldn't find a company with this ID."
    );
  }

  /*
   * Spinner is only shown when there is no
   * cached company/form data.
   */
  if (
    fetching &&
    !displayFormData
  ) {
    return (
      <DashboardLayout>
        <ThemeLoader label="Loading company..." />
      </DashboardLayout>
    );
  }

  if (!displayFormData) {
    return notFoundView(
      "We couldn't find a company with this ID."
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
        <div>
          <button
            className="back-btn"
            onClick={() =>
              router.push(
                `/company/${companyId}`
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

            Back to Company
          </button>

          <h1 className="page-title">
            Edit Company
          </h1>

          <p className="page-subtitle">
            Update company information.
          </p>
        </div>

        <CompanyForm
          key={`${companyId}-${formRevision}`}
          initialData={displayFormData}
          onSubmit={handleSubmit}
          submitText="Update Company"
          loading={loading}
          error={error}
          success={success}
        />
      </div>
    </DashboardLayout>
  );
}