import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  FileText,
  BarChart3,
  ScrollText,
  LogOut,
} from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const links = [
    { to: "/", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { to: "/upload", icon: <Upload size={18} />, label: "Upload" },
    { to: "/documents", icon: <FileText size={18} />, label: "Documents" },
    { to: "/reports", icon: <BarChart3 size={18} />, label: "Reports" },
    { to: "/logs", icon: <ScrollText size={18} />, label: "Audit Logs" },
  ];

  return (
    <div className="flex h-screen bg-gray-950">
      <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-sm font-bold text-blue-400">FinDoc Parser</h1>
          <p className="text-xs text-gray-500 mt-1">{user.name}</p>
          <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded">
            {user.role}
          </span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded text-sm transition ${isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`
              }
            >
              {l.icon}
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-red-400 border-t border-gray-800"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
