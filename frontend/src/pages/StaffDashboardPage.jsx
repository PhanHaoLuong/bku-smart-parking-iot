//https://www.figma.com/make/WzzgIHWqZ9dV8XokiMAR02/Operator-Dashboard-Design?p=f
//Dashboard page for monitoring real-time statuses
//Includes: Entry/Exit camera, Exception alerts - queue, Logs, Parking space availability
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { logout } from "../api/authApi";
import { getToken } from "../utils/authStorage";
import "../styles/StaffDashboardPage.css";

const CAMERA_FEEDS = [
  {
    id: "exit-front",
    title: "Exit - Front View",
    zoneLabel: "EXIT-FRONT",
    plate: "51B-67890",
    user: "Tran Thi B",
    status: "Checking",
    statusType: "checking",
  },
  {
    id: "exit-back",
    title: "Exit - Back View",
    zoneLabel: "EXIT-BACK",
    plate: "51B-67890",
    user: "Tran Thi B",
    status: "Authorized",
    statusType: "authorized",
  },
  {
    id: "entry-front",
    title: "Entry - Front View",
    zoneLabel: "ENTRY-FRONT",
    plate: "51A-12345",
    user: "Nguyen Van A",
    status: "Authorized",
    statusType: "authorized",
  },
  {
    id: "entry-back",
    title: "Entry - Back View",
    zoneLabel: "ENTRY-BACK",
    plate: "-",
    user: "-",
    status: "Waiting",
    statusType: "waiting",
  },
];

const CAMERA_OPTIONS = [
  "Exit - Front",
  "Exit - Back",
  "Entry - Front",
  "Entry - Back",
];

const REPORTS = [
  {
    title: "Daily Activity Report",
    filename: "2026-04-12_activity.pdf",
  },
  {
    title: "System Logs",
    filename: "system_2026-04-12.log",
  },
  {
    title: "Payment Transactions",
    filename: "transactions_2026-04-12.csv",
  },
];

const ZONES = [
  {
    name: "ZONE A",
    available: 21,
    total: 50,
    rows: 5,
    cols: 10,
    occupiedIndexes: [
      1, 2, 3, 6, 7, 10, 13, 17, 20, 21, 24, 25, 28, 31, 32, 33, 37, 40, 41, 43,
      45, 46, 49,
    ],
  },
  {
    name: "ZONE B",
    available: 21,
    total: 50,
    rows: 5,
    cols: 10,
    occupiedIndexes: [
      2, 5, 6, 7, 8, 10, 12, 15, 18, 19, 21, 23, 24, 27, 30, 33, 36, 37, 38, 40,
      42, 45, 46, 48,
    ],
  },
  {
    name: "ZONE C",
    available: 62,
    total: 100,
    rows: 5,
    cols: 20,
    occupiedIndexes: [
      1, 2, 3, 4, 6, 7, 10, 11, 17, 19, 23, 24, 26, 29, 30, 31, 35, 39, 44, 50,
      56, 57, 58, 62, 67, 70, 74, 76, 78, 83, 89, 92,
    ],
  },
];

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
  });
}

function StaffTopBar({ now }) {
  return (
    <header className="staff-topbar">
      <div>
        <h1>HCMUT Smart Parking Management System</h1>
        <p>Operator Dashboard - Staff UI v2.0</p>
      </div>

      <div className="staff-clock">
        <span>{formatDate(now)}</span>
        <strong>{formatTime(now)}</strong>
      </div>
    </header>
  );
}

function StaffSideNav({ activeTab, setActiveTab, onLogout }) {
  return (
    <aside className="staff-side-nav">
      <div className="staff-brand-box">HCMUT</div>

      <button
        className={
          activeTab === "monitor"
            ? "staff-nav-button active"
            : "staff-nav-button"
        }
        onClick={() => setActiveTab("monitor")}
        title="Camera Monitoring"
      >
        ▣
      </button>

      <button
        className={
          activeTab === "exceptions"
            ? "staff-nav-button active"
            : "staff-nav-button"
        }
        onClick={() => setActiveTab("exceptions")}
        title="Exception Queue"
      >
        ⚠<span className="staff-alert-badge">3</span>
      </button>

      <button
        className={
          activeTab === "reports"
            ? "staff-nav-button active"
            : "staff-nav-button"
        }
        onClick={() => setActiveTab("reports")}
        title="Reports & Logs"
      >
        ▤
      </button>

      <button
        className={
          activeTab === "map" ? "staff-nav-button active" : "staff-nav-button"
        }
        onClick={() => setActiveTab("map")}
        title="Parking Map"
      >
        ⌖
      </button>

      <button className="staff-logout-button" onClick={onLogout} title="Logout">
        ⏻
      </button>

      <button className="staff-help-button" title="Help">
        ?
      </button>
    </aside>
  );
}

function CameraCard({ feed }) {
  return (
    <article className="camera-card">
      <div className="camera-screen">
        <div className="camera-card-title">{feed.title}</div>

        <div className="live-indicator">
          <span></span>
          LIVE
        </div>

        <div className="camera-placeholder">{feed.zoneLabel}</div>
      </div>

      <div className="camera-meta">
        <div>
          <span>PLATE:</span>
          <strong>{feed.plate}</strong>
        </div>

        <div>
          <span>USER:</span>
          <strong>{feed.user}</strong>
        </div>

        <div>
          <span>STATUS:</span>
          <strong className={`status-${feed.statusType}`}>{feed.status}</strong>
        </div>
      </div>
    </article>
  );
}

function ControlPanel() {
  return (
    <div className="staff-control-column">
      <section className="staff-control-panel">
        <h2>SELECT CAMERA</h2>

        <div className="camera-select-list">
          {CAMERA_OPTIONS.map((camera) => (
            <button key={camera}>{camera}</button>
          ))}
        </div>
      </section>

      <section className="staff-control-panel">
        <h2>BARRIER CONTROL</h2>

        <button className="barrier-button" disabled>
          OPEN BARRIER
        </button>

        <button className="barrier-button" disabled>
          CLOSE BARRIER
        </button>
      </section>
    </div>
  );
}

function MonitorView({ summary }) {
  return (
    <>
      <section className="staff-monitor-grid">
        <div className="camera-grid">
          {CAMERA_FEEDS.map((feed) => (
            <CameraCard key={feed.id} feed={feed} />
          ))}
        </div>

        <ControlPanel />
      </section>

      <section className="staff-status-row">
        <div className="staff-status-card">
          <p>SYSTEM STATUS</p>
          <strong className="system-operational">
            <span></span>
            OPERATIONAL
          </strong>
        </div>

        <div className="staff-status-card">
          <p>ACTIVE SESSIONS</p>
          <strong>{summary.activeSessions}</strong>
        </div>

        <div className="staff-status-card">
          <p>VEHICLES IN/OUT</p>
          <strong>
            <span className="in-count">↑ {summary.vehiclesIn}</span>
            <span className="out-count"> / ↓ {summary.vehiclesOut}</span>
          </strong>
        </div>

        <div className="staff-status-card">
          <p>OCCUPANCY</p>
          <strong>{summary.occupancy}%</strong>
        </div>
      </section>
    </>
  );
}

function ExceptionsView() {
  return (
    <section className="staff-panel-large">
      <h2>Exception Queue</h2>
      <p>Exception management panel is available as a floating window.</p>
    </section>
  );
}

function ReportsView() {
  return (
    <section className="staff-panel-large">
      <h2>Reports & Logs</h2>

      <div className="report-list">
        {REPORTS.map((report) => (
          <div className="report-card" key={report.filename}>
            <p>{report.title}</p>
            <strong>{report.filename}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function ZoneDots({ zone }) {
  const total = zone.rows * zone.cols;

  return (
    <div
      className="zone-dots"
      style={{
        gridTemplateColumns: `repeat(${zone.cols}, 12px)`,
      }}
    >
      {Array.from({ length: total }).map((_, index) => {
        const isOccupied = zone.occupiedIndexes.includes(index);

        return (
          <span
            key={index}
            className={isOccupied ? "slot-dot occupied" : "slot-dot available"}
          ></span>
        );
      })}
    </div>
  );
}

function MapView() {
  return (
    <>
      <section className="zone-summary-row">
        {ZONES.map((zone) => (
          <div className="zone-summary-card" key={zone.name}>
            <p>{zone.name}</p>
            <strong>
              {zone.available}
              <span> / {zone.total}</span>
            </strong>
            <small>Available</small>
          </div>
        ))}
      </section>

      <section className="parking-map-panel">
        {ZONES.map((zone) => (
          <div
            className={
              zone.name === "ZONE C" ? "zone-block zone-large" : "zone-block"
            }
            key={zone.name}
          >
            <h3>{zone.name}</h3>
            <ZoneDots zone={zone} />
          </div>
        ))}
      </section>

      <div className="map-legend">
        <div>
          <span className="slot-dot available"></span>
          Available
        </div>

        <div>
          <span className="slot-dot occupied"></span>
          Occupied
        </div>
      </div>
    </>
  );
}

function StaffDashboardPage() {
  const navigate = useNavigate();
  const { handleLogout } = useAuth();

  const [activeTab, setActiveTab] = useState("monitor");
  const [now, setNow] = useState(new Date());
  const [summary, setSummary] = useState({
    activeSessions: 47,
    vehiclesIn: 23,
    vehiclesOut: 18,
    occupancy: 68,
  });

  async function handleStaffLogout() {
    const token = getToken();

    try {
      if (token) {
        await logout(token);
      }
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      handleLogout();
      navigate("/auth", { replace: true });
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchMonitoringSummary = async () => {
      try {
        const response = await fetch("/apiv1/monitoring/summary");

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setSummary({
          activeSessions: data.activeSessions ?? 47,
          vehiclesIn: data.vehiclesIn ?? 23,
          vehiclesOut: data.vehiclesOut ?? 18,
          occupancy: data.occupancy ?? 68,
        });
      } catch (error) {
        console.warn(
          "Using mock monitoring summary because API is unavailable.",
        );
      }
    };

    fetchMonitoringSummary();
    const interval = setInterval(fetchMonitoringSummary, 20000);

    return () => clearInterval(interval);
  }, []);

  const content = useMemo(() => {
    if (activeTab === "exceptions") {
      return <ExceptionsView />;
    }

    if (activeTab === "reports") {
      return <ReportsView />;
    }

    if (activeTab === "map") {
      return <MapView />;
    }

    return <MonitorView summary={summary} />;
  }, [activeTab, summary]);

  return (
    <div className="staff-dashboard-shell">
      <div className="staff-dashboard-content">
        <StaffTopBar now={now} />
        {content}
      </div>
      <StaffSideNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleStaffLogout}
      />{" "}
    </div>
  );
}

export default StaffDashboardPage;
