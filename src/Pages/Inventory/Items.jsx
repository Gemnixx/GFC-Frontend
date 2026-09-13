import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Edit,
  Folder,
  FolderPlus,
  Package,
  Plus,
  Search,
  Trash2,
  Boxes,
  Ruler,
  Check,
  RotateCcw,
} from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Modal from "../../components/common/Modal";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";

import { useAuth } from "../../context/AuthContext.jsx";
import { getAccessToken } from "../../utils/storage";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

function Items() {
  const { user } = useAuth();

  const organizationId =
    user?.organizationId ||
    user?.organization?._id ||
    "";

  // ==================================================
  // DATA
  // ==================================================

  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // ==================================================
  // CATEGORY SEARCH & FILTERS
  // ==================================================

  const [categorySearch, setCategorySearch] = useState("");
  const [categoryStatusFilter, setCategoryStatusFilter] =
    useState("active");

  // ==================================================
  // ITEM SEARCH & FILTERS
  // ==================================================

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");

  // ==================================================
  // NAVIGATION
  // ==================================================

  const [currentCategory, setCurrentCategory] = useState(null);

  // ==================================================
  // MODALS
  // ==================================================

  const [categoryModal, setCategoryModal] = useState(false);
  const [unitModal, setUnitModal] = useState(false);
  const [itemModal, setItemModal] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // ==================================================
  // ITEM WIZARD
  // ==================================================

  const [itemStep, setItemStep] = useState(1);

  // ==================================================
  // CATEGORY FORM
  // ==================================================

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    code: "",
    description: "",
    parentId: "",
  });

  // ==================================================
  // UNIT FORM
  // ==================================================

  const [unitForm, setUnitForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  // ==================================================
  // ITEM FORM
  // ==================================================

  const [itemForm, setItemForm] = useState({
    name: "",
    model: "",
    code: "",
    barcode: "",
    categoryId: "",
    unitId: "",
    purchasePrice: "",
    salePrice: "",
    wholesalePrice: "",
    openingStock: "",
    minimumStock: "",
    maximumStock: "",
    reorderLevel: "",
    description: "",
  });

  // ==================================================
  // API HELPER
  // ==================================================

  const request = async (endpoint, options = {}) => {
    const token = getAccessToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          "Something went wrong.",
      );
    }

    return data;
  };

  // ==================================================
  // LOAD DATA
  // ==================================================

  const loadData = async () => {
    if (!organizationId) {
      setLoading(false);
      setError("Organization ID not found.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        categoryResponse,
        unitResponse,
        itemResponse,
      ] = await Promise.all([
        request(
          `/categories?organizationId=${organizationId}&limit=1000`,
        ),
        request(
          `/units?organizationId=${organizationId}&limit=1000`,
        ),
        request(
          `/items?organizationId=${organizationId}&limit=1000`,
        ),
      ]);

      setCategories(categoryResponse?.data || []);
      setUnits(unitResponse?.data || []);
      setItems(itemResponse?.data || []);
    } catch (err) {
      console.error("Inventory load error:", err);

      setError(
        err.message ||
          "Failed to load inventory data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      loadData();
    }
  }, [organizationId]);

  // ==================================================
  // ID HELPERS
  // ==================================================

  const getCategoryId = (category) =>
    category?._id || category?.id;

  const getUnitId = (unit) =>
    unit?._id || unit?.id;

  const getItemId = (item) =>
    item?._id || item?.id;

  const getParentId = (category) => {
    if (!category?.parentId) {
      return "";
    }

    if (typeof category.parentId === "object") {
      return category.parentId?._id || "";
    }

    return category.parentId;
  };

  // ==================================================
  // CATEGORY DATA
  // ==================================================

  const allRootCategories = useMemo(() => {
    return categories.filter(
      (category) => !getParentId(category),
    );
  }, [categories]);

  const filteredRootCategories = useMemo(() => {
    const query = categorySearch
      .trim()
      .toLowerCase();

    return allRootCategories.filter((category) => {
      const name =
        category.name?.toLowerCase() || "";

      const code =
        category.code?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        name.includes(query) ||
        code.includes(query);

      if (!matchesSearch) {
        return false;
      }

      const isActive =
        category.isActive !== false;

      if (
        categoryStatusFilter === "active" &&
        !isActive
      ) {
        return false;
      }

      if (
        categoryStatusFilter === "inactive" &&
        isActive
      ) {
        return false;
      }

      return true;
    });
  }, [
    allRootCategories,
    categorySearch,
    categoryStatusFilter,
  ]);

  const childCategories = useMemo(() => {
    if (!currentCategory) {
      return [];
    }

    const currentId =
      getCategoryId(currentCategory);

    return categories.filter(
      (category) =>
        category.isActive !== false &&
        getParentId(category) === currentId,
    );
  }, [categories, currentCategory]);

  // ==================================================
  // CURRENT CATEGORY ITEMS
  // ==================================================

  const currentCategoryItems = useMemo(() => {
    if (!currentCategory) {
      return [];
    }

    const currentId =
      getCategoryId(currentCategory);

    return items.filter((item) => {
      const categoryId =
        typeof item.categoryId === "object"
          ? item.categoryId?._id
          : item.categoryId;

      return categoryId === currentId;
    });
  }, [items, currentCategory]);

  // ==================================================
  // FILTER ITEMS
  // ==================================================

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return currentCategoryItems.filter((item) => {
      const model =
        item.model ||
        item.attributes?.model ||
        "";

      const matchesSearch =
        !query ||
        item.name
          ?.toLowerCase()
          .includes(query) ||
        item.code
          ?.toLowerCase()
          .includes(query) ||
        item.barcode
          ?.toLowerCase()
          .includes(query) ||
        model
          .toString()
          .toLowerCase()
          .includes(query);

      if (!matchesSearch) {
        return false;
      }

      // STATUS
      const isActive =
        item.isActive !== false;

      if (
        statusFilter === "active" &&
        !isActive
      ) {
        return false;
      }

      if (
        statusFilter === "inactive" &&
        isActive
      ) {
        return false;
      }

      // STOCK
      const stock =
        Number(item.currentStock) || 0;

      const reorderLevel =
        Number(item.reorderLevel) || 0;

      if (stockFilter === "in-stock") {
        if (stock <= reorderLevel) {
          return false;
        }
      }

      if (stockFilter === "low-stock") {
        if (
          stock <= 0 ||
          stock > reorderLevel
        ) {
          return false;
        }
      }

      if (stockFilter === "out-of-stock") {
        if (stock > 0) {
          return false;
        }
      }

      return true;
    });
  }, [
    currentCategoryItems,
    search,
    stockFilter,
    statusFilter,
  ]);

  // ==================================================
  // RESET CATEGORY FILTERS
  // ==================================================

  const resetCategoryFilters = () => {
    setCategorySearch("");
    setCategoryStatusFilter("active");
  };

  // ==================================================
  // RESET ITEM FILTERS
  // ==================================================

  const resetFilters = () => {
    setSearch("");
    setStockFilter("all");
    setStatusFilter("active");
  };

  // ==================================================
  // CATEGORY
  // ==================================================

  const openAddCategory = (parentId = "") => {
    setEditingCategory(null);

    setCategoryForm({
      name: "",
      code: "",
      description: "",
      parentId,
    });

    setError("");
    setCategoryModal(true);
  };

  const openEditCategory = (category) => {
    setEditingCategory(category);

    setCategoryForm({
      name: category.name || "",
      code: category.code || "",
      description:
        category.description || "",
      parentId: getParentId(category),
    });

    setError("");
    setCategoryModal(true);
  };

  const closeCategoryModal = () => {
    if (saving) {
      return;
    }

    setCategoryModal(false);
    setEditingCategory(null);

    setCategoryForm({
      name: "",
      code: "",
      description: "",
      parentId: "",
    });
  };

  const saveCategory = async (event) => {
    event.preventDefault();

    if (!categoryForm.name.trim()) {
      setError("Category name is required.");
      return;
    }

    if (!categoryForm.code.trim()) {
      setError("Category code is required.");
      return;
    }

    if (!organizationId) {
      setError("Organization ID not found.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: categoryForm.name.trim(),
        code: categoryForm.code
          .trim()
          .toUpperCase(),
        description:
          categoryForm.description.trim(),
        isActive: true,
      };

      if (categoryForm.parentId) {
        payload.parentId =
          categoryForm.parentId;
      }

      if (!editingCategory) {
        payload.organizationId =
          organizationId;
      }

      const response = editingCategory
        ? await request(
            `/categories/${getCategoryId(
              editingCategory,
            )}`,
            {
              method: "PUT",
              body: JSON.stringify(payload),
            },
          )
        : await request("/categories", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      const createdCategory =
        response?.data;

      if (
        !editingCategory &&
        itemModal &&
        createdCategory?._id
      ) {
        setItemForm((prev) => ({
          ...prev,
          categoryId:
            createdCategory._id,
        }));
      }

      closeCategoryModal();
      await loadData();
    } catch (err) {
      console.error(
        "Category save error:",
        err,
      );

      setError(
        err.message ||
          "Failed to save category.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // ACTIVATE CATEGORY
  // ==================================================

  const activateCategory = async (category) => {
    const confirmed = window.confirm(
      `Activate "${category.name}"?\n\nThis category will become active again.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await request(
        `/categories/${getCategoryId(
          category,
        )}`,
        {
          method: "PUT",
          body: JSON.stringify({
            isActive: true,
          }),
        },
      );

      await loadData();
    } catch (err) {
      console.error(
        "Category activate error:",
        err,
      );

      setError(
        err.message ||
          "Failed to activate category.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // DEACTIVATE CATEGORY
  // ==================================================

  const deleteCategory = async (category) => {
    const confirmed = window.confirm(
      `Deactivate "${category.name}"?\n\nThe category will be deactivated and hidden from active inventory.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await request(
        `/categories/${getCategoryId(
          category,
        )}`,
        {
          method: "DELETE",
        },
      );

      if (
        currentCategory &&
        getCategoryId(currentCategory) ===
          getCategoryId(category)
      ) {
        setCurrentCategory(null);
      }

      await loadData();
    } catch (err) {
      console.error(
        "Category deactivate error:",
        err,
      );

      setError(
        err.message ||
          "Failed to deactivate category.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // UNIT
  // ==================================================

  const openAddUnit = () => {
    setEditingUnit(null);

    setUnitForm({
      name: "",
      code: "",
      description: "",
    });

    setError("");
    setUnitModal(true);
  };

  const openEditUnit = (unit) => {
    setEditingUnit(unit);

    setUnitForm({
      name: unit.name || "",
      code: unit.code || "",
      description:
        unit.description || "",
    });

    setError("");
    setUnitModal(true);
  };

  const closeUnitModal = () => {
    if (saving) {
      return;
    }

    setUnitModal(false);
    setEditingUnit(null);

    setUnitForm({
      name: "",
      code: "",
      description: "",
    });
  };

  const saveUnit = async (event) => {
    event.preventDefault();

    if (!unitForm.name.trim()) {
      setError("Unit name is required.");
      return;
    }

    if (!unitForm.code.trim()) {
      setError("Unit code is required.");
      return;
    }

    if (!organizationId) {
      setError("Organization ID not found.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: unitForm.name.trim(),
        code: unitForm.code
          .trim()
          .toUpperCase(),
        description:
          unitForm.description.trim(),
        isActive: true,
      };

      if (!editingUnit) {
        payload.organizationId =
          organizationId;
      }

      const response = editingUnit
        ? await request(
            `/units/${getUnitId(
              editingUnit,
            )}`,
            {
              method: "PUT",
              body: JSON.stringify(payload),
            },
          )
        : await request("/units", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      const createdUnit =
        response?.data;

      if (
        !editingUnit &&
        itemModal &&
        createdUnit?._id
      ) {
        setItemForm((prev) => ({
          ...prev,
          unitId: createdUnit._id,
        }));
      }

      closeUnitModal();
      await loadData();
    } catch (err) {
      console.error(
        "Unit save error:",
        err,
      );

      setError(
        err.message ||
          "Failed to save unit.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteUnit = async (unit) => {
    const confirmed = window.confirm(
      `Deactivate "${unit.name}"?\n\nThis unit will be deactivated.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await request(
        `/units/${getUnitId(unit)}`,
        {
          method: "DELETE",
        },
      );

      await loadData();
    } catch (err) {
      console.error(
        "Unit delete error:",
        err,
      );

      setError(
        err.message ||
          "Failed to deactivate unit.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // ITEM FORM
  // ==================================================

  const resetItemForm = () => {
    setItemForm({
      name: "",
      model: "",
      code: "",
      barcode: "",
      categoryId: currentCategory
        ? getCategoryId(currentCategory)
        : "",
      unitId: "",
      purchasePrice: "",
      salePrice: "",
      wholesalePrice: "",
      openingStock: "",
      minimumStock: "",
      maximumStock: "",
      reorderLevel: "",
      description: "",
    });

    setItemStep(1);
  };

  const openAddItem = () => {
    setEditingItem(null);

    resetItemForm();

    setError("");
    setItemModal(true);
  };

  const openEditItem = (item) => {
    setEditingItem(item);

    const categoryId =
      typeof item.categoryId === "object"
        ? item.categoryId?._id || ""
        : item.categoryId || "";

    const unitId =
      typeof item.unitId === "object"
        ? item.unitId?._id || ""
        : item.unitId || "";

    setItemForm({
      name: item.name || "",
      model:
        item.model ||
        item.attributes?.model ||
        "",
      code: item.code || "",
      barcode: item.barcode || "",
      categoryId,
      unitId,
      purchasePrice:
        item.purchasePrice ?? "",
      salePrice: item.salePrice ?? "",
      wholesalePrice:
        item.wholesalePrice ?? "",
      openingStock:
        item.openingStock ?? "",
      minimumStock:
        item.minimumStock ?? "",
      maximumStock:
        item.maximumStock ?? "",
      reorderLevel:
        item.reorderLevel ?? "",
      description:
        item.description || "",
    });

    setItemStep(1);
    setError("");
    setItemModal(true);
  };

  const closeItemModal = () => {
    if (saving) {
      return;
    }

    setItemModal(false);
    setEditingItem(null);

    resetItemForm();
  };

  // ==================================================
  // ITEM STEP VALIDATION
  // ==================================================

  const validateItemStep = (step) => {
    if (step === 1) {
      if (!itemForm.name.trim()) {
        setError(
          "Item name is required.",
        );
        return false;
      }

      if (!itemForm.code.trim()) {
        setError(
          "Item code is required.",
        );
        return false;
      }
    }

    if (step === 2) {
      if (!itemForm.categoryId) {
        setError(
          "Please select a category.",
        );
        return false;
      }

      if (!itemForm.unitId) {
        setError(
          "Please select a unit.",
        );
        return false;
      }
    }

    setError("");
    return true;
  };

  // ==================================================
  // ITEM STEP NAVIGATION
  // ==================================================

  const goToNextItemStep = () => {
    if (!validateItemStep(itemStep)) {
      return false;
    }

    if (itemStep < 3) {
      setError("");

      setItemStep((prev) => prev + 1);

      return true;
    }

    return true;
  };

  const goToPreviousItemStep = () => {
    if (itemStep > 1) {
      setError("");

      setItemStep((prev) => prev - 1);
    }
  };

  // ==================================================
  // ENTER KEY HANDLING
  // ==================================================

  const handleItemKeyDown = (event) => {
    if (event.key !== "Enter") {
      return;
    }

    const target = event.target;

    if (
      target.tagName === "BUTTON" ||
      target.type === "button" ||
      target.type === "submit"
    ) {
      return;
    }

    const isField =
      target.tagName === "INPUT" ||
      target.tagName === "SELECT" ||
      target.tagName === "TEXTAREA";

    if (!isField || target.disabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;

    const fields = Array.from(
      form.querySelectorAll(
        `[data-item-step="${itemStep}"] [data-item-field]:not(:disabled)`,
      ),
    );

    const currentIndex =
      fields.indexOf(target);

    if (currentIndex === -1) {
      return;
    }

    if (
      currentIndex <
      fields.length - 1
    ) {
      const nextField =
        fields[currentIndex + 1];

      nextField.focus();

      if (
        nextField.tagName === "INPUT" &&
        nextField.type === "number"
      ) {
        nextField.select();
      }

      return;
    }

    if (itemStep < 3) {
      goToNextItemStep();
      return;
    }

    if (itemStep === 3) {
      saveItem(event);
    }
  };

  // ==================================================
  // SAVE ITEM
  // ==================================================

  const saveItem = async (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (itemStep !== 3) {
      return;
    }

    if (!validateItemStep(1)) {
      setItemStep(1);
      return;
    }

    if (!validateItemStep(2)) {
      setItemStep(2);
      return;
    }

    if (!organizationId) {
      setError(
        "Organization ID not found.",
      );
      return;
    }

    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: itemForm.name.trim(),

        code: itemForm.code
          .trim()
          .toUpperCase(),

        categoryId: itemForm.categoryId,

        unitId: itemForm.unitId,

        purchasePrice:
          Number(
            itemForm.purchasePrice,
          ) || 0,

        salePrice:
          Number(itemForm.salePrice) || 0,

        wholesalePrice:
          Number(
            itemForm.wholesalePrice,
          ) || 0,

        minimumStock:
          Number(
            itemForm.minimumStock,
          ) || 0,

        maximumStock:
          Number(
            itemForm.maximumStock,
          ) || 0,

        reorderLevel:
          Number(
            itemForm.reorderLevel,
          ) || 0,

        description:
          itemForm.description.trim(),

        attributes: {
          model:
            itemForm.model.trim(),
        },
      };

      const barcode =
        itemForm.barcode.trim();

      if (barcode) {
        payload.barcode = barcode;
      }

      // UPDATE
      if (editingItem) {
        await request(
          `/items/${getItemId(editingItem)}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
        );
      }

      // CREATE
      else {
        await request("/items", {
          method: "POST",
          body: JSON.stringify({
            organizationId,

            openingStock:
              Number(
                itemForm.openingStock,
              ) || 0,

            ...payload,
          }),
        });
      }

      closeItemModal();

      await loadData();
    } catch (err) {
      console.error(
        "Item save error:",
        err,
      );

      setError(
        err.message ||
          "Failed to save item.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // SAFE ITEM SUBMIT
  // ==================================================

  const handleItemSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (itemStep !== 3) {
      return;
    }

    saveItem(event);
  };

  // ==================================================
  // ACTIVATE ITEM
  // ==================================================

  const activateItem = async (item) => {
    const confirmed = window.confirm(
      `Activate "${item.name}"?\n\nThis item will become active again.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await request(
        `/items/${getItemId(item)}`,
        {
          method: "PUT",
          body: JSON.stringify({
            isActive: true,
          }),
        },
      );

      await loadData();
    } catch (err) {
      console.error(
        "Item activate error:",
        err,
      );

      setError(
        err.message ||
          "Failed to activate item.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // DEACTIVATE ITEM
  // ==================================================

  const deleteItem = async (item) => {
    const confirmed = window.confirm(
      `Deactivate "${item.name}"?\n\nThis item will be deactivated and will no longer appear in active inventory.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await request(
        `/items/${getItemId(item)}`,
        {
          method: "DELETE",
        },
      );

      await loadData();
    } catch (err) {
      console.error(
        "Item deactivate error:",
        err,
      );

      setError(
        err.message ||
          "Failed to deactivate item.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // ITEM TABLE
  // ==================================================

  const itemColumns = [
    {
      key: "name",
      label: "Item / Model",

      render: (item) => {
        const model =
          item.model ||
          item.attributes?.model ||
          "";

        return (
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-[var(--color-text-primary)]">
                {item.name}
              </p>

              {item.isActive === false && (
                <Badge variant="danger">
                  Inactive
                </Badge>
              )}
            </div>

            {model && (
              <p className="text-xs text-[var(--color-text-muted)]">
                Model: {model}
              </p>
            )}
          </div>
        );
      },
    },

    {
      key: "code",
      label: "Code",

      render: (item) => (
        <span className="font-mono text-xs">
          {item.code || "—"}
        </span>
      ),
    },

    {
      key: "unit",
      label: "Unit",

      render: (item) => {
        if (
          typeof item.unitId ===
            "object" &&
          item.unitId
        ) {
          return item.unitId.name;
        }

        const unit = units.find(
          (u) =>
            getUnitId(u) ===
            item.unitId,
        );

        return unit?.name || "—";
      },
    },

    {
      key: "purchasePrice",
      label: "Purchase",

      render: (item) =>
        Number(
          item.purchasePrice || 0,
        ).toLocaleString(),
    },

    {
      key: "salePrice",
      label: "Sale",

      render: (item) =>
        Number(
          item.salePrice || 0,
        ).toLocaleString(),
    },

    {
      key: "currentStock",
      label: "Stock",

      render: (item) => {
        const stock =
          Number(
            item.currentStock,
          ) || 0;

        const reorder =
          Number(
            item.reorderLevel,
          ) || 0;

        if (stock <= 0) {
          return (
            <Badge variant="danger">
              0
            </Badge>
          );
        }

        if (stock <= reorder) {
          return (
            <Badge variant="warning">
              {stock}
            </Badge>
          );
        }

        return (
          <Badge variant="success">
            {stock}
          </Badge>
        );
      },
    },

    {
      key: "actions",
      label: "Actions",

      render: (item) => {
        const isActive =
          item.isActive !== false;

        return (
          <div className="flex items-center gap-1">
            {/* EDIT */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                openEditItem(item)
              }
              aria-label="Edit item"
              title="Edit item"
            >
              <Edit size={16} />
            </Button>

            {/* ACTIVATE */}
            {!isActive && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  activateItem(item)
                }
                aria-label="Activate item"
                title="Activate item"
              >
                <RotateCcw
                  size={16}
                  className="text-[var(--color-success)]"
                />
              </Button>
            )}

            {/* DEACTIVATE */}
            {isActive && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  deleteItem(item)
                }
                aria-label="Deactivate item"
                title="Deactivate item"
              >
                <Trash2
                  size={16}
                  className="text-[var(--color-danger)]"
                />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // ==================================================
  // OPTIONS
  // ==================================================

  const categoryOptions = categories
    .filter(
      (category) =>
        category.isActive !== false,
    )
    .map((category) => ({
      value:
        getCategoryId(category),

      label: getParentId(category)
        ? `${category.name} — Subcategory`
        : category.name,
    }));

  const unitOptions = units
    .filter(
      (unit) =>
        unit.isActive !== false,
    )
    .map((unit) => ({
      value: getUnitId(unit),
      label: `${unit.name} (${unit.code})`,
    }));

  // ==================================================
  // STEP INDICATOR
  // ==================================================

  const StepIndicator = () => {
    const steps = [
      {
        number: 1,
        title: "Item",
        description:
          "Basic information",
      },
      {
        number: 2,
        title: "Classification",
        description:
          "Category & unit",
      },
      {
        number: 3,
        title: "Stock & Pricing",
        description:
          "Prices & stock",
      },
    ];

    return (
      <div className="mb-6">
        <div className="flex items-center">
          {steps.map((step, index) => {
            const active =
              itemStep === step.number;

            const completed =
              itemStep > step.number;

            return (
              <div
                key={step.number}
                className="flex flex-1 items-center"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (
                      step.number <
                      itemStep
                    ) {
                      setError("");
                      setItemStep(
                        step.number,
                      );
                    }
                  }}
                  className={`flex items-center gap-2 ${
                    step.number <=
                    itemStep
                      ? "cursor-pointer"
                      : "cursor-default"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                      completed
                        ? "bg-[var(--color-success)] text-white"
                        : active
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {completed ? (
                      <Check size={15} />
                    ) : (
                      step.number
                    )}
                  </span>

                  <span className="hidden text-left sm:block">
                    <span
                      className={`block text-sm font-semibold ${
                        active ||
                        completed
                          ? "text-[var(--color-text-primary)]"
                          : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {step.title}
                    </span>

                    <span className="block text-[11px] text-[var(--color-text-muted)]">
                      {step.description}
                    </span>
                  </span>
                </button>

                {index <
                  steps.length - 1 && (
                  <div
                    className={`mx-3 h-px flex-1 ${
                      itemStep >
                      step.number
                        ? "bg-[var(--color-primary)]"
                        : "bg-[var(--color-border)]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="space-y-6">
      {/* ==================================================
          HEADER
          ================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Boxes
              size={25}
              className="text-[var(--color-primary)]"
            />

            <h1 className="text-[var(--text-2xl)] font-bold text-[var(--color-text-primary)]">
              Inventory
            </h1>
          </div>

          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            Manage categories,
            subcategories, items,
            models, units and stock.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            icon={
              <FolderPlus size={17} />
            }
            onClick={() =>
              openAddCategory()
            }
          >
            Category
          </Button>

          <Button
            type="button"
            variant="secondary"
            icon={<Ruler size={17} />}
            onClick={openAddUnit}
          >
            Unit
          </Button>

          <Button
            type="button"
            variant="primary"
            icon={<Plus size={18} />}
            onClick={openAddItem}
          >
            New Item
          </Button>
        </div>
      </div>

      {/* ==================================================
          ERROR
          ================================================== */}

      {error && (
        <div className="rounded-[var(--radius-md)] border border-red-200 bg-[var(--color-danger-light)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {/* ==================================================
          ROOT VIEW
          ================================================== */}

      {!currentCategory && (
        <>
          {/* STATS */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Categories
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {
                      allRootCategories.filter(
                        (category) =>
                          category.isActive !==
                          false,
                      ).length
                    }
                  </p>
                </div>

                <Folder
                  size={28}
                  className="text-[var(--color-primary)]"
                />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Subcategories
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {
                      categories.filter(
                        (category) =>
                          category.isActive !==
                            false &&
                          getParentId(
                            category,
                          ),
                      ).length
                    }
                  </p>
                </div>

                <FolderPlus
                  size={28}
                  className="text-[var(--color-primary)]"
                />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Items
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {
                      items.filter(
                        (item) =>
                          item.isActive !==
                          false,
                      ).length
                    }
                  </p>
                </div>

                <Package
                  size={28}
                  className="text-[var(--color-primary)]"
                />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Units
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {
                      units.filter(
                        (unit) =>
                          unit.isActive !==
                          false,
                      ).length
                    }
                  </p>
                </div>

                <Ruler
                  size={28}
                  className="text-[var(--color-primary)]"
                />
              </div>
            </Card>
          </div>

          {/* ==================================================
              INVENTORY CATEGORIES
              ================================================== */}

          <Card
            title="Inventory Categories"
            description="Search, filter and manage your inventory categories."
            headerAction={
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                {/* CATEGORY SEARCH */}

                <div className="w-full sm:w-64">
                  <Input
                    name="category-search"
                    value={categorySearch}
                    onChange={(event) =>
                      setCategorySearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search category..."
                    icon={
                      <Search size={17} />
                    }
                  />
                </div>

                {/* CATEGORY STATUS */}

                <div className="w-full sm:w-36">
                  <Select
                    name="category-status"
                    value={
                      categoryStatusFilter
                    }
                    onChange={(event) =>
                      setCategoryStatusFilter(
                        event.target.value,
                      )
                    }
                    options={[
                      {
                        value: "active",
                        label: "Active",
                      },
                      {
                        value: "inactive",
                        label: "Inactive",
                      },
                      {
                        value: "all",
                        label: "All Status",
                      },
                    ]}
                  />
                </div>

                {/* RESET */}

                {(categorySearch ||
                  categoryStatusFilter !==
                    "active") && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={
                      resetCategoryFilters
                    }
                  >
                    Reset
                  </Button>
                )}
              </div>
            }
          >
            {/* CATEGORY SUMMARY */}

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3">
              <div className="text-xs text-[var(--color-text-muted)]">
                Showing{" "}
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {
                    filteredRootCategories.length
                  }
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {allRootCategories.length}
                </span>{" "}
                categories
              </div>

              <div className="flex items-center gap-2">
                {categoryStatusFilter ===
                  "inactive" && (
                  <Badge variant="danger">
                    Inactive
                  </Badge>
                )}

                {categoryStatusFilter ===
                  "active" && (
                  <Badge variant="success">
                    Active
                  </Badge>
                )}
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-[var(--color-text-muted)]">
                Loading inventory...
              </div>
            ) : filteredRootCategories.length ===
              0 ? (
              <div className="py-12 text-center">
                <Folder
                  size={42}
                  className="mx-auto text-[var(--color-text-muted)]"
                />

                <p className="mt-3 font-medium">
                  {categorySearch ||
                  categoryStatusFilter !==
                    "active"
                    ? "No categories match your filters."
                    : "No categories yet"}
                </p>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {categorySearch ||
                  categoryStatusFilter !==
                    "active"
                    ? "Try changing your search or status filter."
                    : "Create your first inventory category."}
                </p>

                {!categorySearch &&
                  categoryStatusFilter ===
                    "active" && (
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="primary"
                        icon={
                          <Plus size={17} />
                        }
                        onClick={() =>
                          openAddCategory()
                        }
                      >
                        Create Category
                      </Button>
                    </div>
                  )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredRootCategories.map(
                  (category) => {
                    const id =
                      getCategoryId(
                        category,
                      );

                    const children =
                      categories.filter(
                        (child) =>
                          child.isActive !==
                            false &&
                          getParentId(
                            child,
                          ) === id,
                      );

                    const categoryItemCount =
                      items.filter(
                        (item) => {
                          if (
                            item.isActive ===
                            false
                          ) {
                            return false;
                          }

                          const itemCategoryId =
                            typeof item.categoryId ===
                            "object"
                              ? item.categoryId?._id
                              : item.categoryId;

                          return (
                            itemCategoryId ===
                            id
                          );
                        },
                      ).length;

                    const isActive =
                      category.isActive !==
                      false;

                    return (
                      <div
                        key={id}
                        className={`group rounded-xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${
                          isActive
                            ? "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]"
                            : "border-red-200 bg-red-50/40"
                        }`}
                      >
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            if (
                              isActive
                            ) {
                              setCurrentCategory(
                                category,
                              );
                              resetFilters();
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-primary-light)]">
                              <Folder
                                size={22}
                                className="text-[var(--color-primary)]"
                              />
                            </div>

                            <ChevronRight
                              size={20}
                              className="text-[var(--color-text-muted)] transition group-hover:translate-x-1"
                            />
                          </div>

                          <div className="mt-4 flex items-center gap-2">
                            <h3 className="font-semibold text-[var(--color-text-primary)]">
                              {category.name}
                            </h3>

                            {!isActive && (
                              <Badge variant="danger">
                                Inactive
                              </Badge>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            Code:{" "}
                            {category.code}
                          </p>

                          <div className="mt-4 flex gap-3 text-xs text-[var(--color-text-muted)]">
                            <span>
                              {
                                children.length
                              }{" "}
                              subcategories
                            </span>

                            <span>
                              {
                                categoryItemCount
                              }{" "}
                              items
                            </span>
                          </div>
                        </div>

                        {/* CATEGORY ACTIONS */}

                        <div className="mt-4 flex items-center justify-end gap-1 border-t border-[var(--color-border)] pt-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              openEditCategory(
                                category,
                              )
                            }
                            title="Edit category"
                          >
                            <Edit size={15} />
                          </Button>

                          {!isActive && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                activateCategory(
                                  category,
                                )
                              }
                              title="Activate category"
                            >
                              <RotateCcw
                                size={15}
                                className="text-[var(--color-success)]"
                              />
                            </Button>
                          )}

                          {isActive && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                deleteCategory(
                                  category,
                                )
                              }
                              title="Deactivate category"
                            >
                              <Trash2
                                size={15}
                                className="text-[var(--color-danger)]"
                              />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </Card>
        </>
      )}

      {/* ==================================================
          CATEGORY DETAIL
          ================================================== */}

      {currentCategory && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setCurrentCategory(null);
                  resetFilters();
                }}
              >
                <ArrowLeft size={18} />
              </Button>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-xl">
                    {currentCategory.name}
                  </h2>

                  <Badge variant="primary">
                    {currentCategory.code}
                  </Badge>
                </div>

                <p className="text-sm text-[var(--color-text-muted)]">
                  Manage subcategories
                  and items
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                icon={
                  <Plus size={17} />
                }
                onClick={() =>
                  openAddCategory(
                    getCategoryId(
                      currentCategory,
                    ),
                  )
                }
              >
                Add Subcategory
              </Button>

              <Button
                type="button"
                variant="primary"
                icon={
                  <Plus size={17} />
                }
                onClick={openAddItem}
              >
                Add Item
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  openEditCategory(
                    currentCategory,
                  )
                }
                title="Edit category"
              >
                <Edit size={17} />
              </Button>

              {currentCategory.isActive ===
                false ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    activateCategory(
                      currentCategory,
                    )
                  }
                  title="Activate category"
                >
                  <RotateCcw
                    size={17}
                    className="text-[var(--color-success)]"
                  />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    deleteCategory(
                      currentCategory,
                    )
                  }
                  title="Deactivate category"
                >
                  <Trash2
                    size={17}
                    className="text-[var(--color-danger)]"
                  />
                </Button>
              )}
            </div>
          </div>

          {/* SUBCATEGORIES */}

          <Card
            title="Subcategories"
            description={`${childCategories.length} subcategories`}
          >
            {childCategories.length ===
            0 ? (
              <div className="py-8 text-center">
                <FolderPlus
                  size={36}
                  className="mx-auto text-[var(--color-text-muted)]"
                />

                <p className="mt-3 font-medium">
                  No subcategories
                </p>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Add a subcategory
                  for this category.
                </p>

                <div className="mt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    icon={
                      <Plus size={17} />
                    }
                    onClick={() =>
                      openAddCategory(
                        getCategoryId(
                          currentCategory,
                        ),
                      )
                    }
                  >
                    Add Subcategory
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {childCategories.map(
                  (category) => {
                    const categoryId =
                      getCategoryId(
                        category,
                      );

                    const itemCount =
                      items.filter(
                        (item) => {
                          if (
                            item.isActive ===
                            false
                          ) {
                            return false;
                          }

                          const itemCategoryId =
                            typeof item.categoryId ===
                            "object"
                              ? item.categoryId?._id
                              : item.categoryId;

                          return (
                            itemCategoryId ===
                            categoryId
                          );
                        },
                      ).length;

                    return (
                      <div
                        key={categoryId}
                        className="rounded-lg border border-[var(--color-border)] p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div
                            onClick={() => {
                              setCurrentCategory(
                                category,
                              );
                              resetFilters();
                            }}
                            className="flex flex-1 cursor-pointer items-center gap-3"
                          >
                            <Folder
                              size={21}
                              className="text-[var(--color-primary)]"
                            />

                            <div>
                              <p className="font-semibold">
                                {
                                  category.name
                                }
                              </p>

                              <p className="text-xs text-[var(--color-text-muted)]">
                                {
                                  category.code
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                openEditCategory(
                                  category,
                                )
                              }
                            >
                              <Edit size={15} />
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                deleteCategory(
                                  category,
                                )
                              }
                            >
                              <Trash2
                                size={15}
                                className="text-[var(--color-danger)]"
                              />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-[var(--color-text-muted)]">
                          {itemCount} items
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </Card>

          {/* ==================================================
              ITEMS / MODELS
              ================================================== */}

          <Card
            title="Items / Models"
            description={`${filteredItems.length} items in ${currentCategory.name}`}
            headerAction={
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                <div className="w-full sm:w-64">
                  <Input
                    name="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search name, code, model..."
                    icon={
                      <Search size={17} />
                    }
                  />
                </div>

                <div className="w-full sm:w-44">
                  <Select
                    name="stock-filter"
                    value={stockFilter}
                    onChange={(event) =>
                      setStockFilter(
                        event.target.value,
                      )
                    }
                    options={[
                      {
                        value: "all",
                        label: "All Stock",
                      },
                      {
                        value: "in-stock",
                        label: "In Stock",
                      },
                      {
                        value: "low-stock",
                        label: "Low Stock",
                      },
                      {
                        value: "out-of-stock",
                        label: "Out of Stock",
                      },
                    ]}
                  />
                </div>

                <div className="w-full sm:w-36">
                  <Select
                    name="status-filter"
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value,
                      )
                    }
                    options={[
                      {
                        value: "active",
                        label: "Active",
                      },
                      {
                        value: "inactive",
                        label: "Inactive",
                      },
                      {
                        value: "all",
                        label: "All Status",
                      },
                    ]}
                  />
                </div>

                {(search ||
                  stockFilter !==
                    "all" ||
                  statusFilter !==
                    "active") && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={
                      resetFilters
                    }
                  >
                    Reset
                  </Button>
                )}
              </div>
            }
            padding={false}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
              <div className="text-xs text-[var(--color-text-muted)]">
                Showing{" "}
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {filteredItems.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {
                    currentCategoryItems.length
                  }
                </span>{" "}
                items
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {stockFilter ===
                  "low-stock" && (
                  <Badge variant="warning">
                    Low Stock
                  </Badge>
                )}

                {stockFilter ===
                  "out-of-stock" && (
                  <Badge variant="danger">
                    Out of Stock
                  </Badge>
                )}

                {stockFilter ===
                  "in-stock" && (
                  <Badge variant="success">
                    In Stock
                  </Badge>
                )}

                {statusFilter ===
                  "inactive" && (
                  <Badge variant="danger">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>

            <Table
              columns={itemColumns}
              data={filteredItems}
              loading={loading}
              emptyMessage={
                search ||
                stockFilter !==
                  "all" ||
                statusFilter !==
                  "active"
                  ? "No items match the selected filters."
                  : "No items found in this category."
              }
            />
          </Card>
        </>
      )}

      {/* ==================================================
          CATEGORY MODAL
          ================================================== */}

      <Modal
        isOpen={categoryModal}
        onClose={closeCategoryModal}
        title={
          editingCategory
            ? "Edit Category"
            : categoryForm.parentId
              ? "Add Subcategory"
              : "Add Category"
        }
        size="md"
        layer={
          itemModal
            ? "nested"
            : "base"
        }
      >
        <form
          onSubmit={saveCategory}
          className="space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label={
                categoryForm.parentId
                  ? "Subcategory Name"
                  : "Category Name"
              }
              name="name"
              value={
                categoryForm.name
              }
              onChange={(event) =>
                setCategoryForm(
                  (prev) => ({
                    ...prev,
                    name: event.target
                      .value,
                  }),
                )
              }
              placeholder={
                categoryForm.parentId
                  ? "e.g. Ceiling Fans"
                  : "e.g. Fans"
              }
              required
            />

            <Input
              label="Code"
              name="code"
              value={
                categoryForm.code
              }
              onChange={(event) =>
                setCategoryForm(
                  (prev) => ({
                    ...prev,
                    code: event.target
                      .value,
                  }),
                )
              }
              placeholder="e.g. FAN"
              required
            />
          </div>

          {categoryForm.parentId && (
            <div className="rounded-lg bg-[var(--color-background)] px-4 py-3 text-sm">
              <span className="text-[var(--color-text-muted)]">
                Parent Category:
              </span>{" "}
              <span className="font-semibold">
                {
                  categories.find(
                    (category) =>
                      getCategoryId(
                        category,
                      ) ===
                      categoryForm.parentId,
                  )?.name
                }
              </span>
            </div>
          )}

          <Input
            label="Description"
            name="description"
            value={
              categoryForm.description
            }
            onChange={(event) =>
              setCategoryForm(
                (prev) => ({
                  ...prev,
                  description:
                    event.target
                      .value,
                }),
              )
            }
            placeholder="Optional description"
          />

          <div className="flex justify-end gap-3 border-t border-[var(--color-border)] pt-5">
            <Button
              type="button"
              variant="secondary"
              onClick={
                closeCategoryModal
              }
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              loading={saving}
            >
              {editingCategory
                ? "Update Category"
                : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==================================================
          UNIT MODAL
          ================================================== */}

      <Modal
        isOpen={unitModal}
        onClose={closeUnitModal}
        title={
          editingUnit
            ? "Edit Unit"
            : "Add Unit"
        }
        size="md"
        layer={
          itemModal
            ? "nested"
            : "base"
        }
      >
        <form
          onSubmit={saveUnit}
          className="space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Unit Name"
              value={unitForm.name}
              onChange={(event) =>
                setUnitForm(
                  (prev) => ({
                    ...prev,
                    name: event.target
                      .value,
                  }),
                )
              }
              placeholder="e.g. Piece"
              required
            />

            <Input
              label="Unit Code"
              value={unitForm.code}
              onChange={(event) =>
                setUnitForm(
                  (prev) => ({
                    ...prev,
                    code: event.target
                      .value,
                  }),
                )
              }
              placeholder="e.g. PCS"
              required
            />
          </div>

          <Input
            label="Description"
            value={
              unitForm.description
            }
            onChange={(event) =>
              setUnitForm(
                (prev) => ({
                  ...prev,
                  description:
                    event.target.value,
                }),
              )
            }
            placeholder="Optional description"
          />

          <div className="flex justify-end gap-3 border-t border-[var(--color-border)] pt-5">
            <Button
              type="button"
              variant="secondary"
              onClick={closeUnitModal}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              loading={saving}
            >
              {editingUnit
                ? "Update Unit"
                : "Create Unit"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==================================================
          ITEM MODAL
          ================================================== */}

      <Modal
        isOpen={itemModal}
        onClose={closeItemModal}
        title={
          editingItem
            ? "Edit Item"
            : "Create New Item"
        }
        size="lg"
        layer="base"
      >
        <form
          onSubmit={handleItemSubmit}
          onKeyDown={handleItemKeyDown}
          className="space-y-6"
        >
          <StepIndicator />

          {/* STEP 1 */}

          {itemStep === 1 && (
            <div
              data-item-step="1"
              className="space-y-5"
            >
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                  Basic Information
                </h3>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Enter the basic
                  information for
                  this inventory
                  item.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  data-item-field
                  label="Item Name"
                  name="item-name"
                  value={itemForm.name}
                  onChange={(event) =>
                    setItemForm(
                      (prev) => ({
                        ...prev,
                        name: event
                          .target
                          .value,
                      }),
                    )
                  }
                  placeholder="e.g. Royal Ceiling Fan"
                  required
                />

                <Input
                  data-item-field
                  label="Model"
                  name="item-model"
                  value={
                    itemForm.model
                  }
                  onChange={(event) =>
                    setItemForm(
                      (prev) => ({
                        ...prev,
                        model: event
                          .target
                          .value,
                      }),
                    )
                  }
                  placeholder="e.g. Royal 56"
                />

                <Input
                  data-item-field
                  label="Item Code"
                  name="item-code"
                  value={
                    itemForm.code
                  }
                  onChange={(event) =>
                    setItemForm(
                      (prev) => ({
                        ...prev,
                        code: event
                          .target
                          .value,
                      }),
                    )
                  }
                  placeholder="e.g. FAN-CF-001"
                  required
                />

                <Input
                  data-item-field
                  label="Barcode"
                  name="item-barcode"
                  value={
                    itemForm.barcode
                  }
                  onChange={(event) =>
                    setItemForm(
                      (prev) => ({
                        ...prev,
                        barcode:
                          event.target
                            .value,
                      }),
                    )
                  }
                  placeholder="Optional barcode"
                />
              </div>
            </div>
          )}

          {/* STEP 2 */}

          {itemStep === 2 && (
            <div
              data-item-step="2"
              className="space-y-5"
            >
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                  Classification
                </h3>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Select the category
                  and measurement
                  unit.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  data-item-field
                  label="Category"
                  name="item-category"
                  value={
                    itemForm.categoryId
                  }
                  onChange={(event) =>
                    setItemForm(
                      (prev) => ({
                        ...prev,
                        categoryId:
                          event.target
                            .value,
                      }),
                    )
                  }
                  options={
                    categoryOptions
                  }
                  placeholder="Select category"
                  required
                />

                <Select
                  data-item-field
                  label="Unit"
                  name="item-unit"
                  value={
                    itemForm.unitId
                  }
                  onChange={(event) =>
                    setItemForm(
                      (prev) => ({
                        ...prev,
                        unitId:
                          event.target
                            .value,
                      }),
                    )
                  }
                  options={unitOptions}
                  placeholder="Select unit"
                  required
                />
              </div>

              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                <p className="text-sm font-medium">
                  Need a new category
                  or unit?
                </p>

                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Create it without
                  leaving this item
                  form.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={
                      <Plus size={15} />
                    }
                    onClick={() =>
                      openAddCategory()
                    }
                  >
                    Add Category
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={
                      <Plus size={15} />
                    }
                    onClick={openAddUnit}
                  >
                    Add Unit
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}

          {itemStep === 3 && (
            <div
              data-item-step="3"
              className="space-y-5"
            >
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                  Pricing & Stock
                </h3>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Set prices and
                  inventory control
                  levels.
                </p>
              </div>

              {/* PRICING */}

              <div>
                <p className="mb-3 text-sm font-semibold">
                  Pricing
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    data-item-field
                    label="Purchase Price"
                    name="purchase-price"
                    type="number"
                    min="0"
                    value={
                      itemForm.purchasePrice
                    }
                    onChange={(event) =>
                      setItemForm(
                        (prev) => ({
                          ...prev,
                          purchasePrice:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="0"
                  />

                  <Input
                    data-item-field
                    label="Sale Price"
                    name="sale-price"
                    type="number"
                    min="0"
                    value={
                      itemForm.salePrice
                    }
                    onChange={(event) =>
                      setItemForm(
                        (prev) => ({
                          ...prev,
                          salePrice:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="0"
                  />

                  <Input
                    data-item-field
                    label="Wholesale Price"
                    name="wholesale-price"
                    type="number"
                    min="0"
                    value={
                      itemForm.wholesalePrice
                    }
                    onChange={(event) =>
                      setItemForm(
                        (prev) => ({
                          ...prev,
                          wholesalePrice:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              {/* STOCK */}

              <div>
                <p className="mb-3 text-sm font-semibold">
                  Stock Settings
                </p>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Input
                    data-item-field
                    label="Opening Stock"
                    name="opening-stock"
                    type="number"
                    min="0"
                    disabled={
                      !!editingItem
                    }
                    value={
                      itemForm.openingStock
                    }
                    onChange={(event) =>
                      setItemForm(
                        (prev) => ({
                          ...prev,
                          openingStock:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="0"
                  />

                  <Input
                    data-item-field
                    label="Minimum Stock"
                    name="minimum-stock"
                    type="number"
                    min="0"
                    value={
                      itemForm.minimumStock
                    }
                    onChange={(event) =>
                      setItemForm(
                        (prev) => ({
                          ...prev,
                          minimumStock:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="0"
                  />

                  <Input
                    data-item-field
                    label="Maximum Stock"
                    name="maximum-stock"
                    type="number"
                    min="0"
                    value={
                      itemForm.maximumStock
                    }
                    onChange={(event) =>
                      setItemForm(
                        (prev) => ({
                          ...prev,
                          maximumStock:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="0"
                  />

                  <Input
                    data-item-field
                    label="Reorder Level"
                    name="reorder-level"
                    type="number"
                    min="0"
                    value={
                      itemForm.reorderLevel
                    }
                    onChange={(event) =>
                      setItemForm(
                        (prev) => ({
                          ...prev,
                          reorderLevel:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}

              <Input
                data-item-field
                label="Description"
                name="item-description"
                value={
                  itemForm.description
                }
                onChange={(event) =>
                  setItemForm(
                    (prev) => ({
                      ...prev,
                      description:
                        event.target
                          .value,
                    }),
                  )
                }
                placeholder="Optional item description"
              />

              {editingItem && (
                <div className="rounded-lg bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
                  Current stock is
                  controlled by
                  purchases, sales,
                  returns and stock
                  adjustments. Opening
                  stock cannot be
                  changed from the
                  edit form.
                </div>
              )}
            </div>
          )}

          {/* NAVIGATION */}

          <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-5">
            <div>
              {itemStep > 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={
                    goToPreviousItemStep
                  }
                  disabled={saving}
                >
                  Back
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={
                    closeItemModal
                  }
                  disabled={saving}
                >
                  Cancel
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {itemStep < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    goToNextItemStep();
                  }}
                  disabled={saving}
                >
                  Next
                  <ChevronRight
                    size={17}
                  />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                >
                  {editingItem
                    ? "Update Item"
                    : "Create Item"}
                </Button>
              )}
            </div>
          </div>

          <p className="text-center text-[11px] text-[var(--color-text-muted)]">
            Press{" "}
            <strong>Enter</strong> to
            move to the next field.
            Enter on the last field
            moves to the next step.
          </p>
        </form>
      </Modal>
    </div>
  );
}

export default Items;