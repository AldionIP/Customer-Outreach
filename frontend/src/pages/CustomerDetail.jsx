import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getCustomerById } from "../services/customerApi";
import {
  getFollowUpsByCustomerId,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
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

        const followUpData =
          await getFollowUpsByCustomerId(id);

        setFollowUps(followUpData);
      } catch (error) {
        console.error("Failed to fetch customer:", error);
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
        const updatedFollowUp = await updateFollowUp(
          editingId,
          {
            note,
            followUpDate,
          }
        );

        setFollowUps((currentFollowUps) =>
          currentFollowUps.map((followUp) =>
            followUp.id === editingId
              ? updatedFollowUp
              : followUp
          )
        );

        setEditingId(null);
      } else {
        const newFollowUp = await createFollowUp({
          customerId: id,
          note,
          followUpDate,
        });

        setFollowUps((currentFollowUps) => [
          newFollowUp,
          ...currentFollowUps,
        ]);
      }

      setNote("");
      setFollowUpDate("");
    } catch (error) {
      console.error("Failed to save follow-up:", error);
      setFollowUpError("Failed to save follow-up.");
    }
  };

  const handleEditFollowUp = (followUp) => {
    setEditingId(followUp.id);
    setNote(followUp.note);
    setFollowUpDate(
      followUp.follow_up_date
        ? followUp.follow_up_date.split("T")[0]
        : ""
    );
  };

  const handleDeleteFollowUp = async (followUpId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this follow-up?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteFollowUp(followUpId);

      setFollowUps((currentFollowUps) =>
        currentFollowUps.filter(
          (followUp) => followUp.id !== followUpId
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete follow-up:",
        error
      );

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
        <div className="customer-list">
          <p>Loading customer...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="customer-list">
          <p>{error}</p>

          <button
            className="secondary-button"
            onClick={() => navigate("/customers")}
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="page-container">
        <div className="customer-list">
          <p>Customer not found.</p>

          <button
            className="secondary-button"
            onClick={() => navigate("/customers")}
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Customer Detail</h1>
          <p>View customer information.</p>
        </div>

        <button
          className="secondary-button"
          onClick={() => navigate("/customers")}
        >
          Back to Customers
        </button>
      </div>

      <div className="detail-container">
        <div className="detail-header">
          <div>
            <h2>{customer.name}</h2>

            <span className="customer-status">
              {customer.status || "new"}
            </span>
          </div>
        </div>

        <div className="detail-content">
          <div className="detail-item">
            <span className="detail-label">
              Phone
            </span>

            <span className="detail-value">
              {customer.phone}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              Email
            </span>

            <span className="detail-value">
              {customer.email || "-"}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              Address
            </span>

            <span className="detail-value">
              {customer.address || "-"}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              Status
            </span>

            <span className="detail-value">
              {customer.status || "new"}
            </span>
          </div>
        </div>
      </div>

      <div className="detail-container">
        <div className="detail-header">
          <div>
            <h2>Follow-ups</h2>
            <p>
              Manage follow-up history for this customer.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmitFollowUp}>
          <div className="detail-content">
            <div className="detail-item">
              <label className="detail-label">
                Note
              </label>

              <textarea
                value={note}
                onChange={(event) =>
                  setNote(event.target.value)
                }
                placeholder="Enter follow-up note..."
                rows="4"
              />
            </div>

            <div className="detail-item">
              <label className="detail-label">
                Follow-up Date
              </label>

              <input
                type="date"
                value={followUpDate}
                onChange={(event) =>
                  setFollowUpDate(event.target.value)
                }
              />
            </div>

            {followUpError && (
              <p>{followUpError}</p>
            )}

            <div>
              <button
                type="submit"
                className="primary-button"
              >
                {editingId
                  ? "Update Follow-up"
                  : "Add Follow-up"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="detail-content">
          <h3>Follow-up History</h3>

          {followUpLoading ? (
            <p>Loading follow-ups...</p>
          ) : followUps.length === 0 ? (
            <p>No follow-ups yet.</p>
          ) : (
            followUps.map((followUp) => (
              <div
                key={followUp.id}
                className="detail-item"
              >
                <div>
                  <strong>{followUp.note}</strong>

                  <p>
                    Follow-up date:{" "}
                    {followUp.follow_up_date
                      ? new Date(
                          followUp.follow_up_date
                        ).toLocaleDateString()
                      : "-"}
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      handleEditFollowUp(followUp)
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      handleDeleteFollowUp(followUp.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerDetail;