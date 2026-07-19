import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  ShieldCheck,
  Upload,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import API from "../api";

const statusStyles = {
  approved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  parsed: "border-blue-500/20 bg-blue-500/10 text-blue-300",
  review_pending: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  failed: "border-red-500/20 bg-red-500/10 text-red-300",
};

function StatusBadge({ status }) {
  const label = (status || "unknown").replace(/_/g, " ");

  return (
    <span
      className={`inline-flex shrink-0 border px-2 py-1 text-xs font-medium capitalize ${
        statusStyles[status] || "border-gray-700 bg-gray-800 text-gray-300"
      }`}
    >
      {label}
    </span>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const loadDashboard = useCallback(async (showRefreshState = false) => {
    if (showRefreshState) setRefreshing(true);
    setError(false);

    try {
      const response = await API.get("/api/dashboard");
      setData(response.data);
    } catch {
      setError(true);
    } finally {
      if (showRefreshState) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (!data && !error) {
    return <div className="py-12 text-sm text-gray-400">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="border border-red-500/25 bg-red-500/10 p-5 text-sm text-red-200">
        <p className="font-semibold">Dashboard data could not be loaded.</p>
        <button
          type="button"
          onClick={() => loadDashboard(true)}
          className="mt-3 inline-flex items-center gap-2 border border-red-400/30 px-3 py-2 font-medium transition hover:bg-red-500/10"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          Try again
        </button>
      </div>
    );
  }

  const documentsByType = data.documents_by_type || [];
  const recentActivity = data.recent_activity || [];
  const stats = [
    {
      label: "Total documents",
      value: data.total_documents ?? 0,
      icon: FileText,
      accent: "text-blue-400",
    },
    {
      label: "Successfully parsed",
      value: data.successfully_parsed ?? 0,
      icon: CheckCircle2,
      accent: "text-emerald-400",
    },
    {
      label: "Failed parsing",
      value: data.failed_parsing ?? 0,
      icon: AlertTriangle,
      accent: "text-red-400",
    },
    {
      label: "Review pending",
      value: data.review_pending ?? 0,
      icon: Clock3,
      accent: "text-amber-400",
    },
    {
      label: "Success rate",
      value: `${data.success_rate ?? 0}%`,
      icon: ShieldCheck,
      accent: "text-violet-400",
    },
    {
      label: "Avg. processing time",
      value: `${data.avg_processing_time ?? 0}s`,
      icon: Clock3,
      accent: "text-cyan-400",
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-gray-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-blue-400">Overview</p>
          <h1 className="text-2xl font-bold text-white">Document operations</h1>
          <p className="mt-2 text-sm text-gray-400">
            Monitor processing performance and keep reports moving through review.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadDashboard(true)}
            className="flex h-10 w-10 items-center justify-center border border-gray-700 bg-gray-900 text-gray-300 transition hover:border-gray-600 hover:text-white"
            aria-label="Refresh dashboard"
            title="Refresh dashboard"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            type="button"
            onClick={() => navigate("/upload")}
            className="inline-flex h-10 items-center gap-2 bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <Upload size={16} aria-hidden="true" />
            Upload document
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, accent }) => (
          <article key={label} className="border border-gray-800 bg-gray-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-gray-400">{label}</p>
              <Icon size={19} className={accent} aria-hidden="true" />
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="border border-gray-800 bg-gray-900 p-5">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-white">Documents by type</h2>
            <p className="mt-1 text-sm text-gray-500">Processed document volume by category</p>
          </div>
          <div className="h-64">
            {documentsByType.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={documentsByType} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
                  <XAxis
                    dataKey="type"
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "#374151" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#1f2937" }}
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid #374151",
                      borderRadius: 0,
                      color: "#f9fafb",
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center border border-dashed border-gray-700 text-sm text-gray-500">
                No processed documents yet
              </div>
            )}
          </div>
        </div>

        <div className="border border-gray-800 bg-gray-900 p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white">Recent activity</h2>
              <p className="mt-1 text-sm text-gray-500">Latest document processing updates</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/documents")}
              className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
            >
              View all
            </button>
          </div>

          {recentActivity.length ? (
            <div className="divide-y divide-gray-800">
              {recentActivity.map((document) => (
                <div key={document.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-200">{document.name}</p>
                    <p className="mt-1 text-xs text-gray-500">Document processing update</p>
                  </div>
                  <StatusBadge status={document.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-gray-700 p-5 text-center text-sm text-gray-500">
              Upload a document to begin building activity.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
