import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";
import { Upload as UploadIcon, FileText } from "lucide-react";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return toast.error("Select a file first");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await API.post("/api/documents/upload", form);
      const docId = res.data.id;
      toast.success("Uploaded! Starting AI processing...");
      setUploading(false);
      setProcessing(true);
      await API.post(`/api/parser/process/${docId}`);
      toast.success("Processing started! Check Documents page.");
      setTimeout(() => navigate("/documents"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Upload Document</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${file ? "border-blue-500 bg-blue-950/20" : "border-gray-700 hover:border-gray-500"}`}
          onClick={() => document.getElementById("fileInput").click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setFile(e.dataTransfer.files[0]);
          }}
        >
          <input
            id="fileInput"
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file ? (
            <div>
              <FileText className="mx-auto text-blue-400 mb-3" size={40} />
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-gray-400 text-sm mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <UploadIcon className="mx-auto text-gray-500 mb-3" size={40} />
              <p className="text-gray-300 font-medium">
                Drop file here or click to browse
              </p>
              <p className="text-gray-500 text-sm mt-1">
                PDF, JPG, PNG — max 25MB
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-gray-800 rounded text-sm text-gray-400">
          <p className="font-medium text-gray-300 mb-1">
            Supported document types:
          </p>
          <p>
            Bank Statement • ITR • GST Return • Salary Slip • Invoice • Balance
            Sheet • P&L Statement
          </p>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading || processing}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded text-sm font-medium"
        >
          {uploading
            ? "Uploading..."
            : processing
              ? "Processing with AI..."
              : "Upload & Process"}
        </button>
      </div>
    </div>
  );
}
