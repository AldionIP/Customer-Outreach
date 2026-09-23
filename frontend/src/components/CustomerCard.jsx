import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { deleteCustomer } from "../services/customerApi";

function CustomerCard({ customer, onDelete }) {
  const navigate = useNavigate();

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.name}?`
    );

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
    <div className="customer-card">
      <div className="customer-card-header">
        <h3>{customer.name}</h3>

        <span className="customer-status">
          {customer.status || "new"}
        </span>
      </div>

      <div className="customer-card-body">
        <p>
          <strong>Phone:</strong>{" "}
          {customer.phone}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {customer.email || "-"}
        </p>

        <p>
          <strong>Address:</strong>{" "}
          {customer.address || "-"}
        </p>
      </div>

      <div className="customer-card-actions">
        <button
          className="secondary-button"
          onClick={() =>
            navigate(`/customers/${customer.id}`)
          }
          disabled={deleting}
        >
          View
        </button>

        <button
          className="secondary-button"
          onClick={() =>
            navigate(`/customers/${customer.id}/edit`)
          }
          disabled={deleting}
        >
          Edit
        </button>

        <button
          className="danger-button"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

export default CustomerCard;