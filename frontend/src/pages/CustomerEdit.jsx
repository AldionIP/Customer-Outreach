import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { OUTREACH_STATUSES } from "../constants/outreachStatus";
import { getCustomerById, updateCustomer } from "../services/customerApi";

function CustomerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    status: "follow",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const data = await getCustomerById(id);

        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          status: data.status || "follow",
        });
      } catch (fetchError) {
        console.error("Failed to fetch customer:", fetchError);
        setError("Failed to load customer.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      await updateCustomer(id, formData);
      navigate(`/customers/${id}`);
    } catch (submitError) {
      console.error("Failed to update customer:", submitError);
      setError("Failed to update customer.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="panel p-8 text-slate-200">
          <p>Loading customer profile...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="page-container">
        <div className="panel p-8 text-slate-200">
          <p>{error}</p>
          <button type="button" className="secondary-button mt-4" onClick={() => navigate("/customers")}>
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mx-auto max-w-3xl panel p-6 sm:p-8">
        <div className="mb-6">
          <span className="hud-label">
            <span className="status-dot" />
            Edit Customer
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-slate-50">Update Mission Data</h1>
          <p className="mt-2 text-sm text-slate-300">Adjust customer profile and outreach status.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Enter customer name" required />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="text" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter email address" />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Enter customer address" rows="4" />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange}>
              {OUTREACH_STATUSES.map((outreachStatus) => (
                <option key={outreachStatus.value} value={outreachStatus.value}>
                  {outreachStatus.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" className="secondary-button" onClick={() => navigate(`/customers/${id}`)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Updating..." : "Update Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerEdit;