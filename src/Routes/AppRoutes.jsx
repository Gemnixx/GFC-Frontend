import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import SaleInvoice from "../Pages/sales/SaleInvoice";
import SaleHistory from "../Pages/sales/SaleHistory";
import AdvanceSale from "../Pages/sales/AdvanceSale";
import SaleReturn from "../Pages/sales/SaleReturn";
import Quotation from "../Pages/sales/Quotation";
import JvSale from "../Pages/sales/JvSale";
import PurchaseHistory from "../Pages/Purchase/PurchaseHistory";
import PurchaseReturn from "../Pages/Purchase/PurchaseReturn";
import PurchaseOrder from "../Pages/Purchase/PurchaseOrder";
import PurchaseInvoice from "../Pages/Purchase/PurchaseInvoice";
import CashBook from "../Pages/Cash&Accounting/CashBook";
import Receipt from "../Pages/Cash&Accounting/Receipt";
import Payment from "../Pages/Cash&Accounting/Payment";
import JournalVoucher from "../Pages/Cash&Accounting/JournalVoucher";
import Items from "../Pages/Inventory/Items";
import OpeningStock from "../Pages/Inventory/OpeningStock";
import StockAdjustment from "../Pages/Inventory/StockAdjustment";
import StockHistory from "../Pages/Inventory/StockHistory";
import Customers from "../Pages/Accounts/Customers";
import Suppliers from "../Pages/Accounts/Suppliers";
import ChartOfAccounts from "../Pages/Accounts/ChartOfAccounts";
import OpeningBalance from "../Pages/Opening/OpeningBalance";
import SalesReport from "../Pages/Reports/SalesReport";
import PurchaseReport from "../Pages/Reports/PurchaseReport";
import InventoryReport from "../Pages/Reports/InventoryReport";
import AccountingReport from "../Pages/Reports/AccountingReport";
import BackupRestore from "../Pages/Tools/BackupRestore";
import ImportExport from "../Pages/Tools/ImportExport";
import Setting from "../Pages/Tools/Setting";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Transactions */}
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

        {/* Inventory */}
        <Route path="/inventory/items" element={<Items />} />
        <Route path="/inventory/opening-stock" element={<OpeningStock />} />
        <Route path="/inventory/adjustment" element={<StockAdjustment />} />
        <Route path="/inventory/history" element={<StockHistory />} />

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

        {/* Tools */}
        <Route path="/tools/backup" element={<BackupRestore/>} />
        <Route path="/tools/import-export" element={<ImportExport/>} />
        <Route path="/tools/settings" element={<Setting/>} />
      </Route>

      {/* Unknown route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
