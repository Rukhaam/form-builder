"use client";

import { useSelector, useDispatch } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Users,
  Settings,
} from "lucide-react";
import { logoutSuccess, setCredentials } from "@/store/slices/authSlice";
import { setWorkspaces } from "@/store/slices/workspaceSlice";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";

function getUserFromAccessToken(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const decoded = JSON.parse(window.atob(normalizedPayload));

    if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
      return null;
    }

    if (!decoded.id || !decoded.email) {
      return null;
    }

    return { id: decoded.id, email: decoded.email };
  } catch {
    return null;
  }
}

export default function DashboardLayout({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { activeWorkspaceId } = useSelector((state) => state.workspace);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const [mounted, setMounted] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);

  // <-- Added state to toggle sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch workspaces on mount
  const workspacesQuery = trpc.workspace.getMyWorkspaces.useQuery(undefined, {
    enabled: mounted,
    onSuccess: (data) => {
      dispatch(setWorkspaces(data));
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    const tokenUser = getUserFromAccessToken(token);

    if (!tokenUser) {
      dispatch(logoutSuccess());
      router.replace("/login");
      return;
    }

    setSessionUser(tokenUser);

    if (!isAuthenticated || !user) {
      dispatch(setCredentials({ user: tokenUser }));
    }

    setMounted(true);
  }, [dispatch, isAuthenticated, router, user]);

  const handleLogout = () => {
    dispatch(logoutSuccess());
    router.push("/login");
  };

  // Prevent flashing the dashboard before redirecting
  if (!mounted) return null;

  const navItems = [
    {
      href: "/dashboard",
      label: "My Forms",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      icon: BarChart3,
      active: pathname.startsWith("/dashboard/analytics"),
    },
    {
      href: "/dashboard/settings/team",
      label: "Team",
      icon: Users,
      active: pathname.startsWith("/dashboard/settings/team"),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,#e0f2fe,transparent_32%),linear-gradient(135deg,#f8fafc,#eef2ff_48%,#fff7ed)] text-slate-950">
      {/* SIDEBR */}
      <aside
        className={cn(
          "flex flex-col border-white/60 bg-white/65 shadow-xl shadow-slate-200/60 backdrop-blur-xl transition-all duration-300 ease-in-out",
          isSidebarOpen
            ? "w-64 border-r opacity-100"
            : "w-0 border-r-0 opacity-0 overflow-hidden",
        )}
      >
        {/* Inner wrapper forces a fixed width so text doesn't wrap/crush during the slide animation */}
        <div className="flex w-64 flex-1 flex-col">
          <div className="flex h-16 items-center justify-between border-b border-white/70 px-6">
            <div className="flex items-center">
              <img
                src="https://pub-749dd85c25e04947af34140aef9172fc.r2.dev/form-builder/ChatGPT%20Image%20Jun%2030%2C%202026%2C%2011_22_18%20PM.png"
                alt="FormBuilder Logo"
                className="size-9 object-contain"
              />
              <Link href={"/"}>
                <span className="ml-3 text-lg font-medium text-slate-950">
                  FormBuilder
                </span>
              </Link>
            </div>

            {/* Close Sidebar Button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 transition active:bg-white/70 active:text-slate-900"
              aria-label="Close sidebar"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6 w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                    item.active
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-300/70"
                      : "text-slate-600 active:bg-white/70 active:text-slate-950",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout at bottom */}
          <div className="border-t border-white/70 p-4">
            <div className="mb-3 rounded-2xl border border-white/70 bg-white/65 p-3 shadow-sm">
              <div className="text-xs font-medium uppercase text-slate-400">
                Signed in
              </div>
              <div className="mt-1 truncate text-sm font-medium text-slate-950">
                {user?.email || sessionUser?.email || "Loading..."}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-left text-sm font-medium text-red-600 transition active:bg-red-100"
            >
              <LogOut className="size-4" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/60 bg-white/55 px-8 backdrop-blur-xl transition-all">
          {/* Open Sidebar Hamburger Menu */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg p-2 -ml-2 text-slate-600 transition active:bg-white/70 active:text-slate-950"
              aria-label="Open sidebar"
            >
              <Menu className="size-5" />
            </button>
          )}

          <h1 className="text-xl font-medium text-slate-950">
            {pathname.startsWith("/dashboard/analytics")
              ? "Analytics"
              : pathname.startsWith("/dashboard/settings/team")
                ? "Team Settings"
                : "Dashboard"}
          </h1>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Workspace Switcher */}
          <WorkspaceSwitcher />
        </header>

        <div className="flex-1 overflow-auto p-8">{children}</div>
      </main>
    </div>
  );
}
