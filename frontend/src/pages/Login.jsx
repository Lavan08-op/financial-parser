import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("username", form.email);
      params.append("password", form.password);
      const res = await API.post("/api/auth/login", params);
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Logged in!");
      navigate("/");
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2">FinDoc Parser</h2>
        <p className="text-gray-400 mb-6 text-sm">Sign in to your account</p>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-gray-500 text-sm mt-4">
          No account?{" "}
          <Link to="/register" className="text-blue-400">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
