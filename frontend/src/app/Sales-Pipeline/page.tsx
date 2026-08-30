"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Briefcase,
  Activity,
  DollarSign,
  Handshake,
  XCircle,
  Calendar,
  Download,
  FilePlus2,
  CheckCircle2,
  X,
  TrendingUp,
} from "lucide-react";
import { apiRequest, getAccessToken } from "@/lib/api";
import {
  getSalesPipelineCache,
  setSalesPipelineCache,
} from "@/data/pipelineCache";
const stagesConfig = [
  {
    name: "Lead",
    color: "bg-purple-500",
    hex: "#a855f7",
    stageBg: "bg-purple-100 text-purple-700",
  },
  {
    name: "Qualified",
    color: "bg-blue-500",
    hex: "#3b82f6",
    stageBg: "bg-blue-100 text-blue-700",
  },
  {
    name: "Proposal",
    color: "bg-sky-400",
    hex: "#38bdf8",
    stageBg: "bg-sky-100 text-sky-700",
  },
  {
    name: "Negotiation",
    color: "bg-amber-500",
    hex: "#f59e0b",
    stageBg: "bg-amber-100 text-amber-700",
  },
  {
    name: "Closed Won",
    color: "bg-emerald-500",
    hex: "#10b981",
    stageBg: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Closed Lost",
    color: "bg-rose-500",
    hex: "#f43f5e",
    stageBg: "bg-rose-100 text-rose-700",
  },
];

interface PipelineSummary {
  total_deals: number;
  total_pipeline_value: number | string;
  active_deals: number;
  closed_won: number;
  closed_lost: number;
}

interface PipelineTrendItem {
  current: number | string;
  previous: number | string;
  growth: number;
}

interface PipelineTrends {
  total_deals: PipelineTrendItem;
  pipeline_value: PipelineTrendItem;
  active_deals: PipelineTrendItem;
  closed_won: PipelineTrendItem;
  closed_lost: PipelineTrendItem;
}

interface StageDistribution {
  stage: string;
  deal_count: number;
  total_value: number | string;
  percentage: number;
}

interface RecentDeal {
  id: number;
  name: string;
  customer: string;
  company: string;
  deal_value: number | string;
  stage: string;
  expected_closing_date: string | null;
}

interface PipelinePerformance {
  months: string[];
  deals_created: number[];
  deals_closed: number[];
  revenue_generated: number[];
}

interface PipelineCacheSnapshot {
  summary: PipelineSummary | null;
  trends: PipelineTrends | null;
  stagesData: StageDistribution[] | null;
  recentDeals: RecentDeal[] | null;
  performance: PipelinePerformance | null;
}

const num = (
  value: number | string | null | undefined
): number => Number(value ?? 0) || 0;

const fmtMoney = (
  value: number | string | null | undefined
): string =>
  `$${num(value).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;

const fmtGrowth = (growth: number): string =>
  `${growth >= 0 ? "+" : ""}${growth}%`;

function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse bg-slate-200/60 rounded-lg ${className}`}
    />
  );
}

function KpiSkeleton() {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 min-w-0">
      <SkeletonBlock className="w-10 h-10 rounded-xl" />
      <SkeletonBlock className="h-3 w-20" />
      <SkeletonBlock className="h-7 w-24" />
      <SkeletonBlock className="h-4 w-28" />
    </div>
  );
}

function PieSkeleton() {
  return (
    <div className="flex items-center gap-2 my-2">
      <div className="space-y-2.5 flex-1">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-xs"
          >
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-3 w-14" />
          </div>
        ))}
      </div>

      <div className="w-36 h-36 flex items-center justify-center shrink-0">
        <SkeletonBlock className="w-36 h-36 rounded-full" />
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3"
        >
          <SkeletonBlock className="w-6 h-6 rounded-full shrink-0" />
          <SkeletonBlock className="h-3 flex-1" />
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return <SkeletonBlock className="h-64 w-full" />;
}

function SummaryCardSkeleton({
  iconBg,
}: {
  iconBg: string;
}) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-7 w-20" />
        <SkeletonBlock className="h-3 w-32" />
      </div>

      <div
        className={`p-3 rounded-xl ${iconBg}`}
      >
        <SkeletonBlock className="w-5 h-5" />
      </div>
    </div>
  );
}

function cacheKeyFor(
  isFiltered: boolean,
  startDate: string,
  endDate: string
): string {
  return isFiltered && startDate && endDate
    ? `range:${startDate}:${endDate}`
    : "all";
}

export default function SalesPipelinePage() {
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);

  const [startDate, setStartDate] =
    useState("");
  const [endDate, setEndDate] =
    useState("");
  const [isFiltered, setIsFiltered] =
    useState(false);
  const [showDatePicker, setShowDatePicker] =
    useState(false);
  const [showAllDeals, setShowAllDeals] =
    useState(false);

  const [summary, setSummary] =
    useState<PipelineSummary | null>(null);
  const [trends, setTrends] =
    useState<PipelineTrends | null>(null);
  const [stagesData, setStagesData] =
    useState<StageDistribution[] | null>(null);
  const [recentDeals, setRecentDeals] =
    useState<RecentDeal[] | null>(null);
  const [performance, setPerformance] =
    useState<PipelinePerformance | null>(null);

  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const cacheKey = cacheKeyFor(
    isFiltered,
    startDate,
    endDate
  );

  /*
   * Restore cached data only after hydration.
   * This keeps the server/client render identical and avoids
   * hydration mismatches caused by reading sessionStorage during render.
   */
  useEffect(() => {
    setHydrated(true);
  }, []);

  /*
   * Cache-first + stale-while-revalidate:
   *
   * Cached data is shown immediately when available.
   * The API still runs in the background so the backend remains
   * the source of truth.
   */
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    let cancelled = false;

    const cached =
      getSalesPipelineCache<PipelineCacheSnapshot>(
        cacheKey
      );

    if (cached) {
      setSummary(cached.summary);
      setTrends(cached.trends);
      setStagesData(cached.stagesData);
      setRecentDeals(cached.recentDeals);
      setPerformance(cached.performance);
      setLoading(false);
      setError(null);
    } else {
      setSummary(null);
      setTrends(null);
      setStagesData(null);
      setRecentDeals(null);
      setPerformance(null);
      setLoading(true);
    }

    const dateParams =
      isFiltered && startDate && endDate
        ? `?start_date=${encodeURIComponent(
            startDate
          )}&end_date=${encodeURIComponent(
            endDate
          )}`
        : "";

    const run = async () => {
      const next: PipelineCacheSnapshot = {
        summary: cached?.summary ?? null,
        trends: cached?.trends ?? null,
        stagesData: cached?.stagesData ?? null,
        recentDeals: cached?.recentDeals ?? null,
        performance: cached?.performance ?? null,
      };

      let successCount = 0;
      let firstError: unknown = null;

      const requests = await Promise.allSettled([
        apiRequest<PipelineSummary>(
          `/api/pipeline/summary/${dateParams}`
        ),
        apiRequest<PipelineTrends>(
          "/api/pipeline/trends/"
        ),
        apiRequest<StageDistribution[]>(
          `/api/pipeline/stages/${dateParams}`
        ),
        apiRequest<RecentDeal[]>(
          `/api/pipeline/recent-deals/${dateParams}`
        ),
        apiRequest<PipelinePerformance>(
          "/api/pipeline/performance/"
        ),
      ]);

      if (cancelled) {
        return;
      }

      const [
        summaryResult,
        trendsResult,
        stagesResult,
        recentDealsResult,
        performanceResult,
      ] = requests;

      if (
        summaryResult.status === "fulfilled"
      ) {
        next.summary = summaryResult.value;
        successCount += 1;
      } else {
        firstError ??= summaryResult.reason;
      }

      if (
        trendsResult.status === "fulfilled"
      ) {
        next.trends = trendsResult.value;
        successCount += 1;
      } else {
        firstError ??= trendsResult.reason;
      }

      if (
        stagesResult.status === "fulfilled"
      ) {
        next.stagesData = stagesResult.value;
        successCount += 1;
      } else {
        firstError ??= stagesResult.reason;
      }

      if (
        recentDealsResult.status === "fulfilled"
      ) {
        next.recentDeals =
          recentDealsResult.value;
        successCount += 1;
      } else {
        firstError ??= recentDealsResult.reason;
      }

      if (
        performanceResult.status === "fulfilled"
      ) {
        next.performance =
          performanceResult.value;
        successCount += 1;
      } else {
        firstError ??= performanceResult.reason;
      }

      setSummary(next.summary);
      setTrends(next.trends);
      setStagesData(next.stagesData);
      setRecentDeals(next.recentDeals);
      setPerformance(next.performance);

      if (successCount > 0) {
        setSalesPipelineCache(
          cacheKey,
          next
        );
        setError(null);
      }

      if (
        successCount === 0 &&
        !cached &&
        firstError
      ) {
        const message =
          firstError instanceof Error
            ? firstError.message
            : "Failed to load sales pipeline.";

        setError(message);

        if (!getAccessToken()) {
          router.push("/login");
        }
      }

      setLoading(false);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    hydrated,
    cacheKey,
    isFiltered,
    startDate,
    endDate,
    router,
  ]);

  const formatDateLabel = (
    dateStr: string
  ) => {
    if (!dateStr) {
      return "";
    }

    const date = new Date(dateStr);

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  const dateButtonLabel =
    isFiltered &&
    startDate &&
    endDate
      ? `${formatDateLabel(
          startDate
        )} – ${formatDateLabel(
          endDate
        )}, ${new Date(
          endDate
        ).getFullYear()}`
      : "All Dates";

  const totalPipelineValue = num(
    summary?.total_pipeline_value
  );

  const totalDealsCount =
    summary?.total_deals ?? 0;

  const activeDealsCount =
    summary?.active_deals ?? 0;

  const closedWonCount =
    summary?.closed_won ?? 0;

  const closedLostCount =
    summary?.closed_lost ?? 0;

  const growthOf = (
    trend?: PipelineTrendItem
  ) => trend?.growth ?? 0;

  const stats = [
    {
      label: "TOTAL DEALS",
      value: summary
        ? totalDealsCount.toString()
        : null,
      change: fmtGrowth(
        growthOf(trends?.total_deals)
      ),
      up:
        growthOf(
          trends?.total_deals
        ) >= 0,
      icon: Briefcase,
      iconColor:
        "text-indigo-600 bg-indigo-50/80",
    },
    {
      label: "TOTAL PIPELINE VALUE",
      value: summary
        ? fmtMoney(totalPipelineValue)
        : null,
      change: fmtGrowth(
        growthOf(
          trends?.pipeline_value
        )
      ),
      up:
        growthOf(
          trends?.pipeline_value
        ) >= 0,
      icon: DollarSign,
      iconColor:
        "text-green-600 bg-green-50/80",
    },
    {
      label: "ACTIVE DEALS",
      value: summary
        ? activeDealsCount.toString()
        : null,
      change: fmtGrowth(
        growthOf(
          trends?.active_deals
        )
      ),
      up:
        growthOf(
          trends?.active_deals
        ) >= 0,
      icon: Activity,
      iconColor:
        "text-cyan-600 bg-cyan-50/80",
    },
    {
      label: "CLOSED WON",
      value: summary
        ? String(closedWonCount)
        : null,
      change: fmtGrowth(
        growthOf(
          trends?.closed_won
        )
      ),
      up:
        growthOf(
          trends?.closed_won
        ) >= 0,
      icon: Handshake,
      iconColor:
        "text-amber-600 bg-amber-50/80",
    },
    {
      label: "CLOSED LOST",
      value: summary
        ? String(closedLostCount)
        : null,
      change: fmtGrowth(
        growthOf(
          trends?.closed_lost
        )
      ),
      up:
        growthOf(
          trends?.closed_lost
        ) >= 0,
      icon: XCircle,
      iconColor:
        "text-rose-600 bg-rose-50/80",
    },
  ];

  const stagesArr =
    stagesData ?? [];

  const stageMap = new Map(
    stagesArr.map((stage) => [
      stage.stage,
      stage,
    ])
  );

  const stages =
    stagesConfig.map((stageConfig) => {
      const api = stageMap.get(
        stageConfig.name
      );

      const rawValue = api
        ? num(api.total_value)
        : 0;

      return {
        ...stageConfig,
        count:
          api?.deal_count ?? 0,
        value:
          fmtMoney(rawValue),
        percentage: api
          ? `${api.percentage}%`
          : "0.0%",
        rawVal: rawValue,
      };
    });

  const pieData = stages
    .filter(
      (stage) => stage.rawVal > 0
    )
    .map((stage) => ({
      name: stage.name,
      value: stage.rawVal,
      color: stage.hex,
    }));

  const monthlyPerformanceData =
    performance
      ? performance.months.map(
          (month, index) => ({
            month,
            created:
              performance
                .deals_created[
                index
              ] ?? 0,
            closed:
              performance
                .deals_closed[
                index
              ] ?? 0,
            revenue: num(
              performance
                .revenue_generated[
                index
              ]
            ),
          })
        )
      : [];

  const totals =
    monthlyPerformanceData.reduce(
      (acc, month) => ({
        created:
          acc.created +
          month.created,
        closed:
          acc.closed +
          month.closed,
        revenue:
          acc.revenue +
          month.revenue,
      }),
      {
        created: 0,
        closed: 0,
        revenue: 0,
      }
    );

  const stageBgOf = (
    stageName: string
  ) =>
    stagesConfig.find(
      (stage) =>
        stage.name === stageName
    )?.stageBg ??
    "bg-slate-100 text-slate-700";

  const avatarBgOf = (
    index: number
  ) =>
    index % 2 === 0
      ? "bg-indigo-600"
      : "bg-blue-600";

  const handleShowAll = () => {
    setIsFiltered(false);
    setStartDate("");
    setEndDate("");
    setShowDatePicker(false);
  };

  const handleApplyFilter = () => {
    if (!startDate || !endDate) {
      return;
    }

    if (startDate > endDate) {
      setError(
        "The start date cannot be after the end date."
      );
      return;
    }

    setIsFiltered(true);
    setShowDatePicker(false);
  };

  const handleExport = async () => {
    if (!recentDeals) {
      return;
    }

    const XLSX =
      await import("xlsx");

    const exportData =
      recentDeals.map((deal) => ({
        "Deal Name":
          deal.name,
        Customer:
          deal.customer,
        Company:
          deal.company,
        "Deal Value ($)":
          num(
            deal.deal_value
          ),
        Stage:
          deal.stage,
        "Expected Close Date":
          deal.expected_closing_date ??
          "",
      }));

    const worksheet =
      XLSX.utils.json_to_sheet(
        exportData
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Sales Pipeline"
    );

    XLSX.writeFile(
      workbook,
      "Sales_Pipeline_Export.xlsx"
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 bg-slate-50 min-h-screen relative">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[2rem] font-bold text-slate-900 leading-tight">
              Sales Pipeline
            </h1>
            <p className="text-base text-slate-500 mt-1.5">
              Track every deal from lead to close.
            </p>
          </div>

          <div className="flex items-center gap-3 relative">
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowDatePicker(
                    (value) => !value
                  )
                }
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium shadow-sm hover:bg-slate-50 transition"
              >
                <Calendar size={16} />
                {dateButtonLabel}
              </button>

              {showDatePicker && (
                <div className="absolute right-0 mt-2 p-4 bg-white border border-slate-200 rounded-xl shadow-lg z-50 w-72 flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-xs font-bold text-slate-700">
                      Filter by Date
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setShowDatePicker(
                          false
                        )
                      }
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-500">
                      From:
                    </label>

                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) =>
                        setStartDate(
                          event.target
                            .value
                        )
                      }
                      className="text-xs border border-slate-200 rounded-md p-1.5 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-500">
                      To:
                    </label>

                    <input
                      type="date"
                      value={endDate}
                      onChange={(event) =>
                        setEndDate(
                          event.target
                            .value
                        )
                      }
                      className="text-xs border border-slate-200 rounded-md p-1.5 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={
                        handleShowAll
                      }
                      className="flex-1 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-200 transition"
                    >
                      Show All
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleApplyFilter
                      }
                      className="flex-1 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition"
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={
                handleExport
              }
              disabled={!recentDeals}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {!hydrated ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5"
            aria-hidden="true"
          >
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <KpiSkeleton
                key={index}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {!summary ||
              !trends ? (
                Array.from({
                  length: 5,
                }).map((_, index) => (
                  <KpiSkeleton
                    key={index}
                  />
                ))
              ) : (
                stats.map(
                  (item, index) => {
                    const Icon =
                      item.icon;

                    return (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 min-w-0"
                      >
                        <div
                          className={`w-10 h-10 flex items-center justify-center rounded-xl shrink-0 ${item.iconColor}`}
                        >
                          <Icon size={20} />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase leading-snug break-words">
                            {item.label}
                          </span>

                          <div className="text-2xl font-bold text-slate-900 mt-1 mb-1.5 break-words">
                            {item.value}
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                                item.up
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-rose-50 text-rose-600"
                              }`}
                            >
                              <TrendingUp
                                size={11}
                                className={
                                  item.up
                                    ? ""
                                    : "rotate-180"
                                }
                              />
                              {item.change}
                            </span>

                            <span className="text-xs text-slate-500">
                              vs last month
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-bold text-slate-800 text-lg">
                    Pipeline by Stage
                  </h2>

                  <select className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 outline-none">
                    <option>
                      All Time
                    </option>
                  </select>
                </div>

                {!stagesData ? (
                  <PieSkeleton />
                ) : (
                  <>
                    <div className="flex items-center gap-2 my-2">
                      <div className="space-y-2.5 flex-1">
                        {stages.map(
                          (
                            stage,
                            index
                          ) => (
                            <div
                              key={
                                index
                              }
                              className="flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${stage.color}`}
                                />
                                <span className="font-medium text-slate-700">
                                  {
                                    stage.name
                                  }
                                </span>
                                <span className="text-slate-400">
                                  (
                                  {
                                    stage.count
                                  }
                                  )
                                </span>
                              </div>

                              <span className="font-semibold text-slate-700">
                                {
                                  stage.value
                                }
                              </span>
                            </div>
                          )
                        )}
                      </div>

                      <div className="w-36 h-36 relative flex items-center justify-center shrink-0">
                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                        >
                          <PieChart>
                            <Pie
                              data={
                                pieData
                              }
                              cx="50%"
                              cy="50%"
                              innerRadius={
                                38
                              }
                              outerRadius={
                                54
                              }
                              paddingAngle={
                                3
                              }
                              dataKey="value"
                            >
                              {pieData.map(
                                (
                                  entry,
                                  index
                                ) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      entry.color
                                    }
                                  />
                                )
                              )}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>

                        <div className="absolute text-center">
                          <div className="text-xs font-bold text-slate-800">
                            {fmtMoney(
                              totalPipelineValue
                            )}
                          </div>
                          <div className="text-[9px] text-slate-400 font-medium">
                            Total Pipeline
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs font-bold text-slate-800">
                      <span>
                        Total
                      </span>

                      <div className="flex gap-6">
                        <span>
                          {
                            totalDealsCount
                          }
                        </span>
                        <span>
                          {fmtMoney(
                            totalPipelineValue
                          )}
                        </span>
                        <span>
                          100%
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-slate-800 text-lg">
                    Recent Deals{" "}
                    {recentDeals
                      ? `(${recentDeals.length})`
                      : ""}
                  </h2>

                  {recentDeals &&
                    recentDeals.length >
                      5 && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowAllDeals(
                            (value) =>
                              !value
                          )
                        }
                        className="text-xs font-medium text-indigo-600 hover:underline transition"
                      >
                        {showAllDeals
                          ? "Show Less"
                          : "View All"}
                      </button>
                    )}
                </div>

                {!recentDeals ? (
                  <TableSkeleton />
                ) : (
                  <div
                    className={`overflow-x-auto transition-all duration-300 ${
                      showAllDeals
                        ? "max-h-[600px]"
                        : "max-h-[320px]"
                    }`}
                  >
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 bg-white z-10 shadow-sm">
                        <tr className="text-slate-400 font-medium border-b border-slate-100">
                          <th className="pb-2">
                            Deal Name
                          </th>
                          <th className="pb-2">
                            Customer
                          </th>
                          <th className="pb-2">
                            Company
                          </th>
                          <th className="pb-2">
                            Deal Value
                          </th>
                          <th className="pb-2">
                            Stage
                          </th>
                          <th className="pb-2 text-right">
                            Expected Close
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-50">
                        {recentDeals.length >
                        0 ? (
                          recentDeals.map(
                            (
                              deal,
                              index
                            ) => (
                              <tr
                                key={
                                  deal.id
                                }
                                className="hover:bg-slate-50/50"
                              >
                                <td className="py-3 font-semibold text-slate-800 flex items-center gap-2">
                                  <span
                                    className={`w-6 h-6 text-[10px] font-bold text-white rounded-full flex items-center justify-center shrink-0 ${avatarBgOf(index)}`}
                                  >
                                    {deal.customer
                                      .split(
                                        " "
                                      )
                                      .map(
                                        (
                                          name
                                        ) =>
                                          name[0]
                                      )
                                      .join(
                                        ""
                                      )}
                                  </span>

                                  {
                                    deal.name
                                  }
                                </td>

                                <td className="py-3 text-slate-600">
                                  {
                                    deal.customer
                                  }
                                </td>

                                <td className="py-3 text-slate-500">
                                  {
                                    deal.company
                                  }
                                </td>

                                <td className="py-3 font-bold text-slate-800">
                                  {fmtMoney(
                                    deal.deal_value
                                  )}
                                </td>

                                <td className="py-3">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${stageBgOf(deal.stage)}`}
                                  >
                                    {
                                      deal.stage
                                    }
                                  </span>
                                </td>

                                <td className="py-3 text-right text-slate-500">
                                  {deal.expected_closing_date ??
                                    "—"}
                                </td>
                              </tr>
                            )
                          )
                        ) : (
                          <tr>
                            <td
                              colSpan={
                                6
                              }
                              className="py-6 text-center text-slate-400"
                            >
                              No deals found
                              for the
                              selected
                              date range.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="font-bold text-slate-800 text-lg">
                      Pipeline Performance
                      (Monthly)
                    </h2>

                    <div className="flex gap-4 text-xs mt-2">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-2.5 h-2.5 bg-indigo-600 rounded-sm" />
                        Deals Created
                      </span>

                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-2.5 h-2.5 bg-cyan-500 rounded-sm" />
                        Deals Closed
                      </span>

                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                        Revenue Generated
                      </span>
                    </div>
                  </div>

                  <select className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 outline-none">
                    <option>
                      This Year
                    </option>
                  </select>
                </div>

                {!performance ? (
                  <ChartSkeleton />
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <ComposedChart
                        data={
                          monthlyPerformanceData
                        }
                        margin={{
                          top: 10,
                          right: 10,
                          left: -20,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />

                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 11,
                            fill: "#94a3b8",
                          }}
                        />

                        <YAxis
                          yAxisId="left"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 11,
                            fill: "#94a3b8",
                          }}
                        />

                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 11,
                            fill: "#94a3b8",
                          }}
                          tickFormatter={(
                            value
                          ) =>
                            `$${value / 1000}k`
                          }
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor:
                              "#fff",
                            borderRadius:
                              "8px",
                            border:
                              "1px solid #e2e8f0",
                            fontSize:
                              "12px",
                          }}
                        />

                        <Bar
                          yAxisId="left"
                          dataKey="created"
                          fill="#4f46e5"
                          radius={[
                            4,
                            4,
                            0,
                            0,
                          ]}
                          barSize={12}
                        />

                        <Bar
                          yAxisId="left"
                          dataKey="closed"
                          fill="#0891b2"
                          radius={[
                            4,
                            4,
                            0,
                            0,
                          ]}
                          barSize={12}
                        />

                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="revenue"
                          stroke="#16a34a"
                          strokeWidth={
                            2.5
                          }
                          dot={{
                            r: 4,
                            fill: "#16a34a",
                          }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="lg:col-span-4 flex flex-col gap-4">
                {!performance ||
                !trends ? (
                  <>
                    <SummaryCardSkeleton
                      iconBg="bg-indigo-50"
                    />
                    <SummaryCardSkeleton
                      iconBg="bg-cyan-50"
                    />
                    <SummaryCardSkeleton
                      iconBg="bg-green-50"
                    />
                  </>
                ) : (
                  <>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500 font-medium">
                          Deals Created
                        </span>

                        <div className="text-2xl font-bold text-slate-800 mt-1">
                          {totals.created.toLocaleString()}
                        </div>

                        <span
                          className={`text-xs font-semibold ${
                            growthOf(
                              trends.total_deals
                            ) >= 0
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {growthOf(
                            trends.total_deals
                          ) >= 0
                            ? "▲"
                            : "▼"}{" "}
                          {fmtGrowth(
                            growthOf(
                              trends.total_deals
                            )
                          )}{" "}
                          <span className="text-[10px] text-slate-400 font-normal">
                            vs last month
                          </span>
                        </span>
                      </div>

                      <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                        <FilePlus2
                          size={20}
                        />
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500 font-medium">
                          Deals Closed
                        </span>

                        <div className="text-2xl font-bold text-slate-800 mt-1">
                          {totals.closed.toLocaleString()}
                        </div>

                        <span
                          className={`text-xs font-semibold ${
                            growthOf(
                              trends.closed_won
                            ) >= 0
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {growthOf(
                            trends.closed_won
                          ) >= 0
                            ? "▲"
                            : "▼"}{" "}
                          {fmtGrowth(
                            growthOf(
                              trends.closed_won
                            )
                          )}{" "}
                          <span className="text-[10px] text-slate-400 font-normal">
                            vs last month
                          </span>
                        </span>
                      </div>

                      <div className="p-3 bg-cyan-50 rounded-xl text-cyan-600">
                        <CheckCircle2
                          size={20}
                        />
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500 font-medium">
                          Revenue Generated
                        </span>

                        <div className="text-2xl font-bold text-slate-800 mt-1">
                          {fmtMoney(
                            totals.revenue
                          )}
                        </div>

                        <span
                          className={`text-xs font-semibold ${
                            growthOf(
                              trends.pipeline_value
                            ) >= 0
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {growthOf(
                            trends.pipeline_value
                          ) >= 0
                            ? "▲"
                            : "▼"}{" "}
                          {fmtGrowth(
                            growthOf(
                              trends.pipeline_value
                            )
                          )}{" "}
                          <span className="text-[10px] text-slate-400 font-normal">
                            vs last month
                          </span>
                        </span>
                      </div>

                      <div className="p-3 bg-green-50 rounded-xl text-green-600">
                        <DollarSign
                          size={20}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {loading &&
          hydrated &&
          summary &&
          trends && (
            <div className="fixed bottom-5 right-5 z-50 rounded-full bg-slate-900 text-white px-4 py-2 text-xs font-medium shadow-lg">
              Refreshing pipeline data…
            </div>
          )}
      </div>
    </DashboardLayout>
  );
}
