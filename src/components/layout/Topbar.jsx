function Topbar() {
  return (
    <header className="flex h-[var(--topbar-height)] items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6">
      {/* Page title */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Dashboard
        </h2>

        <p className="text-xs text-[var(--color-text-muted)]">
          Welcome back, Admin
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
          <span className="text-base">🔔</span>

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--color-danger)]" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-sm font-semibold text-[var(--color-primary)]">
            A
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Admin
            </p>

            <p className="text-xs text-[var(--color-text-muted)]">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;