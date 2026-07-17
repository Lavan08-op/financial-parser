import { useEffect, useState } from "react";
import API from "../api";

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    API.get("/api/reports")
      .then((r) => setReports(r.data))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Reports</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left px-4 py-3">Report ID</th>
              <th className="text-left px-4 py-3">Validation</th>
              <th className="text-left px-4 py-3">Review</th>
              <th className="text-left px-4 py-3">Created</th>
              <th className="text-left px-4 py-3">Export</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr
                key={r.id}
                className="border-b border-gray-800 hover:bg-gray-800/50"
              >
                <td className="px-4 py-3 text-gray-300 font-mono text-xs">
                  {r.id.slice(0, 8)}...
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${r.validation_status === "valid" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}
                  >
                    {r.validation_status || "N/A"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{r.review_status}</td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <a
                    href={`http://127.0.0.1:8000/api/reports/export/pdf/${r.document_id}?token=${localStorage.getItem("token")}`}
                    target="_blank"
                    className="text-xs bg-red-700 text-white px-2 py-1 rounded"
                  >
                    PDF
                  </a>
                  <a
                    href={`http://127.0.0.1:8000/api/reports/export/excel/${r.document_id}?token=${localStorage.getItem("token")}`}
                    target="_blank"
                    className="text-xs bg-green-700 text-white px-2 py-1 rounded"
                  >
                    Excel
                  </a>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No reports yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
