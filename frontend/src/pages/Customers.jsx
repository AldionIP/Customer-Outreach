import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CustomerCard from "../components/CustomerCard";
import { OUTREACH_STATUSES } from "../constants/outreachStatus";
import { getCustomers } from "../services/customerApi";

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
      } catch (fetchError) {
        console.error("Failed to fetch customers:", fetchError);
        setError("Failed to load customers.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [search, status, page]);

  const handleDelete = (customerId) => {
    setCustomers((previousCustomers) => previousCustomers.filter((customer) => customer.id !== customerId));
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
    <div className="page-container content-stack">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="hud-label">
            <span className="status-dot" />
            Customer Database
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-slate-50">Customer Command Panel</h1>
          <p className="mt-2 text-sm text-slate-300">Manage and monitor every customer record with clear outreach status.</p>
        </div>

        <button type="button" className="primary-button" onClick={() => navigate("/customers/new")}>
          Add Customer
        </button>
      </header>

      <section className="panel p-4 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <label htmlFor="customer-search" className="sr-only">Search customer</label>
            <input
              id="customer-search"
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search customer name or contact..."
            />
          </div>

          <div className="w-full md:max-w-xs">
            <label htmlFor="customer-status" className="sr-only">Filter by status</label>
            <select id="customer-status" value={status} onChange={handleStatusChange}>
              <option value="">All status</option>
              {OUTREACH_STATUSES.map((outreachStatus) => (
                <option key={outreachStatus.value} value={outreachStatus.value}>
                  {outreachStatus.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {loading && (
        <div className="panel p-8 text-slate-200">
          <p>Loading customer telemetry...</p>
        </div>
      )}

      {error && (
        <div className="panel p-8 text-slate-200">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && customers.length === 0 && (
        <div className="panel p-8 text-slate-200">
          <p>No customers found.</p>
        </div>
      )}

      {!loading && !error && customers.length > 0 && (
        <>
          <div className="grid gap-5 xl:grid-cols-2">
            {customers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} onDelete={handleDelete} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="panel flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
              <button type="button" className="secondary-button" onClick={handlePreviousPage} disabled={page === 1}>
                Previous
              </button>

              <span className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Page {page} of {pagination.totalPages}
              </span>

              <button type="button" className="secondary-button" onClick={handleNextPage} disabled={page === pagination.totalPages}>
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