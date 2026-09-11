import { useState } from "react";
import { ChevronDown, LogOut, User, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);

  const fullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";

  const email = user?.email || "";
  const role = user?.role || "User";

  const initials =
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() ||
    "U";

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="flex h-[var(--topbar-height)] items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6">
      {/* Page title */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Dashboard
        </h2>

        <p className="text-xs text-[var(--color-text-muted)]">
          Welcome back, {user?.firstName || "User"}
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] transition-colors hover:bg-slate-100 hover:text-[var(--color-text-primary)]"
          aria-label="Notifications"
        >
          <Bell size={18} />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--color-danger)]" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 transition-colors hover:bg-slate-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-sm font-semibold text-[var(--color-primary)]">
              {initials}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {fullName}
              </p>

              <p className="text-xs capitalize text-[var(--color-text-muted)]">
                {role.replaceAll("_", " ")}
              </p>
            </div>

            <ChevronDown
              size={16}
              className="text-[var(--color-text-muted)]"
            />
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]">
              {/* User info */}
              <div className="border-b border-[var(--color-border)] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-sm font-semibold text-[var(--color-primary)]">
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                      {fullName}
                    </p>

                    <p className="truncate text-xs text-[var(--color-text-muted)]">
                      {email}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-[var(--radius-md)] bg-slate-50 px-3 py-2">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Role
                  </p>

                  <p className="mt-0.5 text-sm font-medium capitalize text-[var(--color-text-primary)]">
                    {role.replaceAll("_", " ")}
                  </p>
                </div>
              </div>

              {/* Profile */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-slate-50 hover:text-[var(--color-text-primary)]"
              >
                <User size={17} />
                Profile
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 border-t border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-danger)] transition-colors hover:bg-red-50"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;