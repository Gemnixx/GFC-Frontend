import { useEffect, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";

import {
  createUnit,
  getUnits,
  updateUnit,
  deleteUnit,
} from "../../api/units";

import { useAuth } from "../../context/AuthContext.jsx";

function Units() {
  const { user } = useAuth();

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    isActive: true,
  });

  const loadUnits = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getUnits({
        page: 1,
        limit: 100,
      });

      setUnits(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load units."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      isActive: true,
    });
  };

  const handleAdd = () => {
    setEditingUnit(null);
    resetForm();
    setError("");
    setIsModalOpen(true);
  };

  const handleEdit = (unit) => {
    setEditingUnit(unit);

    setFormData({
      name: unit.name || "",
      code: unit.code || "",
      description: unit.description || "",
      isActive: unit.isActive !== false,
    });

    setError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingUnit(null);
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
      return "Unit name is required.";
    }

    if (name.length > 50) {
      return "Unit name cannot exceed 50 characters.";
    }

    if (!code) {
      return "Unit code is required.";
    }

    if (code.length > 10) {
      return "Unit code cannot exceed 10 characters.";
    }

    if (description.length > 500) {
      return "Description cannot exceed 500 characters.";
    }

    if (!editingUnit && !user?.organizationId) {
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

      if (!editingUnit) {
        payload.organizationId = user.organizationId;
      }

      if (editingUnit) {
        await updateUnit(
          editingUnit._id || editingUnit.id,
          payload
        );
      } else {
        await createUnit(payload);
      }

      handleCloseModal();
      await loadUnits();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save unit."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (unit) => {
    const confirmed = window.confirm(
      `Deactivate "${unit.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteUnit(unit._id || unit.id);

      await loadUnits();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to deactivate unit."
      );
    }
  };

  const filteredUnits = units.filter((unit) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      unit.name?.toLowerCase().includes(query) ||
      unit.code?.toLowerCase().includes(query) ||
      unit.description?.toLowerCase().includes(query)
    );
  });

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
      key: "description",
      label: "Description",
      render: (unit) => unit.description || "—",
    },
    {
      key: "status",
      label: "Status",
      render: (unit) =>
        unit.isActive !== false ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="danger">Inactive</Badge>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (unit) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              handleEdit(unit);
            }}
            aria-label="Edit unit"
          >
            <Edit size={16} />
          </Button>

          {unit.isActive !== false && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                handleDelete(unit);
              }}
              aria-label="Deactivate unit"
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
            Units
          </h1>

          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            Manage product units and measurement codes.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={handleAdd}
        >
          Add Unit
        </Button>
      </div>

      {error && (
        <div className="rounded-[var(--radius-md)] border border-red-200 bg-[var(--color-danger-light)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <Card
        title="Unit List"
        description={`${filteredUnits.length} units`}
        headerAction={
          <div className="w-64">
            <Input
              name="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search units..."
              icon={<Search size={17} />}
            />
          </div>
        }
        padding={false}
      >
        <Table
          columns={columns}
          data={filteredUnits}
          loading={loading}
          emptyMessage="No units found."
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUnit ? "Edit Unit" : "Add Unit"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Unit Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Piece"
              required
              maxLength={50}
            />

            <Input
              label="Unit Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g. PCS"
              required
              maxLength={10}
            />
          </div>

          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter unit description"
            maxLength={500}
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
              Active Unit
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
              {editingUnit ? "Update Unit" : "Create Unit"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Units;