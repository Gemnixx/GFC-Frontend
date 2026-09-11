import { useEffect, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Modal from "../../components/common/Modal";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";

import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../../api/categories";

import { useAuth } from "../../context/AuthContext.jsx";

function Categories() {
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    parentId: "",
    isActive: true,
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCategories({
        page: 1,
        limit: 100,
      });

      setCategories(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      parentId: "",
      isActive: true,
    });
  };

  const handleAdd = () => {
    setEditingCategory(null);
    resetForm();
    setError("");
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);

    setFormData({
      name: category.name || "",
      code: category.code || "",
      description: category.description || "",
      parentId:
        typeof category.parentId === "object"
          ? category.parentId?._id || ""
          : category.parentId || "",
      isActive: category.isActive !== false,
    });

    setError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingCategory(null);
    resetForm();
    setError("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const name = formData.name.trim();
    const code = formData.code.trim();
    const description = formData.description.trim();

    if (!name) {
      return "Category name is required.";
    }

    if (name.length < 2) {
      return "Category name must be at least 2 characters.";
    }

    if (name.length > 100) {
      return "Category name cannot exceed 100 characters.";
    }

    if (!code) {
      return "Category code is required.";
    }

    if (code.length < 1) {
      return "Category code is required.";
    }

    if (code.length > 20) {
      return "Category code cannot exceed 20 characters.";
    }

    if (!editingCategory && !user?.organizationId) {
      return "Organization is not available for the current user.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        isActive: formData.isActive,
      };

      if (formData.parentId) {
        payload.parentId = formData.parentId;
      } else if (editingCategory) {
        payload.parentId = null;
      }

      if (!editingCategory) {
        payload.organizationId = user.organizationId;
      }

      if (editingCategory) {
        await updateCategory(
          editingCategory._id || editingCategory.id,
          payload
        );
      } else {
        await createCategory(payload);
      }

      handleCloseModal();
      await loadCategories();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Deactivate "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteCategory(
        category._id || category.id
      );

      await loadCategories();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to deactivate category."
      );
    }
  };

  const filteredCategories = categories.filter((category) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      category.name?.toLowerCase().includes(query) ||
      category.code?.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query)
    );
  });

  const parentOptions = categories
    .filter((category) => {
      const categoryId = category._id || category.id;
      const editingId =
        editingCategory?._id || editingCategory?.id;

      return (
        categoryId !== editingId &&
        category.isActive !== false
      );
    })
    .map((category) => ({
      value: category._id || category.id,
      label: `${category.name} (${category.code})`,
    }));

  const columns = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "code",
      label: "Code",
    },
    {
      key: "parent",
      label: "Parent Category",
      render: (category) => {
        if (!category.parentId) {
          return "—";
        }

        if (typeof category.parentId === "object") {
          return (
            <div>
              <p className="font-medium text-[var(--color-text-primary)]">
                {category.parentId.name}
              </p>

              <p className="text-xs text-[var(--color-text-muted)]">
                {category.parentId.code}
              </p>
            </div>
          );
        }

        return "—";
      },
    },
    {
      key: "description",
      label: "Description",
      render: (category) => (
        <span>{category.description || "—"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (category) =>
        category.isActive !== false ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="danger">Inactive</Badge>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (category) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              handleEdit(category);
            }}
            aria-label="Edit category"
          >
            <Edit size={16} />
          </Button>

          {category.isActive !== false && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                handleDelete(category);
              }}
              aria-label="Deactivate category"
            >
              <Trash2
                size={16}
                className="text-[var(--color-danger)]"
              />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[var(--text-2xl)] font-bold text-[var(--color-text-primary)]">
            Categories
          </h1>

          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            Manage product categories and category hierarchy.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={handleAdd}
        >
          Add Category
        </Button>
      </div>

      {error && (
        <div className="rounded-[var(--radius-md)] border border-red-200 bg-[var(--color-danger-light)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <Card
        title="Category List"
        description={`${filteredCategories.length} categories`}
        headerAction={
          <div className="w-64">
            <Input
              name="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search categories..."
              icon={<Search size={17} />}
            />
          </div>
        }
        padding={false}
      >
        <Table
          columns={columns}
          data={filteredCategories}
          loading={loading}
          emptyMessage="No categories found."
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          editingCategory
            ? "Edit Category"
            : "Add Category"
        }
        size="md"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Category Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter category name"
              required
              maxLength={100}
            />

            <Input
              label="Category Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g. FAN"
              required
              maxLength={20}
            />
          </div>

          <Select
            label="Parent Category"
            name="parentId"
            value={formData.parentId}
            onChange={handleChange}
            options={parentOptions}
            placeholder="No Parent Category"
          />

          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter category description"
          />

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
            />

            <span className="text-sm font-medium text-[var(--color-text-secondary)]">
              Active Category
            </span>
          </label>

          <div className="flex justify-end gap-3 border-t border-[var(--color-border)] pt-5">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
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
    </div>
  );
}

export default Categories;