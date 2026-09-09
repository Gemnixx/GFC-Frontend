import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import Dashboard from "../pages/Dashboard";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Transactions */}
        <Route path="/sales/invoice" element={<h1>Sale Invoice</h1>} />
        <Route path="/sales/history" element={<h1>Sale History</h1>} />
        <Route path="/sales/advance" element={<h1>Advance Sale</h1>} />
        <Route path="/sales/return" element={<h1>Sale Return</h1>} />
        <Route path="/sales/quotation" element={<h1>Quotation</h1>} />
        <Route path="/sales/jv" element={<h1>JV Sale</h1>} />

        {/* Purchases */}
        <Route
          path="/purchases/history"
          element={<h1>Purchase History</h1>}
        />
        <Route
          path="/purchases/return"
          element={<h1>Purchase Return</h1>}
        />
        <Route
          path="/purchases/order"
          element={<h1>Purchase Order</h1>}
        />
        <Route
          path="/purchases/invoice"
          element={<h1>Purchase Invoice</h1>}
        />

        {/* Cash & Accounting */}
        <Route
          path="/accounting/cash-book"
          element={<h1>Cash Book</h1>}
        />
        <Route
          path="/accounting/receipt"
          element={<h1>Receipt</h1>}
        />
        <Route
          path="/accounting/payment"
          element={<h1>Payment</h1>}
        />
        <Route
          path="/accounting/journal-voucher"
          element={<h1>Journal Voucher</h1>}
        />

        {/* Inventory */}
        <Route
          path="/inventory/items"
          element={<h1>Items</h1>}
        />
        <Route
          path="/inventory/opening-stock"
          element={<h1>Opening Stock</h1>}
        />
        <Route
          path="/inventory/adjustment"
          element={<h1>Stock Adjustment</h1>}
        />
        <Route
          path="/inventory/history"
          element={<h1>Stock History</h1>}
        />

        {/* Accounts */}
        <Route
          path="/accounts/customers"
          element={<h1>Customers</h1>}
        />
        <Route
          path="/accounts/suppliers"
          element={<h1>Suppliers</h1>}
        />
        <Route
          path="/accounts/chart"
          element={<h1>Chart of Accounts</h1>}
        />

        {/* Opening */}
        <Route
          path="/opening/balance"
          element={<h1>Opening Balance</h1>}
        />

        {/* Reports */}
        <Route
          path="/reports/sales"
          element={<h1>Sales Report</h1>}
        />
        <Route
          path="/reports/purchases"
          element={<h1>Purchase Report</h1>}
        />
        <Route
          path="/reports/inventory"
          element={<h1>Inventory Report</h1>}
        />
        <Route
          path="/reports/accounting"
          element={<h1>Accounting Report</h1>}
        />

        {/* Tools */}
        <Route
          path="/tools/backup"
          element={<h1>Backup & Restore</h1>}
        />
        <Route
          path="/tools/import-export"
          element={<h1>Import / Export</h1>}
        />
        <Route
          path="/tools/settings"
          element={<h1>Settings</h1>}
        />
      </Route>

      {/* Unknown route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;