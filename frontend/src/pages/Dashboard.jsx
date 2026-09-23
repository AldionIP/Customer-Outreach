import { useEffect, useState } from "react";

import { getCustomers } from "../services/customerApi";

function Dashboard() {
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

        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const totalCustomers = customers.length;

  const newCustomers = customers.filter(
    (customer) =>
      (customer.status || "new") === "new"
  ).length;

  const contactedCustomers = customers.filter(
    (customer) =>
      customer.status === "contacted"
  ).length;

  const followUpCustomers = customers.filter(
    (customer) =>
      customer.status === "follow-up"
  ).length;

  const convertedCustomers = customers.filter(
    (customer) =>
      customer.status === "converted"
  ).length;

  const closedCustomers = customers.filter(
    (customer) =>
      customer.status === "closed"
  ).length;

  if (loading) {
    return (
      <div className="page-container">
        <div className="customer-list">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="customer-list">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Overview of your customer outreach
            activities.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <span className="dashboard-card-label">
            Total Customers
          </span>

          <strong className="dashboard-card-value">
            {totalCustomers}
          </strong>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-card-label">
            New
          </span>

          <strong className="dashboard-card-value">
            {newCustomers}
          </strong>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-card-label">
            Contacted
          </span>

          <strong className="dashboard-card-value">
            {contactedCustomers}
          </strong>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-card-label">
            Follow Up
          </span>

          <strong className="dashboard-card-value">
            {followUpCustomers}
          </strong>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-card-label">
            Converted
          </span>

          <strong className="dashboard-card-value">
            {convertedCustomers}
          </strong>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-card-label">
            Closed
          </span>

          <strong className="dashboard-card-value">
            {closedCustomers}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;