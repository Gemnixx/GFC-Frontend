import {
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  FileText,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Total Sales",
    value: "—",
    icon: CircleDollarSign,
    description: "Sales overview",
  },
  {
    title: "Total Purchases",
    value: "—",
    icon: ShoppingCart,
    description: "Purchase overview",
  },
  {
    title: "Receivables",
    value: "—",
    icon: ArrowDownLeft,
    description: "Outstanding customer balance",
  },
  {
    title: "Payables",
    value: "—",
    icon: ArrowUpRight,
    description: "Outstanding supplier balance",
  },
];

const modules = [
  {
    title: "Sales",
    description: "Manage invoices, quotations and returns",
    icon: ShoppingCart,
  },
  {
    title: "Purchases",
    description: "Manage purchase invoices and returns",
    icon: Package,
  },
  {
    title: "Inventory",
    description: "Monitor stock and inventory movements",
    icon: Boxes,
  },
  {
    title: "Accounts",
    description: "Manage customers, suppliers and accounts",
    icon: Users,
  },
];

function Dashboard() {
  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Welcome to GFC Outlet Management & Accounting.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-muted)]">
                    {stat.title}
                  </p>

                  <h2 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
                    {stat.value}
                  </h2>

                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {stat.description}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Business Overview */}
        <div className="xl:col-span-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="border-b border-[var(--color-border)] px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[var(--color-text-primary)]">
                  Business Overview
                </h2>

                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Your business performance at a glance
                </p>
              </div>

              <FileText
                size={20}
                className="text-[var(--color-text-muted)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--color-border)] p-5">
              <p className="text-sm text-[var(--color-text-muted)]">
                Sales
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <ArrowUpRight size={18} />
                </div>

                <span className="text-sm text-[var(--color-text-muted)]">
                  Data will appear here
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] p-5">
              <p className="text-sm text-[var(--color-text-muted)]">
                Purchases
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                  <ArrowDownLeft size={18} />
                </div>

                <span className="text-sm text-[var(--color-text-muted)]">
                  Data will appear here
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="border-b border-[var(--color-border)] px-6 py-5">
            <h2 className="font-semibold text-[var(--color-text-primary)]">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Common operations
            </p>
          </div>

          <div className="space-y-3 p-5">
            <button className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] p-4 text-left transition-colors hover:bg-[var(--color-background)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <ShoppingCart size={18} />
              </div>

              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  New Sale
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Create sale invoice
                </p>
              </div>
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] p-4 text-left transition-colors hover:bg-[var(--color-background)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <Package size={18} />
              </div>

              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  New Purchase
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Create purchase invoice
                </p>
              </div>
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] p-4 text-left transition-colors hover:bg-[var(--color-background)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <Users size={18} />
              </div>

              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  Customers
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Manage customer accounts
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div>
        <div className="mb-4">
          <h2 className="font-semibold text-[var(--color-text-primary)]">
            Management Modules
          </h2>

          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Access your main business operations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <div
                key={module.title}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <Icon size={20} />
                </div>

                <h3 className="font-medium text-[var(--color-text-primary)]">
                  {module.title}
                </h3>

                <p className="mt-1.5 text-sm leading-5 text-[var(--color-text-muted)]">
                  {module.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;