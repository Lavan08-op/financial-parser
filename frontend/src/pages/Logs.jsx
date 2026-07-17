import { useEffect, useState } from "react";
import API from "../api";

export default function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    API.get("/api/logs")
      .then((r) => setLogs(r.data))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Audit Logs</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left px-4 py-3">Action</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Remarks</th>
              <th className="text-left px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr
                key={l.id}
                className="border-b border-gray-800 hover:bg-gray-800/50"
              >
                <td className="px-4 py-3 text-white">{l.action}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${l.status === "success" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}
                  >
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{l.remarks || "—"}</td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(l.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No logs yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
