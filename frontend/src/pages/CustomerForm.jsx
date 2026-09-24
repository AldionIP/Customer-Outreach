import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createCustomer } from "../services/customerApi";

function CustomerForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await createCustomer(formData);
      navigate("/customers");
    } catch (submitError) {
      console.error("Failed to create customer:", submitError);
      setError("Failed to create customer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="mx-auto max-w-3xl panel p-6 sm:p-8">
        <div className="mb-6">
          <span className="hud-label">
            <span className="status-dot" />
            Add New Customer
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-slate-50">Create Mission Profile</h1>
          <p className="mt-2 text-sm text-slate-300">Register a new contact into the outreach pipeline.</p>
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

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" className="secondary-button" onClick={() => navigate("/customers")} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Saving..." : "Save Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerForm;