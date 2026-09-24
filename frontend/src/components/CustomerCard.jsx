import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getOutreachStatusLabel } from "../constants/outreachStatus";
import { deleteCustomer } from "../services/customerApi";

function CustomerCard({ customer, onDelete }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete ${customer.name}?`);

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      await deleteCustomer(customer.id);
      onDelete(customer.id);
    } catch (error) {
      console.error("Failed to delete customer:", error);
      window.alert("Failed to delete customer.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="group rounded-3xl border border-slate-700/60 bg-slate-900/70 p-5 shadow-[0_0_0_1px_rgba(34,211,238,0.04),0_20px_40px_rgba(15,23,42,0.65)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_0_22px_rgba(34,211,238,0.1)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Customer ID {customer.id}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-50">{customer.name}</h3>
        </div>

        <span className="status-badge border-cyan-500/30 bg-cyan-500/10 text-cyan-200">
          {getOutreachStatusLabel(customer.status)}
        </span>
      </div>

      <div className="mt-5 space-y-3 text-sm text-slate-300">
        <p className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <span className="text-slate-400">Phone</span>
          <span className="text-right text-slate-100">{customer.phone}</span>
        </p>
        <p className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <span className="text-slate-400">Email</span>
          <span className="text-right text-slate-100">{customer.email || "-"}</span>
        </p>
        <p className="flex items-center justify-between gap-3">
          <span className="text-slate-400">Address</span>
          <span className="text-right text-slate-100">{customer.address || "-"}</span>
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className="secondary-button" onClick={() => navigate(`/customers/${customer.id}`)} disabled={deleting}>
          View
        </button>
        <button type="button" className="secondary-button" onClick={() => navigate(`/customers/${customer.id}/edit`)} disabled={deleting}>
          Edit
        </button>
        <button type="button" className="danger-button" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

export default CustomerCard;