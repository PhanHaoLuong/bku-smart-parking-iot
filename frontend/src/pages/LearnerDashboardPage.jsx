import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../stores/authStore.js";
import { getUserInfo } from "../api/userApi.js";
import { getMyParkingHistory } from "../api/parkingApi.js";
import "../styles/LearnerDashboardPage.css";

function formatDateTime(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

function LearnerDashboardPage() {
  const { username, userId, role, handleLogout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [parkingHistory, setParkingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchLearnerDashboard() {
      try {
        setLoading(true);
        setError("");

        const [profileData, historyData] = await Promise.all([
          getUserInfo(),
          getMyParkingHistory(userId),
        ]);

        if (!ignore) {
          setProfile(profileData);
          setParkingHistory(historyData);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error fetching learner dashboard:", err);
          setError(err.message || "Unable to load learner dashboard.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchLearnerDashboard();

    return () => {
      ignore = true;
    };
  }, [userId]);

  const activeSession = useMemo(
    () =>
      parkingHistory.find(
        (entry) => entry.status === "parked" || !entry.exitTime,
      ),
    [parkingHistory],
  );

  const recentSessions = useMemo(
    () => parkingHistory.slice(0, 5),
    [parkingHistory],
  );
  const recentVehicle = activeSession || parkingHistory[0];

  return (
    <div className="learner-dashboard">
      <aside className="learner-sidebar">
        <div className="learner-logo">
          <h2>BKU Parking</h2>
          <p>Learner Portal</p>
        </div>

        <nav className="learner-nav">
          <Link to="/dashboard" className="learner-nav-link active">
            Dashboard
          </Link>

          <Link to="/parking-history" className="learner-nav-link">
            Parking History
          </Link>

          <Link to="/info" className="learner-nav-link">
            Personal Info
          </Link>
        </nav>

        <button className="learner-logout-button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="learner-main">
        <header className="learner-header">
          <div>
            <p className="learner-subtitle">Welcome back</p>
            <h1>Learner Dashboard</h1>
          </div>

          <div className="learner-user-badge">
            <span>{profile?.role || role || "learner"}</span>
          </div>
        </header>

        {error && <div className="learner-empty-state">{error}</div>}

        <section className="learner-welcome-card">
          <div>
            <h2>Hello, {profile?.fullName || username || "Learner"}</h2>
            <p>
              Manage your parking information, check your history, and follow
              your parking activities in BKU Smart Parking.
            </p>
          </div>
        </section>

        <section className="learner-stats-grid">
          <div className="learner-stat-card">
            <p>Current Session</p>
            <h3>{loading ? "..." : activeSession ? "Active" : "None"}</h3>
            <span>
              {activeSession
                ? `${activeSession.plateNumber} at ${activeSession.slotId}`
                : "No active parking session"}
            </span>
          </div>

          <div className="learner-stat-card">
            <p>Parking Records</p>
            <h3>{loading ? "..." : parkingHistory.length}</h3>
            <span>Total parking records from MongoDB</span>
          </div>

          <div className="learner-stat-card">
            <p>Card Status</p>
            <h3>{profile?.cardActive === false ? "Inactive" : "Active"}</h3>
            <span>Your access card status</span>
          </div>

          <div className="learner-stat-card">
            <p>Vehicle Status</p>
            <h3>{recentVehicle?.plateNumber || "N/A"}</h3>
            <span>{recentVehicle?.vehicleType || "No vehicle record yet"}</span>
          </div>
        </section>

        <section className="learner-section">
          <div className="learner-section-header">
            <h2>Quick Actions</h2>
            <p>Common actions for learner users</p>
          </div>

          <div className="learner-action-grid">
            <Link to="/parking-history" className="learner-action-card">
              <h3>View Parking History</h3>
              <p>Check your previous parking sessions and details.</p>
            </Link>

            <Link to="/info" className="learner-action-card">
              <h3>Personal Information</h3>
              <p>View your account and vehicle information.</p>
            </Link>

            <Link to="/dashboard" className="learner-action-card">
              <h3>Current Session</h3>
              <p>See active session details from parking sessions.</p>
            </Link>

            <Link to="/dashboard" className="learner-action-card">
              <h3>Card Status</h3>
              <p>Check whether your learner parking card is active.</p>
            </Link>
          </div>
        </section>

        <section className="learner-recent-card">
          <div className="learner-section-header">
            <h2>Recent Activity</h2>
            <p>Your latest parking activities from MongoDB</p>
          </div>

          {loading && (
            <div className="learner-empty-state">
              Loading recent activity...
            </div>
          )}

          {!loading && recentSessions.length === 0 && (
            <div className="learner-empty-state">
              No recent activity available.
            </div>
          )}

          {!loading && recentSessions.length > 0 && (
            <div className="learner-empty-state" style={{ textAlign: "left" }}>
              {recentSessions.map((session) => (
                <p key={session._id}>
                  <strong>{session.plateNumber}</strong> — {session.status} —{" "}
                  {session.slotId} — {formatDateTime(session.entryTime)}
                </p>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default LearnerDashboardPage;