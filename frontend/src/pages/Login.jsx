import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  Eye,
  EyeOff,
  FileSearch,
  FileText,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

import API from "../api";

const workspaceRows = [
  { name: "Q2 Financial Summary.pdf", status: "Parsed", color: "text-emerald-400" },
  { name: "Vendor Invoice 042.pdf", status: "Review", color: "text-amber-400" },
  { name: "Bank Statement - May.pdf", status: "Ready", color: "text-blue-400" },
];

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("username", form.email);
      params.append("password", form.password);

      const response = await API.post("/api/auth/login", params);
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("Logged in!");
      navigate("/");
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-5 text-gray-100 sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-6xl overflow-hidden border border-gray-800 bg-gray-900 lg:grid-cols-[1.15fr_0.85fr] lg:min-h-[680px]">
        <section className="relative hidden border-r border-gray-800 bg-gray-950 p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-blue-500/40 bg-blue-500/10 text-blue-400">
                <FileSearch size={21} aria-hidden="true" />
              </div>
              <span className="text-base font-semibold tracking-wide text-white">FinDoc Parser</span>
            </div>

            <div className="mt-16 max-w-md">
              <p className="mb-4 text-sm font-medium text-blue-400">CORREM ADVISORY WORKSPACE</p>
              <h1 className="text-4xl font-bold leading-tight text-white">
                Financial documents, brought into focus.
              </h1>
              <p className="mt-5 max-w-sm text-sm leading-7 text-gray-400">
                A focused workspace for turning financial files into review-ready reports.
              </p>
            </div>
          </div>

          <div className="border border-gray-800 bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
                <FileText size={16} className="text-blue-400" aria-hidden="true" />
                Recent documents
              </div>
              <ArrowUpRight size={16} className="text-gray-500" aria-hidden="true" />
            </div>
            <div className="divide-y divide-gray-800 px-5">
              {workspaceRows.map((row) => (
                <div key={row.name} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-200">{row.name}</p>
                    <p className="mt-1 text-xs text-gray-500">Financial document</p>
                  </div>
                  <span className={`shrink-0 text-xs font-medium ${row.color}`}>{row.status}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-[calc(100vh-2.5rem)] flex-col p-6 sm:p-10 lg:min-h-0 lg:p-12">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center border border-blue-500/40 bg-blue-500/10 text-blue-400">
              <FileSearch size={21} aria-hidden="true" />
            </div>
            <span className="text-base font-semibold tracking-wide text-white">FinDoc Parser</span>
          </div>

          <div className="my-auto w-full">
            <div className="mb-8">
              <p className="mb-3 text-sm font-medium text-blue-400">SIGN IN</p>
              <h2 className="text-3xl font-bold text-white">Welcome back</h2>
              <p className="mt-3 text-sm leading-6 text-gray-400">
                Use your workspace account to continue.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-200">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="you@company.com"
                    required
                    className="w-full border border-gray-700 bg-gray-950 py-3 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-200">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    placeholder="Enter your password"
                    required
                    className="w-full border border-gray-700 bg-gray-950 py-3 pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-gray-500 transition hover:text-gray-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}
                {loading ? "Signing in..." : "Sign in to workspace"}
              </button>
            </form>

            <p className="mt-7 border-t border-gray-800 pt-5 text-sm text-gray-400">
              New to FinDoc Parser?{" "}
              <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300">
                Create an account
              </Link>
            </p>
          </div>

          <div className="mt-10 flex items-center gap-2 text-xs text-gray-600">
            <ShieldCheck size={15} className="text-gray-500" aria-hidden="true" />
            Secure workspace access
            <CheckCircle2 size={14} className="ml-auto text-emerald-500" aria-hidden="true" />
          </div>
        </section>
      </div>
    </main>
  );
}
