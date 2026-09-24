import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { OUTREACH_STATUSES, getOutreachStatusLabel } from "../constants/outreachStatus";
import { getCustomerById, updateCustomer } from "../services/customerApi";
import {
  createFollowUp,
  deleteFollowUp,
  getFollowUpsByCustomerId,
  updateFollowUp,
} from "../services/followUpApi";

function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [followUps, setFollowUps] = useState([]);

  const [note, setNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [followUpLoading, setFollowUpLoading] = useState(true);
  const [error, setError] = useState("");
  const [followUpError, setFollowUpError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customerData = await getCustomerById(id);
        setCustomer(customerData);

        const followUpData = await getFollowUpsByCustomerId(id);
        setFollowUps(followUpData);
      } catch (fetchError) {
        console.error("Failed to fetch customer:", fetchError);
        setError("Failed to load customer.");
      } finally {
        setLoading(false);
        setFollowUpLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmitFollowUp = async (event) => {
    event.preventDefault();

    if (!note.trim()) {
      setFollowUpError("Note is required.");
      return;
    }

    try {
      setFollowUpError("");

      if (editingId) {
        const updatedFollowUp = await updateFollowUp(editingId, { note, followUpDate });
        setFollowUps((currentFollowUps) =>
          currentFollowUps.map((followUp) => (followUp.id === editingId ? updatedFollowUp : followUp))
        );
        setEditingId(null);
      } else {
        const newFollowUp = await createFollowUp({ customerId: id, note, followUpDate });
        setFollowUps((currentFollowUps) => [newFollowUp, ...currentFollowUps]);

        if (!customer || customer.status === "follow") {
          const nextStatus = followUpDate ? "survey" : "contacted";
          const updatedCustomer = await updateCustomer(id, { ...customer, status: nextStatus });
          setCustomer(updatedCustomer);
        }
      }

      setNote("");
      setFollowUpDate("");
    } catch (submitError) {
      console.error("Failed to save follow-up:", submitError);
      setFollowUpError("Failed to save follow-up.");
    }
  };

  const handleStatusChange = async (nextStatus) => {
    if (!customer) {
      return;
    }

    try {
      const updatedCustomer = await updateCustomer(id, { ...customer, status: nextStatus });
      setCustomer(updatedCustomer);
      setError("");
    } catch (statusError) {
      console.error("Failed to update status:", statusError);
      setError("Failed to update customer status.");
    }
  };

  const handleEditFollowUp = (followUp) => {
    setEditingId(followUp.id);
    setNote(followUp.note);
    setFollowUpDate(followUp.follow_up_date ? followUp.follow_up_date.split("T")[0] : "");
  };

  const handleDeleteFollowUp = async (followUpId) => {
    const confirmed = window.confirm("Are you sure you want to delete this follow-up?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteFollowUp(followUpId);
      setFollowUps((currentFollowUps) => currentFollowUps.filter((followUp) => followUp.id !== followUpId));
    } catch (deleteError) {
      console.error("Failed to delete follow-up:", deleteError);
      setFollowUpError("Failed to delete follow-up.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNote("");
    setFollowUpDate("");
    setFollowUpError("");
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="panel p-8 text-slate-200">Loading customer profile...</div>
      </div>
    );
  }

  if (error) {
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

  if (!customer) {
    return (
      <div className="page-container">
        <div className="panel p-8 text-slate-200">
          <p>Customer not found.</p>
          <button type="button" className="secondary-button mt-4" onClick={() => navigate("/customers")}>
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container content-stack">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="hud-label">
            <span className="status-dot" />
            Customer Profile
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-slate-50">{customer.name}</h1>
        </div>
        <button type="button" className="secondary-button" onClick={() => navigate("/customers")}>
          Back to Customers
        </button>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <div className="panel p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-300">Mission Data</p>
            <span className="status-badge border-cyan-500/30 bg-cyan-500/10 text-cyan-200">
              {getOutreachStatusLabel(customer.status)}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Phone</p>
              <p className="mt-2 text-base text-slate-100">{customer.phone}</p>
            </div>

            <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Email</p>
              <p className="mt-2 text-base text-slate-100">{customer.email || "-"}</p>
            </div>

            <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Address</p>
              <p className="mt-2 text-base text-slate-100">{customer.address || "-"}</p>
            </div>

            <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Status</p>
              <div className="mt-2">
                <select
                  value={customer.status || "follow"}
                  onChange={(event) => handleStatusChange(event.target.value)}
                  className="w-full"
                >
                  {OUTREACH_STATUSES.map((outreachStatus) => (
                    <option key={outreachStatus.value} value={outreachStatus.value}>
                      {outreachStatus.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" className="primary-button" onClick={() => navigate(`/customers/${id}/edit`)}>Edit</button>
            <button type="button" className="secondary-button" onClick={() => navigate("/outreach/whatsapp")}>WhatsApp</button>
          </div>
        </div>

        <div className="panel p-6">
          <div className="mb-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-300">Follow-up Console</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-50">Add Follow-up Note</h2>
          </div>

          <form onSubmit={handleSubmitFollowUp} className="space-y-4">
            <div className="form-group">
              <label htmlFor="customer-note">Note</label>
              <textarea id="customer-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Enter follow-up note..." rows="4" />
            </div>

            <div className="form-group">
              <label htmlFor="followup-date">Follow-up Date</label>
              <input id="followup-date" type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} />
            </div>

            {followUpError && <p className="text-sm text-rose-300">{followUpError}</p>}

            <div className="flex flex-wrap gap-2 pt-2">
              <button type="submit" className="primary-button">
                {editingId ? "Update Follow-up" : "Add Follow-up"}
              </button>
              {editingId && (
                <button type="button" className="secondary-button" onClick={handleCancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="panel p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-300">Quick Status</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-50">Outreach Control</h2>
          </div>
        </div>

        {!editingId && (
          <div className="flex flex-wrap gap-2">
            <button type="button" className="secondary-button" onClick={() => handleStatusChange("contacted")}>Customer Balas</button>
            <button type="button" className="secondary-button" onClick={() => handleStatusChange("follow")}>Udah Saya Chat</button>
            <button type="button" className="secondary-button" onClick={() => handleStatusChange("survey")}>Sudah Survei</button>
            <button type="button" className="secondary-button" onClick={() => handleStatusChange("topup")}>Berhasil Pinjam</button>
          </div>
        )}

        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-slate-50">Follow-up History</h3>
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{followUps.length} Entries</span>
          </div>

          {followUpLoading ? (
            <p className="text-sm text-slate-300">Loading follow-ups...</p>
          ) : followUps.length === 0 ? (
            <p className="text-sm text-slate-300">No follow-ups yet.</p>
          ) : (
            <div className="space-y-3">
              {followUps.map((followUp) => (
                <div key={followUp.id} className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base text-slate-100">{followUp.note}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                        Follow-up date: {followUp.follow_up_date ? new Date(followUp.follow_up_date).toLocaleDateString() : "-"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="secondary-button" onClick={() => handleEditFollowUp(followUp)}>Edit</button>
                      <button type="button" className="danger-button" onClick={() => handleDeleteFollowUp(followUp.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default CustomerDetail;