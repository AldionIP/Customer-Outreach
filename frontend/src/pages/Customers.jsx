import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCustomers } from "../services/customerApi";
import CustomerCard from "../components/CustomerCard";
import { OUTREACH_STATUSES } from "../constants/outreachStatus";

function Customers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await getCustomers({
          search,
          status,
          page,
          limit: 10,
        });

        setCustomers(result.data);
        setPagination(result.pagination);
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
  }, [search, status, page]);

  const handleDelete = (customerId) => {
    setCustomers((previousCustomers) =>
      previousCustomers.filter(
        (customer) => customer.id !== customerId
      )
    );
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < pagination.totalPages) {
      setPage(page + 1);
    }
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

      <div className="customer-filters">
        <input
          type="text"
          placeholder="Search customer..."
          value={search}
          onChange={handleSearchChange}
        />

        <select
          value={status}
          onChange={handleStatusChange}
        >
          <option value="">All Status</option>
          {OUTREACH_STATUSES.map((outreachStatus) => (
            <option key={outreachStatus.value} value={outreachStatus.value}>
              {outreachStatus.label}
            </option>
          ))}
        </select>
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
          <>
            <div className="customer-grid">
              {customers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="secondary-button"
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                >
                  Previous
                </button>

                <span>
                  Page {page} of{" "}
                  {pagination.totalPages}
                </span>

                <button
                  className="secondary-button"
                  onClick={handleNextPage}
                  disabled={
                    page === pagination.totalPages
                  }
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
    </div>
  );
}

export default Customers;