import { useEffect, useState } from "react";

import { getCustomers } from "../services/customerApi";
import { getFollowUpsByCustomerId } from "../services/followUpApi";

function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [followUps, setFollowUps] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const customerResult = await getCustomers({
          page: 1,
          limit: 100,
        });

        const customerData = customerResult.data || [];

        setCustomers(customerData);

        const followUpResults = await Promise.all(
          customerData.map((customer) =>
            getFollowUpsByCustomerId(customer.id)
          )
        );

        const allFollowUps =
          followUpResults.flat();

        setFollowUps(allFollowUps);
      } catch (error) {
        console.error(
          "Failed to fetch dashboard data:",
          error
        );

        setError(
          "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  const totalFollowUps = followUps.length;

  const recentFollowUps = [...followUps]
    .sort(
      (a, b) =>
        new Date(b.created_at) -
        new Date(a.created_at)
    )
    .slice(0, 5);

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

        <div className="dashboard-card">
          <span className="dashboard-card-label">
            Total Follow-ups
          </span>

          <strong className="dashboard-card-value">
            {totalFollowUps}
          </strong>
        </div>
      </div>

      <div className="customer-list">
        <h2>Recent Follow-ups</h2>

        {recentFollowUps.length === 0 ? (
          <p>No follow-ups yet.</p>
        ) : (
          recentFollowUps.map((followUp) => (
            <div
              key={followUp.id}
              className="detail-item"
            >
              <div>
                <strong>
                  {followUp.note}
                </strong>

                <p>
                  Follow-up date:{" "}
                  {followUp.follow_up_date
                    ? new Date(
                        followUp.follow_up_date
                      ).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;