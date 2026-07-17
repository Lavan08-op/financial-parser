import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "analyst",
  });
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/auth/register", form);
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Account created!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>
        <form onSubmit={submit} className="space-y-4">
          <input
            placeholder="Full Name"
            required
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
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
          <select
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="analyst">Analyst</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium"
          >
            Register
          </button>
        </form>
        <p className="text-gray-500 text-sm mt-4">
          Have account?{" "}
          <Link to="/login" className="text-blue-400">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
