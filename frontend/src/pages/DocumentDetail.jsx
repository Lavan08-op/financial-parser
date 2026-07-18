import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";

export default function DocumentDetail() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [result, setResult] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    API.get(`/api/documents/${id}`)
      .then((r) => setDoc(r.data))
      .catch(() => {});
    API.get(`/api/parser/result/${id}`)
      .then((r) => {
        setResult(r.data);
        setEditData(r.data.parsed_data?.extracted || {});
      })
      .catch(() => {});
  }, [id]);

  const reprocess = async () => {
    await API.post(`/api/parser/reprocess/${id}`);
    toast.success("Reprocessing started");
  };

  const approve = async () => {
    await API.put(`/api/parser/review/${id}`, {
      parsed_data: { ...result.parsed_data, extracted: editData },
      review_status: "approved",
      remarks,
    });
    toast.success("Approved!");
  };

  const reject = async () => {
    await API.put(`/api/parser/review/${id}`, {
      review_status: "rejected",
      remarks,
    });
    toast.success("Rejected");
  };

  const token = localStorage.getItem("token");
  const exportPDF = () =>
    window.open(
      `https://financial-parser-1.onrender.com
/api/reports/export/pdf/${id}?token=${token}`,
    );
  const exportExcel = () =>
    window.open(
      `https://financial-parser-1.onrender.com
/api/reports/export/excel/${id}?token=${token}`,
    );

  if (!doc) return <div className="text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white truncate">
          {doc.document_name}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={reprocess}
            className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded text-sm border border-gray-700"
          >
            Reprocess
          </button>
          <button
            onClick={exportPDF}
            className="px-3 py-1.5 bg-red-700 text-white rounded text-sm"
          >
            Export PDF
          </button>
          <button
            onClick={exportExcel}
            className="px-3 py-1.5 bg-green-700 text-white rounded text-sm"
          >
            Export Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          ["Type", doc.document_type || "Unknown"],
          ["Status", doc.status],
          [
            "Processing Time",
            doc.processing_time ? `${doc.processing_time}s` : "N/A",
          ],
          [
            "File Size",
            doc.file_size ? `${(doc.file_size / 1024).toFixed(1)}KB` : "N/A",
          ],
          ["Validation", result?.validation_status || "N/A"],
          ["Review", result?.review_status || "N/A"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="bg-gray-900 border border-gray-800 rounded p-3"
          >
            <p className="text-gray-400 text-xs">{k}</p>
            <p className="text-white text-sm font-medium mt-0.5">{v}</p>
          </div>
        ))}
      </div>

      {result?.parsed_data?.extracted && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Extracted Fields</h3>
            <button
              onClick={() => setEditing(!editing)}
              className="text-sm text-blue-400"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(editData).map(([k, v]) => (
              <div key={k}>
                <label className="text-gray-400 text-xs capitalize">
                  {k.replace(/_/g, " ")}
                </label>
                {editing ? (
                  <input
                    value={v || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, [k]: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm mt-0.5"
                  />
                ) : (
                  <p className="text-white text-sm mt-0.5">{v || "—"}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="font-semibold text-white mb-3">Review Actions</h3>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add remarks..."
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm mb-3 h-20 resize-none"
        />
        <div className="flex gap-3">
          <button
            onClick={approve}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium"
          >
            Approve
          </button>
          <button
            onClick={reject}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
