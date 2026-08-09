"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  fetchPipelinePerformance,
  fetchPipelineStageDeals,
  fetchPipelineStages,
  fetchPipelineSummary,
  pipelineStageConfig,
  PipelinePerformance,
  PipelineStageDeal,
  PipelineSummary,
  StageDistribution,
} from "@/lib/dashboard";
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
  Tooltip 
} from "recharts";
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  Handshake, 
  XCircle,
  Calendar, 
  Download,
  UserPlus,
  CheckCircle2,
  X,
  TrendingUp
} from "lucide-react";
import ThemeLoader from "@/components/ui/ThemeLoader";

const DEAL_STAGES = [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
];

export default function SalesPipelinePage() {
  const [deals, setDeals] = useState<PipelineStageDeal[]>([]);
  const [summary, setSummary] = useState<PipelineSummary | null>(null);
  const [stageData, setStageData] = useState<StageDistribution[]>([]);
  const [performance, setPerformance] = useState<PipelinePerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAllDeals, setShowAllDeals] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const appliedStart = isFiltered ? startDate : "";
  const appliedEnd = isFiltered ? endDate : "";

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryRes, stagesRes, perfRes, ...stageDealRes] = await Promise.all([
          fetchPipelineSummary(appliedStart || undefined, appliedEnd || undefined),
          fetchPipelineStages(appliedStart || undefined, appliedEnd || undefined),
          fetchPipelinePerformance(new Date().getFullYear()),
          ...DEAL_STAGES.map((stage) => fetchPipelineStageDeals(stage)),
        ]);
        if (cancelled) return;
        setSummary(summaryRes);
        setStageData(stagesRes);
        setPerformance(perfRes);
        setDeals(stageDealRes.flat());
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [appliedStart, appliedEnd, refreshKey]);

  const filteredDeals = deals.filter((deal) => {
    if (!isFiltered || !startDate || !endDate) return true;
    const close = deal.expected_close_date || "";
    return close >= startDate && close <= endDate;
  });

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const dateButtonLabel = isFiltered && startDate && endDate
    ? `${formatDateLabel(startDate)} – ${formatDateLabel(endDate)}, ${endDate.slice(0, 4)}`
    : "All Deals";

  const totalPipelineValue = Number(summary?.total_pipeline_value ?? 0);
  const totalDealsCount = summary?.total_deals ?? 0;
  const activeDealsCount = summary?.active_deals ?? 0;
  const closedWonCount = summary?.closed_won ?? 0;
  const closedLostCount = summary?.closed_lost ?? 0;

  const stats = [
    {
      label: "TOTAL DEALS",
      value: totalDealsCount.toString(),
      change: "+14.3%",
      up: true,
      icon: Users,
      iconColor: "text-indigo-600 bg-indigo-50/80",
    },
    {
      label: "TOTAL PIPELINE VALUE",
      value: `$${totalPipelineValue.toLocaleString()}`,
      change: "+12.5%",
      up: true,
      icon: DollarSign,
      iconColor: "text-emerald-600 bg-emerald-50/80",
    },
    {
      label: "ACTIVE DEALS",
      value: activeDealsCount.toString(),
      change: "+7.8%",
      up: true,
      icon: UserCheck,
      iconColor: "text-sky-600 bg-sky-50/80",
    },
    {
      label: "CLOSED WON",
      value: closedWonCount.toString(),
      change: "+16.7%",
      up: true,
      icon: Handshake,
      iconColor: "text-amber-600 bg-amber-50/80",
    },
    {
      label: "CLOSED LOST",
      value: closedLostCount.toString(),
      change: "-4.8%",
      up: false,
      icon: XCircle,
      iconColor: "text-rose-600 bg-rose-50/80",
    },
  ];

  const stages = stageData.map((s) => {
    const config = pipelineStageConfig(s.stage);
    const valueNum = Number(s.total_value);
    return {
      ...config,
      count: s.deal_count,
      value: `$${valueNum.toLocaleString()}`,
      percentage: s.percentage + "%",
      rawVal: valueNum,
    };
  });

  const pieData = stages.map((stg) => ({
    name: stg.name,
    value: stg.rawVal > 0 ? stg.rawVal : 1,
    color: stg.hex,
  }));

  const monthlyPerformanceData = performance
    ? performance.months.map((m, i) => ({
        month: m,
        created: performance.deals_created[i] ?? 0,
        closed: performance.deals_closed[i] ?? 0,
        revenue: performance.revenue_generated[i] ?? 0,
      }))
    : [];

  const totalCreated = monthlyPerformanceData.reduce((sum, m) => sum + m.created, 0);
  const totalClosed = monthlyPerformanceData.reduce((sum, m) => sum + m.closed, 0);
  const totalRevenue = monthlyPerformanceData.reduce((sum, m) => sum + m.revenue, 0);

  const handleShowAll = () => {
    setIsFiltered(false);
    setShowDatePicker(false);
  };

  const handleApplyFilter = () => {
    setIsFiltered(true);
    setShowDatePicker(false);
  };

  const handleExport = () => {
    const exportData = filteredDeals.map((deal) => ({
      "Deal Name": deal.name,
      "Customer": deal.customer,
      "Company": deal.company,
      "Deal Value ($)": Number(deal.value),
      "Stage": deal.stage,
      "Expected Close Date": deal.expected_close_date,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Pipeline");
    XLSX.writeFile(workbook, `Sales_Pipeline_Export.xlsx`);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 bg-slate-50 min-h-screen relative">

        {loading && !summary && (
          <ThemeLoader label="Loading pipeline data..." minHeight={260} />
        )}

        {error && !summary && (
          <div className="not-found-state">
            <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>⚠️</p>
            <h2>Pipeline unavailable</h2>
            <p>{error}</p>
            <button className="btn-primary" onClick={() => setRefreshKey((k) => k + 1)}>Retry</button>
          </div>
        )}

        {(summary || (!loading && !error)) && (
          <>

        {loading && (
          <div className="text-sm text-slate-500 animate-pulse">Refreshing pipeline data…</div>
        )}

        {error && (
          <div className="flex items-center justify-between gap-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
            <span>Failed to refresh pipeline data: {error}</span>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sales Pipeline</h1>
            <p className="text-sm text-slate-500 mt-1">Track every deal from lead to close.</p>
          </div>

          <div className="flex items-center gap-3 relative">
            <div className="relative">
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium shadow-sm hover:bg-slate-50 transition"
              >
                <Calendar size={16} />
                {dateButtonLabel}
              </button>

              {showDatePicker && (
                <div className="absolute right-0 mt-2 p-4 bg-white border border-slate-200 rounded-xl shadow-lg z-50 w-72 flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-xs font-bold text-slate-700">Filter by Date</span>
                    <button onClick={() => setShowDatePicker(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-500">From:</label>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="text-xs border border-slate-200 rounded-md p-1.5 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-500">To:</label>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="text-xs border border-slate-200 rounded-md p-1.5 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={handleShowAll}
                      className="flex-1 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-200 transition"
                    >
                      Show All
                    </button>
                    <button 
                      onClick={handleApplyFilter}
                      className="flex-1 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition"
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition active:scale-95"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* 1. Top 5 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2.5 min-w-0">
                <div className={`p-2.5 rounded-xl shrink-0 ${item.iconColor}`}>
                  <Icon size={20} />
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[10px] font-bold tracking-tight text-slate-400 uppercase truncate" title={item.label}>
                    {item.label}
                  </span>
                  
                  <div className="text-base lg:text-lg font-bold text-slate-900 my-0.5 truncate" title={item.value}>
                    {item.value}
                  </div>
                  
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold shrink-0 ${item.up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      <TrendingUp size={9} className={item.up ? '' : 'rotate-180'} />
                      {item.change}
                    </span>
                    <span className="text-[9px] text-slate-400 truncate">vs last month</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-slate-800 text-base">Pipeline by Stage</h2>
              <select className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 outline-none">
                <option>This Month</option>
              </select>
            </div>

            <div className="flex items-center gap-2 my-2">
              <div className="space-y-2.5 flex-1">
                {stages.map((stg, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${stg.color}`}></span>
                      <span className="font-medium text-slate-700">{stg.name}</span>
                    </div>
                    <span className="font-semibold text-slate-700">{stg.value}</span>
                  </div>
                ))}
              </div>

              <div className="w-36 h-36 relative flex items-center justify-center shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={54}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute text-center">
                  <div className="text-[11px] font-bold text-slate-800">${totalPipelineValue.toLocaleString()}</div>
                  <div className="text-[8px] text-slate-400 font-medium">Total Pipeline</div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs font-bold text-slate-800">
              <span>Total</span>
              <div className="flex gap-6">
                <span>{totalDealsCount}</span>
                <span>${totalPipelineValue.toLocaleString()}</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-800 text-base">Recent Deals ({filteredDeals.length})</h2>
              <button 
                onClick={() => setShowAllDeals(!showAllDeals)}
                className="text-xs font-medium text-indigo-600 hover:underline transition"
              >
                {showAllDeals ? "Show Less" : "View All"}
              </button>
            </div>

            <div className={`overflow-x-auto transition-all duration-300 ${showAllDeals ? "max-h-[600px]" : "max-h-[320px]"}`}>
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                  <tr className="text-slate-400 font-medium border-b border-slate-100 pb-2">
                    <th className="pb-2">Deal Name</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Company</th>
                    <th className="pb-2">Deal Value</th>
                    <th className="pb-2">Stage</th>
                    <th className="pb-2 text-right">Expected Close</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredDeals.length > 0 ? (
                    filteredDeals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-semibold text-slate-800 flex items-center gap-2">
                          <span className={`w-6 h-6 text-[10px] font-bold text-white rounded-full flex items-center justify-center shrink-0 ${deal.id % 2 === 0 ? "bg-indigo-600" : "bg-blue-600"}`}>
                            {deal.customer.split(' ').map(n => n[0]).join('')}
                          </span>
                          {deal.name}
                        </td>
                        <td className="py-3 text-slate-600">{deal.customer}</td>
                        <td className="py-3 text-slate-500">{deal.company}</td>
                        <td className="py-3 font-bold text-slate-800">${Number(deal.value).toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${pipelineStageConfig(deal.stage).stageBg}`}>
                            {deal.stage}
                          </span>
                        </td>
                        <td className="py-3 text-right text-slate-500">{deal.expected_close_date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No deals found for the selected date range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* 3. Bottom Row: Monthly Performance Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-bold text-slate-800 text-base">Pipeline Performance (Monthly)</h2>
                <div className="flex gap-4 text-xs mt-2">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-sm"></span> Deals Created
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 bg-sky-400 rounded-sm"></span> Deals Closed
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Revenue Generated
                  </span>
                </div>
              </div>
              <select className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 outline-none">
                <option>This Year</option>
              </select>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickFormatter={(v) => `$${v / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} 
                  />
                  <Bar yAxisId="left" dataKey="created" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar yAxisId="left" dataKey="closed" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={12} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Deals Created</span>
                <div className="text-xl font-bold text-slate-800 mt-1">{totalCreated.toLocaleString()}</div>
                <span className="text-xs text-emerald-600 font-semibold">▲ 18.2% <span className="text-[10px] text-slate-400 font-normal">vs last year</span></span>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <UserPlus size={20} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Deals Closed</span>
                <div className="text-xl font-bold text-slate-800 mt-1">{totalClosed.toLocaleString()}</div>
                <span className="text-xs text-emerald-600 font-semibold">▲ 15.4% <span className="text-[10px] text-slate-400 font-normal">vs last year</span></span>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
                <CheckCircle2 size={20} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Revenue Generated</span>
                <div className="text-xl font-bold text-slate-800 mt-1">${totalRevenue.toLocaleString()}</div>
                <span className="text-xs text-emerald-600 font-semibold">▲ 22.7% <span className="text-[10px] text-slate-400 font-normal">vs last year</span></span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <DollarSign size={20} />
              </div>
            </div>
          </div>

        </div>

          </>
        )}

      </div>
    </DashboardLayout>
  );
}