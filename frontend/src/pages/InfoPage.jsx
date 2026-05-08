import { useEffect, useMemo, useState } from "react";
import LearnerLayout from "../components/learner/LearnerLayout";
import { getUserInfo } from "../api/userApi.js";
import { getMyParkingHistory } from "../api/parkingApi.js";
import "../styles/InfoPage.css";

function InfoItem({ label, value }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value || "Not available"}</strong>
    </div>
  );
}

function InfoPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [parkingHistory, setParkingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        setError("");

        const userData = await getUserInfo();
        const historyData = await getMyParkingHistory(
          userData.userId || userData.id,
        );

        if (!ignore) {
          setUserInfo(userData);
          setParkingHistory(historyData);
        }
      } catch (fetchError) {
        if (!ignore) {
          console.error("Error fetching user info:", fetchError);
          setError(
            fetchError.message || "Unable to load personal information.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchUserInfo();

    return () => {
      ignore = true;
    };
  }, []);

  const latestVehicle = useMemo(() => {
    return (
      parkingHistory.find((entry) => entry.status === "parked") ||
      parkingHistory[0] ||
      null
    );
  }, [parkingHistory]);

  return (
    <LearnerLayout
      title="Personal Information"
      subtitle="View your learner profile"
    >
      {loading && (
        <div className="info-state-card">Loading personal information...</div>
      )}

      {error && <div className="info-error-card">{error}</div>}

      {!loading && !error && !userInfo && (
        <div className="info-state-card">No user information available.</div>
      )}

      {!loading && !error && userInfo && (
        <div className="info-page-grid">
          <section className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {userInfo.fullName
                  ? userInfo.fullName.charAt(0).toUpperCase()
                  : "U"}
              </div>

              <div>
                <h2>{userInfo.fullName || "Learner User"}</h2>
                <p>{userInfo.email || "No email available"}</p>
              </div>
            </div>

            <div className="profile-role-badge">
              {userInfo.role || "learner"}
            </div>
          </section>

          <section className="info-card">
            <div className="info-card-header">
              <h2>Account Details</h2>
              <p>Basic information connected to your BKU Parking account.</p>
            </div>

            <div className="info-list">
              <InfoItem label="Username" value={userInfo.username} />
              <InfoItem label="Full Name" value={userInfo.fullName} />
              <InfoItem label="Email" value={userInfo.email} />
              <InfoItem label="Role" value={userInfo.role} />
              <InfoItem label="User Type" value={userInfo.userType} />
            </div>
          </section>

          <section className="info-card">
            <div className="info-card-header">
              <h2>Vehicle Information</h2>
              <p>Inferred from your latest parking sessions in MongoDB.</p>
            </div>

            <div className="info-list">
              <InfoItem
                label="Plate Number"
                value={latestVehicle?.plateNumber}
              />

              <InfoItem
                label="Vehicle Type"
                value={latestVehicle?.vehicleType}
              />

              <InfoItem label="Last Slot" value={latestVehicle?.slotId} />

              <InfoItem label="Parking Lot" value={latestVehicle?.parkingLot} />
            </div>
          </section>

          <section className="info-card full-width">
            <div className="info-card-header">
              <h2>Account Status</h2>
              <p>Current status of your learner account.</p>
            </div>

            <div className="status-panel">
              <div>
                <span className="status-dot"></span>
                <strong>
                  {userInfo.cardActive === false
                    ? "Inactive account"
                    : "Active account"}
                </strong>
              </div>

              <p>
                Your account data is loaded from the users collection. Parking
                vehicle data is loaded from the parkingsessions collection.
              </p>
            </div>
          </section>
        </div>
      )}
    </LearnerLayout>
  );
}

export default InfoPage;