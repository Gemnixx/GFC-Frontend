import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import DashboardLayout from "../components/layout/DashboardLayout";
import Dashboard from "../Pages/Dashboard";

// Organization & Outlet
import Organizations from "../Pages/Organization/Organizations";
import Outlets from "../Pages/Outlet/Outlets";

// Master Data
import Categories from "../Pages/Categories/Categories";
import Units from "../Pages/Units/Units";

// Sales
import SaleInvoice from "../Pages/sales/SaleInvoice";
import SaleHistory from "../Pages/sales/SaleHistory";
import AdvanceSale from "../Pages/sales/AdvanceSale";
import SaleReturn from "../Pages/sales/SaleReturn";
import Quotation from "../Pages/sales/Quotation";
import JvSale from "../Pages/sales/JvSale";

// Purchases
import PurchaseHistory from "../Pages/Purchase/PurchaseHistory";
import PurchaseReturn from "../Pages/Purchase/PurchaseReturn";
import PurchaseOrder from "../Pages/Purchase/PurchaseOrder";
import PurchaseInvoice from "../Pages/Purchase/PurchaseInvoice";

// Cash & Accounting
import CashBook from "../Pages/Cash&Accounting/CashBook";
import Receipt from "../Pages/Cash&Accounting/Receipt";
import Payment from "../Pages/Cash&Accounting/Payment";
import JournalVoucher from "../Pages/Cash&Accounting/JournalVoucher";
import TrialBalance from "../Pages/Accounting/TrialBalance";

// Inventory
import Items from "../Pages/Inventory/Items";
import OpeningStock from "../Pages/Inventory/OpeningStock";
import StockAdjustment from "../Pages/Inventory/StockAdjustment";
import StockHistory from "../Pages/Inventory/StockHistory";
import StockSummary from "../Pages/Inventory/StockSummary";
import InventoryMovements from "../Pages/Inventory/InventoryMovements";

// Accounts
import Customers from "../Pages/Accounts/Customers";
import Suppliers from "../Pages/Accounts/Suppliers";
import ChartOfAccounts from "../Pages/Accounts/ChartOfAccounts";

// Opening
import OpeningBalance from "../Pages/Opening/OpeningBalance";

// Reports
import SalesReport from "../Pages/Reports/SalesReport";
import PurchaseReport from "../Pages/Reports/PurchaseReport";
import InventoryReport from "../Pages/Reports/InventoryReport";
import AccountingReport from "../Pages/Reports/AccountingReport";
import FinancialReport from "../Pages/Reports/FinancialReport";
import CustomerBalances from "../Pages/Reports/CustomerBalances";
import SupplierBalances from "../Pages/Reports/SupplierBalances";

// Tools
import BackupRestore from "../Pages/Tools/BackupRestore";
import ImportExport from "../Pages/Tools/ImportExport";
import Setting from "../Pages/Tools/Setting";

// Authentication
import Login from "../Pages/Authentication/Login";

function AppRoutes() {
  return (
    <Routes>
      {/* Authentication */}
      <Route path="/login" element={<Login />} />

      {/* Protected Application Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Organization & Outlet */}
          <Route path="/organization" element={<Organizations />} />
          <Route path="/outlets" element={<Outlets />} />

          {/* Master Data */}
          <Route path="/categories" element={<Categories />} />
          <Route path="/units" element={<Units />} />

          {/* Sales */}
          <Route path="/sales/invoice" element={<SaleInvoice />} />
          <Route path="/sales/history" element={<SaleHistory />} />
          <Route path="/sales/advance" element={<AdvanceSale />} />
          <Route path="/sales/return" element={<SaleReturn />} />
          <Route path="/sales/quotation" element={<Quotation />} />
          <Route path="/sales/jv" element={<JvSale />} />

          {/* Purchases */}
          <Route path="/purchases/history" element={<PurchaseHistory />} />
          <Route path="/purchases/return" element={<PurchaseReturn />} />
          <Route path="/purchases/order" element={<PurchaseOrder />} />
          <Route path="/purchases/invoice" element={<PurchaseInvoice />} />

          {/* Cash & Accounting */}
          <Route path="/accounting/cash-book" element={<CashBook />} />
          <Route path="/accounting/receipt" element={<Receipt />} />
          <Route path="/accounting/payment" element={<Payment />} />
          <Route
            path="/accounting/journal-voucher"
            element={<JournalVoucher />}
          />
          <Route
            path="/accounting/trial-balance"
            element={<TrialBalance />}
          />

          {/* Inventory */}
          <Route path="/inventory/items" element={<Items />} />
          <Route
            path="/inventory/opening-stock"
            element={<OpeningStock />}
          />
          <Route
            path="/inventory/adjustment"
            element={<StockAdjustment />}
          />
          <Route path="/inventory/history" element={<StockHistory />} />
          <Route path="/inventory/summary" element={<StockSummary />} />
          <Route
            path="/inventory/movements"
            element={<InventoryMovements />}
          />

          {/* Accounts */}
          <Route path="/accounts/customers" element={<Customers />} />
          <Route path="/accounts/suppliers" element={<Suppliers />} />
          <Route path="/accounts/chart" element={<ChartOfAccounts />} />

          {/* Opening */}
          <Route path="/opening/balance" element={<OpeningBalance />} />

          {/* Reports */}
          <Route path="/reports/sales" element={<SalesReport />} />
          <Route path="/reports/purchases" element={<PurchaseReport />} />
          <Route path="/reports/inventory" element={<InventoryReport />} />
          <Route path="/reports/accounting" element={<AccountingReport />} />
          <Route path="/reports/financial" element={<FinancialReport />} />
          <Route
            path="/reports/customer-balances"
            element={<CustomerBalances />}
          />
          <Route
            path="/reports/supplier-balances"
            element={<SupplierBalances />}
          />

          {/* Tools */}
          <Route path="/tools/backup" element={<BackupRestore />} />
          <Route
            path="/tools/import-export"
            element={<ImportExport />}
          />
          <Route path="/tools/settings" element={<Setting />} />

        </Route>
      </Route>

      {/* Unknown Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;