import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Package,
  Boxes,
  X,
  Save,
  ClipboardList,
} from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Card from "../../components/common/Card";
import { useAuth } from "../../context/AuthContext";

const API_URL = "http://localhost:3000/api/v1";

const getToken = () => {
  return localStorage.getItem("gfc_access_token");
};

const formatNumber = (value = 0) => {
  return Number(value || 0).toLocaleString("en-PK");
};

const formatCurrency = (value = 0) => {
  return `Rs. ${formatNumber(value)}`;
};

const formatDate = (date) => {
  if (!date) return "-";

  try {
    return new Date(date).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

function OpeningStock() {
  const { user } = useAuth();

  const organizationId =
    user?.organizationId ||
    user?.organization?._id ||
    "";

  const [items, setItems] = useState([]);
  const [openingStocks, setOpeningStocks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [itemRemarks, setItemRemarks] = useState("");

  const [draftItems, setDraftItems] = useState([]);

  const [movementDate, setMovementDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [remarks, setRemarks] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadingRef = useRef(false);

  // ==================================================
  // API REQUEST
  // ==================================================

  const request = async (url, options = {}) => {
    const token = getToken();

    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          "Something went wrong while processing request"
      );
    }

    return data;
  };

  // ==================================================
  // LOAD DATA
  // ==================================================

  const loadData = async () => {
    if (!organizationId || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError("");

    try {
      const [itemsResponse, openingResponse] = await Promise.all([
        request(
          `/items?organizationId=${organizationId}&limit=1000`
        ),

        request(
          `/stock/opening?organizationId=${organizationId}&limit=1000`
        ),
      ]);

      setItems(itemsResponse?.data || []);
      setOpeningStocks(openingResponse?.data || []);
    } catch (err) {
      console.error("Opening stock load error:", err);

      setError(
        err.message || "Failed to load opening stock data"
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [organizationId]);

  // ==================================================
  // ITEM MAP
  // ==================================================

  const itemMap = useMemo(() => {
    const map = new Map();

    items.forEach((item) => {
      map.set(item._id, item);
    });

    return map;
  }, [items]);

  // ==================================================
  // POSTED OPENING STOCK ITEM IDS
  // ==================================================

  const postedItemIds = useMemo(() => {
    return new Set(
      openingStocks
        .map((entry) => {
          if (typeof entry.itemId === "object") {
            return entry.itemId?._id;
          }

          return entry.itemId;
        })
        .filter(Boolean)
    );
  }, [openingStocks]);

  // ==================================================
  // AVAILABLE ITEMS
  // ==================================================

  const availableItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      if (!item.isActive) {
        return false;
      }

      // Service items don't have stock
      if (item.type === "service" || item.isService) {
        return false;
      }

      // Already posted opening stock
      if (postedItemIds.has(item._id)) {
        return false;
      }

      // Already added to current draft
      if (
        draftItems.some(
          (draft) => draft.itemId === item._id
        )
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      const model =
        item?.attributes?.model ||
        item?.attributes?.Model ||
        "";

      const category =
        item?.categoryId?.name ||
        "";

      return (
        item?.name?.toLowerCase().includes(query) ||
        item?.code?.toLowerCase().includes(query) ||
        item?.barcode?.toLowerCase().includes(query) ||
        model.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query)
      );
    });
  }, [
    items,
    postedItemIds,
    draftItems,
    search,
  ]);

  // ==================================================
  // DRAFT SUMMARY
  // ==================================================

  const draftTotalQuantity = useMemo(() => {
    return draftItems.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    );
  }, [draftItems]);

  const draftTotalValue = useMemo(() => {
    return draftItems.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0) *
          Number(item.rate || 0),
      0
    );
  }, [draftItems]);

  // ==================================================
  // OPEN ADD ITEM MODAL
  // ==================================================

  const openAddModal = () => {
    setError("");
    setSearch("");
    setSelectedItem(null);
    setQuantity("");
    setRate("");
    setItemRemarks("");
    setShowAddModal(true);
  };

  // ==================================================
  // SELECT ITEM
  // ==================================================

  const handleSelectItem = (item) => {
    setSelectedItem(item);

    setQuantity("");
    setRate(item?.purchasePrice || "");
    setItemRemarks("");

    setError("");
  };

  // ==================================================
  // ADD ITEM TO DRAFT
  // ==================================================

  const handleAddToDraft = () => {
    setError("");

    if (!selectedItem) {
      setError("Please select an item.");
      return;
    }

    const qty = Number(quantity);
    const itemRate = Number(rate);

    if (!qty || qty <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    if (
      Number.isNaN(itemRate) ||
      itemRate < 0
    ) {
      setError("Please enter a valid rate.");
      return;
    }

    const exists = draftItems.some(
      (item) =>
        item.itemId === selectedItem._id
    );

    if (exists) {
      setError(
        "This item is already added to the draft."
      );
      return;
    }

    const model =
      selectedItem?.attributes?.model ||
      selectedItem?.attributes?.Model ||
      "";

    const draftItem = {
      itemId: selectedItem._id,

      name: selectedItem.name,

      code: selectedItem.code,

      barcode: selectedItem.barcode || "",

      model,

      category:
        selectedItem?.categoryId?.name || "-",

      unit:
        selectedItem?.unitId?.name || "-",

      quantity: qty,

      rate: itemRate,

      remarks: itemRemarks.trim(),

      total: qty * itemRate,
    };

    setDraftItems((prev) => [
      ...prev,
      draftItem,
    ]);

    setSelectedItem(null);
    setQuantity("");
    setRate("");
    setItemRemarks("");
    setShowAddModal(false);
    setSearch("");
  };

  // ==================================================
  // REMOVE DRAFT ITEM
  // ==================================================

  const handleRemoveDraft = (itemId) => {
    setDraftItems((prev) =>
      prev.filter(
        (item) => item.itemId !== itemId
      )
    );
  };

  // ==================================================
  // CLEAR DRAFT
  // ==================================================

  const handleClearDraft = () => {
    if (saving) return;

    setDraftItems([]);
    setError("");
  };

  // ==================================================
  // SAVE / POST OPENING STOCK
  // ==================================================

  const handleSaveOpeningStock = async () => {
    setError("");
    setSuccess("");

    if (!organizationId) {
      setError(
        "Organization information is missing."
      );
      return;
    }

    if (draftItems.length === 0) {
      setError(
        "Please add at least one item to the draft."
      );
      return;
    }

    if (!movementDate) {
      setError(
        "Please select movement date."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        organizationId,

        // Current backend uses default/null outlet
        outletId: null,

        movementDate,

        remarks: remarks.trim(),

        items: draftItems.map((item) => ({
          itemId: item.itemId,

          quantity: Number(
            item.quantity
          ),

          rate: Number(
            item.rate
          ),

          remarks:
            item.remarks || "",
        })),
      };

      await request(
        "/stock/opening",
        {
          method: "POST",

          body: JSON.stringify(
            payload
          ),
        }
      );

      setSuccess(
        "Opening stock posted successfully."
      );

      setDraftItems([]);

      setRemarks("");

      setMovementDate(
        new Date()
          .toISOString()
          .split("T")[0]
      );

      await loadData();
    } catch (err) {
      console.error(
        "Save opening stock error:",
        err
      );

      setError(
        err.message ||
          "Failed to save opening stock."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // REFRESH
  // ==================================================

  const handleRefresh = async () => {
    setSuccess("");
    setError("");

    await loadData();
  };

  // ==================================================
  // HISTORY ITEM
  // ==================================================

  const getHistoryItem = (row) => {
    const itemId =
      typeof row.itemId === "object"
        ? row.itemId?._id
        : row.itemId;

    return itemMap.get(itemId);
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              <Package size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
                Opening Stock
              </h1>

              <p className="text-sm text-[var(--color-text-secondary)]">
                Add and manage your initial inventory stock
              </p>
            </div>

          </div>
        </div>

        <div className="flex items-center gap-2">

          <Button
            type="button"
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            icon={
              <RefreshCw
                size={16}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
            }
          >
            Refresh
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={openAddModal}
            icon={<Plus size={17} />}
          >
            Add Item
          </Button>

        </div>
      </div>

      {/* ==================================================
          ALERTS
      ================================================== */}

      {error && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="shrink-0"
          >
            <X size={17} />
          </button>

        </div>
      )}

      {success && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

          <span>{success}</span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
            className="shrink-0"
          >
            <X size={17} />
          </button>

        </div>
      )}

      {/* ==================================================
          SUMMARY
      ================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

        <Card>
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-[var(--color-text-muted)]">
                Available Items
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[var(--color-text-primary)]">
                {availableItems.length}
              </h2>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Boxes size={20} />
            </div>

          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-[var(--color-text-muted)]">
                Draft Quantity
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[var(--color-text-primary)]">
                {formatNumber(
                  draftTotalQuantity
                )}
              </h2>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <ClipboardList size={20} />
            </div>

          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-[var(--color-text-muted)]">
                Draft Value
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[var(--color-text-primary)]">
                {formatCurrency(
                  draftTotalValue
                )}
              </h2>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <Package size={20} />
            </div>

          </div>
        </Card>

      </div>

      {/* ==================================================
          DRAFT ITEMS
      ================================================== */}

      <Card className="mb-6">

        <div className="mb-5 flex flex-col gap-3 border-b border-[var(--color-border-light)] pb-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Draft Items
            </h2>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Items added here will be posted as opening stock.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="text-[var(--color-text-muted)]">
                Items:
              </span>{" "}
              <strong className="text-[var(--color-text-primary)]">
                {draftItems.length}
              </strong>
            </div>

            <div className="rounded-lg bg-[var(--color-primary-light)] px-3 py-2 text-sm">
              <span className="text-[var(--color-text-muted)]">
                Value:
              </span>{" "}
              <strong className="text-[var(--color-primary)]">
                {formatCurrency(
                  draftTotalValue
                )}
              </strong>
            </div>

          </div>
        </div>

        {draftItems.length === 0 ? (

          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-slate-50 px-4 text-center">

            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--color-text-muted)] shadow-sm">
              <ClipboardList size={22} />
            </div>

            <h3 className="font-semibold text-[var(--color-text-primary)]">
              No Draft Items
            </h3>

            <p className="mt-1 max-w-md text-sm text-[var(--color-text-muted)]">
              Add items from your inventory to prepare the opening stock.
            </p>

            <Button
              type="button"
              variant="primary"
              className="mt-4"
              onClick={openAddModal}
              icon={<Plus size={16} />}
            >
              Add Item
            </Button>

          </div>

        ) : (

          <>
            <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">

              <table className="w-full min-w-[1050px] text-left">

                <thead className="bg-slate-50">

                  <tr className="border-b border-[var(--color-border)]">

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Item
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Category
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Unit
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Quantity
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Rate
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Total
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Remarks
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {draftItems.map((item) => (

                    <tr
                      key={item.itemId}
                      className="border-b border-[var(--color-border-light)] last:border-b-0 hover:bg-slate-50"
                    >

                      <td className="px-4 py-4">

                        <div>

                          <p className="font-semibold text-[var(--color-text-primary)]">
                            {item.name}
                          </p>

                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]">

                            <span>
                              Code:{" "}
                              {item.code || "-"}
                            </span>

                            {item.model && (
                              <span>
                                Model:{" "}
                                {item.model}
                              </span>
                            )}

                            {item.barcode && (
                              <span>
                                Barcode:{" "}
                                {item.barcode}
                              </span>
                            )}

                          </div>

                        </div>

                      </td>

                      <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)]">
                        {item.category}
                      </td>

                      <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)]">
                        {item.unit}
                      </td>

                      <td className="px-4 py-4 text-right text-sm font-medium text-[var(--color-text-primary)]">
                        {formatNumber(
                          item.quantity
                        )}
                      </td>

                      <td className="px-4 py-4 text-right text-sm text-[var(--color-text-secondary)]">
                        {formatCurrency(
                          item.rate
                        )}
                      </td>

                      <td className="px-4 py-4 text-right text-sm font-semibold text-[var(--color-text-primary)]">
                        {formatCurrency(
                          item.total
                        )}
                      </td>

                      <td className="max-w-[180px] px-4 py-4 text-sm text-[var(--color-text-secondary)]">
                        {item.remarks || "-"}
                      </td>

                      <td className="px-4 py-4 text-center">

                        <Button
                          type="button"
                          variant="danger"
                          onClick={() =>
                            handleRemoveDraft(
                              item.itemId
                            )
                          }
                          icon={<Trash2 size={16} />}
                        />

                      </td>

                    </tr>

                  ))}

                </tbody>

                <tfoot>

                  <tr className="bg-slate-50">

                    <td
                      colSpan={3}
                      className="px-4 py-4 text-right font-semibold text-[var(--color-text-primary)]"
                    >
                      Total
                    </td>

                    <td className="px-4 py-4 text-right font-bold text-[var(--color-text-primary)]">
                      {formatNumber(
                        draftTotalQuantity
                      )}
                    </td>

                    <td></td>

                    <td className="px-4 py-4 text-right font-bold text-[var(--color-primary)]">
                      {formatCurrency(
                        draftTotalValue
                      )}
                    </td>

                    <td colSpan={2}></td>

                  </tr>

                </tfoot>

              </table>

            </div>

            {/* POST FORM */}

            <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-slate-50 p-4">

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <Input
                  label="Movement Date"
                  type="date"
                  value={movementDate}
                  onChange={(e) =>
                    setMovementDate(
                      e.target.value
                    )
                  }
                />

                <Input
                  label="Remarks"
                  value={remarks}
                  onChange={(e) =>
                    setRemarks(
                      e.target.value
                    )
                  }
                  placeholder="Optional remarks"
                />

              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">

                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    handleClearDraft
                  }
                  disabled={saving}
                >
                  Clear Draft
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  onClick={
                    handleSaveOpeningStock
                  }
                  disabled={saving}
                  loading={saving}
                  icon={
                    !saving && (
                      <Save size={17} />
                    )
                  }
                >
                  {saving
                    ? "Posting..."
                    : "Save / Post Opening Stock"}
                </Button>

              </div>

            </div>
          </>
        )}

      </Card>

      {/* ==================================================
          OPENING STOCK HISTORY
      ================================================== */}

      <Card>

        <div className="mb-5 flex flex-col gap-2 border-b border-[var(--color-border-light)] pb-4">

          <div>

            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Opening Stock History
            </h2>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Stock entries that have already been posted.
            </p>

          </div>

        </div>

        {loading ? (

          <div className="flex min-h-[180px] items-center justify-center">

            <RefreshCw
              size={24}
              className="animate-spin text-[var(--color-primary)]"
            />

          </div>

        ) : openingStocks.length === 0 ? (

          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-slate-50 text-center">

            <Package
              size={28}
              className="mb-3 text-[var(--color-text-muted)]"
            />

            <h3 className="font-semibold text-[var(--color-text-primary)]">
              No Opening Stock Posted
            </h3>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Your posted opening stock entries will appear here.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">

            <table className="w-full min-w-[1150px] text-left">

              <thead className="bg-slate-50">

                <tr className="border-b border-[var(--color-border)]">

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Date
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Item
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Code
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Model
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Category
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Unit
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Quantity
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Rate
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Value
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Remarks
                  </th>

                </tr>

              </thead>

              <tbody>

                {openingStocks.map((row) => {

                  const item =
                    getHistoryItem(row);

                  const populatedItem =
                    typeof row.itemId === "object"
                      ? row.itemId
                      : null;

                  const itemName =
                    item?.name ||
                    populatedItem?.name ||
                    "-";

                  const itemCode =
                    item?.code ||
                    populatedItem?.code ||
                    "-";

                  const model =
                    item?.attributes?.model ||
                    item?.attributes?.Model ||
                    "-";

                  const category =
                    item?.categoryId?.name ||
                    "-";

                  const unit =
                    item?.unitId?.name ||
                    "-";

                  return (
                    <tr
                      key={row._id}
                      className="border-b border-[var(--color-border-light)] last:border-b-0 hover:bg-slate-50"
                    >

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--color-text-secondary)]">
                        {formatDate(
                          row.movementDate
                        )}
                      </td>

                      <td className="px-4 py-4">

                        <p className="font-semibold text-[var(--color-text-primary)]">
                          {itemName}
                        </p>

                      </td>

                      <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)]">
                        {itemCode}
                      </td>

                      <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)]">
                        {model}
                      </td>

                      <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)]">
                        {category}
                      </td>

                      <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)]">
                        {unit}
                      </td>

                      <td className="px-4 py-4 text-right text-sm font-semibold text-[var(--color-text-primary)]">
                        {formatNumber(
                          row.quantity
                        )}
                      </td>

                      <td className="px-4 py-4 text-right text-sm text-[var(--color-text-secondary)]">
                        {formatCurrency(
                          row.rate
                        )}
                      </td>

                      <td className="px-4 py-4 text-right text-sm font-semibold text-[var(--color-text-primary)]">
                        {formatCurrency(
                          row.totalValue
                        )}
                      </td>

                      <td className="max-w-[200px] px-4 py-4 text-sm text-[var(--color-text-secondary)]">
                        {row.remarks || "-"}
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </Card>

      {/* ==================================================
          ADD ITEM MODAL
      ================================================== */}

      {showAddModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">

              <div>

                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Add Opening Stock Item
                </h2>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Select an inventory item and add its opening quantity.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddModal(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-slate-100"
              >
                <X size={19} />
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="flex-1 overflow-y-auto p-5">

              {!selectedItem ? (

                <>
                  <div className="mb-4">

                    <Input
                      label="Search Item"
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search by name, code, barcode, model..."
                      icon={
                        <Search size={17} />
                      }
                    />

                  </div>

                  {availableItems.length === 0 ? (

                    <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-slate-50 text-center">

                      <Package
                        size={28}
                        className="mb-3 text-[var(--color-text-muted)]"
                      />

                      <h3 className="font-semibold text-[var(--color-text-primary)]">
                        No Available Items
                      </h3>

                      <p className="mt-1 max-w-md text-sm text-[var(--color-text-muted)]">
                        All active inventory items may already have opening stock posted or added to the draft.
                      </p>

                    </div>

                  ) : (

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                      {availableItems.map(
                        (item) => {

                          const model =
                            item?.attributes?.model ||
                            item?.attributes?.Model ||
                            "";

                          return (

                            <button
                              type="button"
                              key={item._id}
                              onClick={() =>
                                handleSelectItem(
                                  item
                                )
                              }
                              className="rounded-xl border border-[var(--color-border)] bg-white p-4 text-left transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                            >

                              <div className="flex items-start justify-between gap-3">

                                <div className="min-w-0">

                                  <h3 className="font-semibold text-[var(--color-text-primary)]">
                                    {item.name}
                                  </h3>

                                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]">

                                    <span>
                                      Code:{" "}
                                      {item.code ||
                                        "-"}
                                    </span>

                                    {model && (
                                      <span>
                                        Model:{" "}
                                        {model}
                                      </span>
                                    )}

                                    {item.barcode && (
                                      <span>
                                        Barcode:{" "}
                                        {
                                          item.barcode
                                        }
                                      </span>
                                    )}

                                  </div>

                                </div>

                                <Plus
                                  size={18}
                                  className="shrink-0 text-[var(--color-primary)]"
                                />

                              </div>

                              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[var(--color-border-light)] pt-3">

                                <div>

                                  <p className="text-[11px] text-[var(--color-text-muted)]">
                                    Category
                                  </p>

                                  <p className="mt-1 text-xs font-medium text-[var(--color-text-primary)]">
                                    {item?.categoryId?.name ||
                                      "-"}
                                  </p>

                                </div>

                                <div>

                                  <p className="text-[11px] text-[var(--color-text-muted)]">
                                    Unit
                                  </p>

                                  <p className="mt-1 text-xs font-medium text-[var(--color-text-primary)]">
                                    {item?.unitId?.name ||
                                      "-"}
                                  </p>

                                </div>

                                <div>

                                  <p className="text-[11px] text-[var(--color-text-muted)]">
                                    Purchase Rate
                                  </p>

                                  <p className="mt-1 text-xs font-medium text-[var(--color-text-primary)]">
                                    {formatCurrency(
                                      item.purchasePrice
                                    )}
                                  </p>

                                </div>

                              </div>

                            </button>

                          );
                        }
                      )}

                    </div>

                  )}

                </>

              ) : (

                <div>

                  {/* SELECTED ITEM */}

                  <div className="mb-5 rounded-xl border border-[var(--color-primary)] bg-[var(--color-primary-light)] p-4">

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-primary)]">
                          Selected Item
                        </p>

                        <h3 className="mt-1 text-lg font-bold text-[var(--color-text-primary)]">
                          {selectedItem.name}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-[var(--color-text-secondary)]">

                          <span>
                            Code:{" "}
                            {selectedItem.code ||
                              "-"}
                          </span>

                          <span>
                            Category:{" "}
                            {selectedItem?.categoryId?.name ||
                              "-"}
                          </span>

                          <span>
                            Unit:{" "}
                            {selectedItem?.unitId?.name ||
                              "-"}
                          </span>

                        </div>

                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectedItem(
                            null
                          );

                          setQuantity("");

                          setRate("");

                          setItemRemarks("");
                        }}
                      >
                        Change Item
                      </Button>

                    </div>

                  </div>

                  {error && (

                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>

                  )}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    <Input
                      label="Quantity"
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          e.target.value
                        )
                      }
                      placeholder="Enter quantity"
                      required
                    />

                    <Input
                      label="Rate"
                      type="number"
                      min="0"
                      value={rate}
                      onChange={(e) =>
                        setRate(
                          e.target.value
                        )
                      }
                      placeholder="Enter rate"
                      required
                    />

                    <Input
                      label="Remarks"
                      value={itemRemarks}
                      onChange={(e) =>
                        setItemRemarks(
                          e.target.value
                        )
                      }
                      placeholder="Optional"
                    />

                  </div>

                  <div className="mt-5 rounded-xl bg-slate-50 p-4">

                    <div className="flex items-center justify-between">

                      <span className="text-sm text-[var(--color-text-muted)]">
                        Total Opening Value
                      </span>

                      <strong className="text-xl font-bold text-[var(--color-primary)]">
                        {formatCurrency(
                          Number(
                            quantity || 0
                          ) *
                            Number(
                              rate || 0
                            )
                        )}
                      </strong>

                    </div>

                  </div>

                </div>

              )}

            </div>

            {/* MODAL FOOTER */}

            <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] bg-slate-50 px-5 py-4">

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setShowAddModal(false)
                }
              >
                Cancel
              </Button>

              {selectedItem && (

                <Button
                  type="button"
                  variant="primary"
                  onClick={
                    handleAddToDraft
                  }
                  icon={
                    <Plus size={17} />
                  }
                >
                  Add to Draft
                </Button>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default OpeningStock;