import { useEffect, useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}`;

function Dashboard() {
  const [dashboard, setDashboard] = useState({
    totalCustomers: 0,
    followCustomers: 0,
    contactedCustomers: 0,
    surveyCustomers: 0,
    topupCustomers: 0,
    totalFollowUps: 0,
    upcomingFollowUps: 0,
    overdueFollowUps: 0,
    recentFollowUps: [],
    upcomingFollowUpItems: [],
    overdueFollowUpItems: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/dashboard`);

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const result = await response.json();

        setDashboard({
          totalCustomers: result.totalCustomers || 0,
          followCustomers: result.followCustomers || 0,
          contactedCustomers: result.contactedCustomers || 0,
          surveyCustomers: result.surveyCustomers || 0,
          topupCustomers: result.topupCustomers || 0,
          totalFollowUps: result.totalFollowUps || 0,
          upcomingFollowUps: result.upcomingFollowUps || 0,
          overdueFollowUps: result.overdueFollowUps || 0,
          recentFollowUps: result.recentFollowUps || [],
          upcomingFollowUpItems: result.upcomingFollowUpItems || [],
          overdueFollowUpItems: result.overdueFollowUpItems || [],
        });
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

  const {
    totalCustomers,
    followCustomers,
    contactedCustomers,
    surveyCustomers,
    topupCustomers,
    totalFollowUps,
    upcomingFollowUps,
    overdueFollowUps,
    recentFollowUps,
    upcomingFollowUpItems,
    overdueFollowUpItems,
  } = dashboard;

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
            Udah Saya Chat
          </span>

          <strong className="dashboard-card-value">
            {followCustomers}
          </strong>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-card-label">
            Customer Balas
          </span>

          <strong className="dashboard-card-value">
            {contactedCustomers}
          </strong>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-card-label">
            Sudah Survei
          </span>

          <strong className="dashboard-card-value">
            {surveyCustomers}
          </strong>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-card-label">
            Berhasil Pinjam
          </span>

          <strong className="dashboard-card-value">
            {topupCustomers}
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

        <div className="dashboard-card">
          <span className="dashboard-card-label">
            Upcoming Follow-ups
          </span>

          <strong className="dashboard-card-value">
            {upcomingFollowUps}
          </strong>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-card-label">
            Overdue Follow-ups
          </span>

          <strong className="dashboard-card-value">
            {overdueFollowUps}
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
                  {followUp.customer_name || "Customer"}
                </strong>

                <p>{followUp.note}</p>

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

      <div className="customer-list">
        <h2>Upcoming Follow-ups</h2>

        {upcomingFollowUpItems.length === 0 ? (
          <p>No upcoming follow-ups scheduled.</p>
        ) : (
          upcomingFollowUpItems.map((followUp) => (
            <div key={followUp.id} className="detail-item">
              <div>
                <strong>{followUp.customer_name || "Customer"}</strong>
                <p>{followUp.note}</p>
                <p>
                  Due: {new Date(followUp.follow_up_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="customer-list">
        <h2>Overdue Follow-ups</h2>

        {overdueFollowUpItems.length === 0 ? (
          <p>No overdue follow-ups.</p>
        ) : (
          overdueFollowUpItems.map((followUp) => (
            <div key={followUp.id} className="detail-item">
              <div>
                <strong>{followUp.customer_name || "Customer"}</strong>
                <p>{followUp.note}</p>
                <p>
                  Due: {new Date(followUp.follow_up_date).toLocaleDateString()}
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