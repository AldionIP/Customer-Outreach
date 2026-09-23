import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getCustomerById } from "../services/customerApi";

function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const data = await getCustomerById(id);

        setCustomer(data);
      } catch (error) {
        console.error("Failed to fetch customer:", error);

        setError("Failed to load customer.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

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
    </div>
  );
}

export default CustomerDetail;