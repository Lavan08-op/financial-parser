import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { RefreshCw, Eye, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const statusColor = (s) =>
  ({
    uploaded: "bg-gray-700 text-gray-300",
    processing: "bg-blue-900 text-blue-300",
    parsed: "bg-green-900 text-green-300",
    validation_failed: "bg-red-900 text-red-300",
    review_pending: "bg-yellow-900 text-yellow-300",
    approved: "bg-emerald-900 text-emerald-300",
    rejected: "bg-red-900 text-red-400",
  })[s] || "bg-gray-700 text-gray-300";

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  const load = () =>
    API.get("/api/documents")
      .then((r) => setDocs(r.data))
      .catch(() => {});

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const del = async (id) => {
    if (!confirm("Delete this document?")) return;
    await API.delete(`/api/documents/${id}`);
    toast.success("Deleted");
    load();
  };

  const filtered = docs.filter(
    (d) =>
      d.document_name.toLowerCase().includes(filter.toLowerCase()) ||
      (d.document_type || "").toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Documents</h1>
        <div className="flex gap-2">
          <input
            placeholder="Search..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white w-48"
          />
          <button
            onClick={load}
            className="p-2 bg-gray-800 rounded border border-gray-700 text-gray-400 hover:text-white"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Size</th>
              <th className="text-left px-4 py-3">Time</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr
                key={d.id}
                className="border-b border-gray-800 hover:bg-gray-800/50"
              >
                <td className="px-4 py-3 text-white truncate max-w-[200px]">
                  {d.document_name}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {d.document_type || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${statusColor(d.status)}`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {d.file_size ? `${(d.file_size / 1024).toFixed(1)}KB` : "—"}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {d.processing_time ? `${d.processing_time}s` : "—"}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => navigate(`/documents/${d.id}`)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => del(d.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No documents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
