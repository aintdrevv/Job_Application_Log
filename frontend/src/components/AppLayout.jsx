import { useState, useRef, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

function SaveIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4h12v16l-6-4-6 4V4Z" />
    </svg>
  );
}

function NavLink({ to, children }) {
  const { pathname } = useLocation();
  const isActive =
    pathname === to || (to === "/dashboard" && pathname.startsWith(`${to}/`));

  return (
    <Link
      className={`font-mono-ui text-[11px] uppercase tracking-[0.2em] transition pb-1 ${
        isActive
          ? "text-neutral-900 border-b-2 border-neutral-900"
          : "text-neutral-400 hover:text-neutral-900"
      }`}
      to={to}
    >
      {children}
    </Link>
  );
}

function AvatarMenu({ user, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const initial = user?.email ? user.email.charAt(0).toUpperCase() : "?";

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#111",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.05em",
          border: "none",
          cursor: "pointer",
          flexShrink: 0,
          transition: "opacity 0.15s",
          opacity: open ? 0.8 : 1,
        }}
      >
        {initial}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            minWidth: 200,
            zIndex: 50,
            overflow: "hidden",
            animation: "fadeDropdown 0.15s ease",
          }}
        >
          <style>{`
            @keyframes fadeDropdown {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Email */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0ede8" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 4 }}>
              Signed in as
            </p>
            <p style={{ fontSize: 12, color: "#111", wordBreak: "break-all" }}>
              {user?.email}
            </p>
          </div>

          {/* Log out — underline style */}
          <button
            onClick={() => { setOpen(false); logout(); }}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#111",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              transition: "opacity 0.1s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.5"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="mt-1 mb-6 min-h-screen bg-canvas px-4 pt-4 pb-4 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="animate-fade-up py-4 pl-0 pr-0">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-muted">
                  Job Application Logger
                </p>
                <div className="lg:hidden">
                  <AvatarMenu user={user} logout={logout} />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="font-serif-ui text-5xl leading-none tracking-tight text-ink sm:text-6xl">
                  Stay on top of every opportunity.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted">
                  Track applications, keep follow-ups visible, and store the notes and
                  contacts that matter for each role.
                </p>
              </div>
            </div>

            {/* Avatar with dropdown — desktop */}
            <div className="hidden lg:block lg:self-start">
              <AvatarMenu user={user} logout={logout} />
            </div>
          </div>
        </header>

        <div className="animate-fade-up flex items-center justify-between gap-3">
          <nav className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/saved-jobs">
              <span className="inline-flex items-center gap-1.5">
                <SaveIcon />
                <span>Saved Jobs</span>
              </span>
            </NavLink>
            <NavLink to="/applications">Applications</NavLink>
          </nav>

          <Link
            className="shrink-0 text-neutral-900 transition hover:opacity-50 sm:rounded-full sm:bg-neutral-900 sm:px-3.5 sm:py-2 sm:font-mono-ui sm:text-[11px] sm:uppercase sm:tracking-[0.2em] sm:text-white sm:hover:bg-neutral-800 sm:hover:opacity-100"
            to="/applications/new"
            aria-label="New Application"
          >
            <span className="text-2xl leading-none sm:hidden">+</span>
            <span className="hidden sm:inline">New Application →</span>
          </Link>
        </div>

        <main className="animate-fade-up">
          <Outlet />
        </main>

        <footer className="animate-fade-up flex flex-col gap-2 border-t border-line pt-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="font-mono-ui text-[10px] uppercase tracking-[0.18em] text-muted">
            Application Logger
          </p>
          <p className="text-sm text-muted">Built to keep your job search organized.</p>
        </footer>
      </div>
    </div>
  );
}
