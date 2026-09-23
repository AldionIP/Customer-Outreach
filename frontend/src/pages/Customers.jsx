import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCustomers } from "../services/customerApi";
import CustomerCard from "../components/CustomerCard";

function Customers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();

        setCustomers(data);
      } catch (error) {
        console.error(
          "Failed to fetch customers:",
          error
        );

        setError("Failed to load customers.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleDelete = (customerId) => {
    setCustomers((previousCustomers) =>
      previousCustomers.filter(
        (customer) => customer.id !== customerId
      )
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage your customer data.</p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            navigate("/customers/new")
          }
        >
          Add Customer
        </button>
      </div>

      {loading && (
        <div className="customer-list">
          <p>Loading customers...</p>
        </div>
      )}

      {error && (
        <div className="customer-list">
          <p>{error}</p>
        </div>
      )}

      {!loading &&
        !error &&
        customers.length === 0 && (
          <div className="customer-list">
            <p>No customers found.</p>
          </div>
        )}

      {!loading &&
        !error &&
        customers.length > 0 && (
          <div className="customer-grid">
            {customers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
    </div>
  );
}

export default Customers;