import { useEffect, useState } from "react";
import API from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
];

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/api/dashboard")
      .then((r) => setData(r.data))
      .catch(() => {});
  }, []);

  if (!data) return <div className="text-gray-400">Loading dashboard...</div>;

  const stats = [
    { label: "Total Documents", value: data.total_documents, color: "blue" },
    {
      label: "Successfully Parsed",
      value: data.successfully_parsed,
      color: "green",
    },
    { label: "Failed", value: data.failed_parsing, color: "red" },
    { label: "Review Pending", value: data.review_pending, color: "yellow" },
    { label: "Success Rate", value: `${data.success_rate}%`, color: "purple" },
    {
      label: "Avg Processing Time",
      value: `${data.avg_processing_time}s`,
      color: "cyan",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4"
          >
            <p className="text-gray-400 text-sm">{s.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">
            Documents by Type
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.documents_by_type}>
              <XAxis dataKey="type" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "none",
                  color: "#fff",
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-2">
            {data.recent_activity.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-300 truncate max-w-[60%]">
                  {d.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    d.status === "approved"
                      ? "bg-green-900 text-green-300"
                      : d.status === "parsed"
                        ? "bg-blue-900 text-blue-300"
                        : d.status === "review_pending"
                          ? "bg-yellow-900 text-yellow-300"
                          : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {d.status}
                </span>
              </div>
            ))}
            {data.recent_activity.length === 0 && (
              <p className="text-gray-500 text-sm">No activity yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
