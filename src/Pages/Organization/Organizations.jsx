import { useEffect, useState } from "react";
import { Building2, Edit3, Plus, X } from "lucide-react";

import {
  createOrganization,
  getOrganizations,
  updateOrganization,
  deleteOrganization,
} from "../../api/organizations";

import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";

const initialForm = {
  name: "",
  code: "",
  type: "",
  taxId: "",
  address: {
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  },
  contact: {
    phone: "",
    email: "",
    website: "",
  },
};

const organizationTypeOptions = [
  { value: "company", label: "Company" },
  { value: "group", label: "Group" },
];

export default function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOrganizations({
        page: 1,
        limit: 100,
      });

      setOrganizations(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load organizations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];

      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));

      return;
    }

    if (name.startsWith("contact.")) {
      const field = name.split(".")[1];

      setForm((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          [field]: value,
        },
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await updateOrganization(editingId, form);
      } else {
        await createOrganization(form);
      }

      resetForm();
      await fetchOrganizations();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save organization."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (organization) => {
    setEditingId(organization._id || organization.id);

    setForm({
      name: organization.name || "",
      code: organization.code || "",
      type: organization.type || "",
      taxId: organization.taxId || "",
      address: {
        street: organization.address?.street || "",
        city: organization.address?.city || "",
        state: organization.address?.state || "",
        country: organization.address?.country || "",
        postalCode: organization.address?.postalCode || "",
      },
      contact: {
        phone: organization.contact?.phone || "",
        email: organization.contact?.email || "",
        website: organization.contact?.website || "",
      },
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this organization?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteOrganization(id);
      await fetchOrganizations();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to deactivate organization."
      );
    }
  };

  const getOrganizationStatus = (organization) => {
    return organization.status === "inactive"
      ? "inactive"
      : "active";
  };

  const columns = [
    {
      header: "Organization",
      accessor: "name",
      render: (organization) => {
        const inactive =
          getOrganizationStatus(organization) === "inactive";

        return (
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${
                inactive
                  ? "bg-[var(--color-warning-light)] text-[var(--color-warning)]"
                  : "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
              }`}
            >
              <Building2 size={18} />
            </div>

            <div className="min-w-0">
              <p
                className={`truncate font-medium ${
                  inactive
                    ? "text-[var(--color-text-muted)]"
                    : "text-[var(--color-text-primary)]"
                }`}
              >
                {organization.name}
              </p>

              {organization.contact?.email && (
                <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
                  {organization.contact.email}
                </p>
              )}
            </div>
          </div>
        );
      },
    },

    {
      header: "Code",
      accessor: "code",
      render: (organization) => (
        <span className="rounded-[var(--radius-sm)] bg-[var(--color-background)] px-2 py-1 font-mono text-xs text-[var(--color-text-secondary)]">
          {organization.code || "-"}
        </span>
      ),
    },

    {
      header: "Type",
      accessor: "type",
      render: (organization) => (
        <span className="capitalize text-[var(--color-text-secondary)]">
          {organization.type || "-"}
        </span>
      ),
    },

    {
      header: "Tax ID",
      accessor: "taxId",
      render: (organization) => (
        <span className="text-[var(--color-text-secondary)]">
          {organization.taxId || "-"}
        </span>
      ),
    },

    {
      header: "Status",
      accessor: "status",
      render: (organization) => {
        const inactive =
          getOrganizationStatus(organization) === "inactive";

        return (
          <Badge variant={inactive ? "warning" : "success"}>
            {inactive ? "Inactive" : "Active"}
          </Badge>
        );
      },
    },

    {
      header: "Actions",
      accessor: "actions",
      align: "right",
      render: (organization) => {
        const id = organization._id || organization.id;

        const inactive =
          getOrganizationStatus(organization) === "inactive";

        return (
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleEdit(organization)}
            >
              <Edit3 size={14} />
              Edit
            </Button>

            {!inactive && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => handleDelete(id)}
              >
                Deactivate
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-text-primary)]">
          Organizations
        </h1>

        {!editingId && (
          <Button
            type="button"
            variant="primary"
            onClick={() =>
              document
                .getElementById("organization-form")
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
            }
          >
            <Plus size={17} />
            Add Organization
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--color-danger)]/20 bg-[var(--color-danger-light)] px-4 py-2.5 text-sm text-[var(--color-danger)]">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 hover:opacity-70"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Organization Form */}
      <div id="organization-form">
        <Card>
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3.5">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
              {editingId ? "Edit Organization" : "Add Organization"}
            </h2>

            {editingId && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={resetForm}
              >
                <X size={14} />
                Cancel
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5 p-5">
              {/* Basic Information */}
              <section>
                <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <Input
                    label="Organization Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="GFC Outlet"
                    required
                  />

                  <Input
                    label="Organization Code"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="GFC"
                    required
                  />

                  <Select
                    label="Organization Type"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    options={organizationTypeOptions}
                    placeholder="Select type"
                    required
                  />

                  <Input
                    label="Tax ID"
                    name="taxId"
                    value={form.taxId}
                    onChange={handleChange}
                    placeholder="1234567-8"
                  />
                </div>
              </section>

              {/* Address */}
              <section className="border-t border-[var(--color-border)] pt-5">
                <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
                  Address
                </h3>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
                  <div className="lg:col-span-2">
                    <Input
                      label="Street"
                      name="address.street"
                      value={form.address.street}
                      onChange={handleChange}
                      placeholder="45-B Bosan Road"
                    />
                  </div>

                  <Input
                    label="City"
                    name="address.city"
                    value={form.address.city}
                    onChange={handleChange}
                    placeholder="Multan"
                  />

                  <Input
                    label="State"
                    name="address.state"
                    value={form.address.state}
                    onChange={handleChange}
                    placeholder="Punjab"
                  />

                  <Input
                    label="Country"
                    name="address.country"
                    value={form.address.country}
                    onChange={handleChange}
                    placeholder="Pakistan"
                  />

                  <Input
                    label="Postal Code"
                    name="address.postalCode"
                    value={form.address.postalCode}
                    onChange={handleChange}
                    placeholder="60000"
                  />
                </div>
              </section>

              {/* Contact */}
              <section className="border-t border-[var(--color-border)] pt-5">
                <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Input
                    label="Phone"
                    name="contact.phone"
                    value={form.contact.phone}
                    onChange={handleChange}
                    placeholder="+92 300 1234567"
                  />

                  <Input
                    label="Email"
                    name="contact.email"
                    type="email"
                    value={form.contact.email}
                    onChange={handleChange}
                    placeholder="info@gfc.com"
                  />

                  <Input
                    label="Website"
                    name="contact.website"
                    type="url"
                    value={form.contact.website}
                    onChange={handleChange}
                    placeholder="https://gfc.com"
                  />
                </div>
              </section>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 border-t border-[var(--color-border)] bg-[var(--color-background)] px-5 py-3">
              {editingId && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </Button>
              )}

              <Button
                type="submit"
                variant="primary"
                loading={saving}
              >
                {editingId
                  ? "Update Organization"
                  : "Create Organization"}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Organization List */}
      <Card>
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-[var(--text-lg)] font-semibold text-[var(--color-text-primary)]">
            Organization List
          </h2>

          <span className="rounded-full bg-[var(--color-background)] px-3 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
            {organizations.length}{" "}
            {organizations.length === 1
              ? "Organization"
              : "Organizations"}
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-40 items-center justify-center">
            <Loader />
          </div>
        ) : organizations.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              No organizations found
            </p>

            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Create your first organization to get started.
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={organizations}
            rowClassName={(organization) =>
              getOrganizationStatus(organization) === "inactive"
                ? "bg-[var(--color-warning-light)]/40 opacity-75"
                : ""
            }
          />
        )}
      </Card>
    </div>
  );
}