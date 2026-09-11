import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", path: "/dashboard" },

  { label: "Organization", path: "/organization" },

  { label: "Outlets", path: "/outlets" },

  {
    label: "Master Data",
    items: [
      { label: "Categories", path: "/categories" },
      { label: "Units", path: "/units" },
    ],
  },

  {
    label: "Sales",
    items: [
      { label: "Sale Invoice", path: "/sales/invoice" },
      { label: "Sale Return", path: "/sales/return" },
      { label: "Advance Sale", path: "/sales/advance" },
      { label: "Quotation", path: "/sales/quotation" },
      { label: "JV Sale", path: "/sales/jv" },
      { label: "Sale History", path: "/sales/history" },
    ],
  },

  {
    label: "Purchases",
    items: [
      { label: "Purchase Order", path: "/purchases/order" },
      { label: "Purchase Invoice", path: "/purchases/invoice" },
      { label: "Purchase Return", path: "/purchases/return" },
      { label: "Purchase History", path: "/purchases/history" },
    ],
  },

  {
    label: "Cash & Accounting",
    items: [
      { label: "Receipt", path: "/accounting/receipt" },
      { label: "Payment", path: "/accounting/payment" },
      { label: "Cash Book", path: "/accounting/cash-book" },
      { label: "Journal Voucher", path: "/accounting/journal-voucher" },
      { label: "Trial Balance", path: "/accounting/trial-balance" },
    ],
  },

  {
    label: "Inventory",
    items: [
      { label: "Items", path: "/inventory/items" },
      { label: "Opening Stock", path: "/inventory/opening-stock" },
      { label: "Stock Adjustment", path: "/inventory/adjustment" },
      { label: "Stock History", path: "/inventory/history" },
      { label: "Stock Summary", path: "/inventory/summary" },
      { label: "Stock Movements", path: "/inventory/movements" },
    ],
  },

  {
    label: "Accounts",
    items: [
      { label: "Customers", path: "/accounts/customers" },
      { label: "Suppliers", path: "/accounts/suppliers" },
      { label: "Chart of Accounts", path: "/accounts/chart" },
    ],
  },

  {
    label: "Opening",
    items: [
      { label: "Opening Balance", path: "/opening/balance" },
    ],
  },

  {
    label: "Reports",
    items: [
      { label: "Sales Report", path: "/reports/sales" },
      { label: "Purchase Report", path: "/reports/purchases" },
      { label: "Inventory Report", path: "/reports/inventory" },
      { label: "Accounting Report", path: "/reports/accounting" },
      { label: "Financial Report", path: "/reports/financial" },
      { label: "Customer Balances", path: "/reports/customer-balances" },
      { label: "Supplier Balances", path: "/reports/supplier-balances" },
    ],
  },

  {
    label: "Tools",
    items: [
      { label: "Backup & Restore", path: "/tools/backup" },
      { label: "Import / Export", path: "/tools/import-export" },
      { label: "Settings", path: "/tools/settings" },
    ],
  },
];

function Sidebar() {
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isMenuActive = (menu) => {
    return menu.items?.some((item) =>
      location.pathname.startsWith(item.path)
    );
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-width)] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Logo */}
      {/* Logo */}
<div className="flex h-[var(--topbar-height)] shrink-0 items-center border-b border-[var(--color-border)] px-5">
  <div className="flex flex-col items-start leading-none">
    <img
      src="/Gfc-logo.svg"
      alt="GFC Logo"
      className="h-11 w-auto object-contain"
    />

    <span className="mt-1.5 text-[11px] font-medium text-[var(--color-text-muted)]">
      Outlet Management
    </span>
  </div>
</div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {menuItems.map((menu) => {
            const menuActive = isMenuActive(menu);
            const menuOpen = Boolean(openMenus[menu.label]);

            return (
              <div key={menu.label}>
                {/* Normal Link */}
                {menu.path ? (
                  <NavLink
                    to={menu.path}
                    end
                    className={({ isActive }) =>
                      `flex w-full items-center rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                          : "text-[var(--color-text-secondary)] hover:bg-slate-50 hover:text-[var(--color-text-primary)]"
                      }`
                    }
                  >
                    {menu.label}
                  </NavLink>
                ) : (
                  <>
                    {/* Dropdown Parent */}
                    <button
                      type="button"
                      onClick={() => toggleMenu(menu.label)}
                      aria-expanded={menuOpen}
                      className={`flex w-full items-center justify-between rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors ${
                        menuActive
                          ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                          : "text-[var(--color-text-secondary)] hover:bg-slate-50 hover:text-[var(--color-text-primary)]"
                      }`}
                    >
                      <span>{menu.label}</span>

                      <span
                        className={`text-xs transition-transform duration-200 ${
                          menuOpen ? "rotate-90" : ""
                        }`}
                      >
                        ›
                      </span>
                    </button>

                    {/* Sub Links */}
                    {menuOpen && (
                      <div className="ml-3 mt-1 space-y-1 border-l border-[var(--color-border)] pl-3">
                        {menu.items.map((item) => (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                              `block rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors ${
                                isActive
                                  ? "bg-[var(--color-primary-light)] font-medium text-[var(--color-primary)]"
                                  : "text-[var(--color-text-muted)] hover:bg-slate-50 hover:text-[var(--color-text-primary)]"
                              }`
                            }
                          >
                            {item.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-[var(--color-border)] p-3">
        <div className="rounded-[var(--radius-md)] bg-slate-50 px-3 py-2">
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            GFC Software
          </p>

          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            Management & Accounting
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;