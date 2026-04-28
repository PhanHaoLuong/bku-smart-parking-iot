//https://www.figma.com/make/WzzgIHWqZ9dV8XokiMAR02/Operator-Dashboard-Design?p=f
//Dashboard page for monitoring real-time statuses
//Includes: Entry/Exit camera, Exception alerts - queue, Logs, Parking space availability
import { useEffect, useState } from 'react';

function StaffDashboardPage({}) {
    const [realTimeData, setRealTimeData] = useState(null);

    useEffect(() => {
        // Simulate fetching real-time data
        const fetchData = () => {
            // Replace this with your actual data fetching logic
            setRealTimeData({
                entryExitCamera: 'Active',
                exceptionAlerts: 5,
                logs: ['Log 1', 'Log 2', 'Log 3'],
                parkingSpaceAvailability: 80
            });
        };

        fetchData();
        const interval = setInterval(fetchData, 20000); // Update every 20 seconds

        return () => clearInterval(interval);
    }, []);

    return(
        <div className="staff-dashboard-page">
            <h1>This is Staff Dashboard Page</h1>
            {realTimeData && (
                <div>
                    <p>Entry/Exit Camera: {realTimeData.entryExitCamera}</p>
                    <p>Exception Alerts: {realTimeData.exceptionAlerts}</p>
                    <p>Parking Space Availability: {realTimeData.parkingSpaceAvailability}%</p>
                    <h2>Logs:</h2>
                    <ul>
                        {realTimeData.logs.map((log, index) => (
                            <li key={index}>{log}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default StaffDashboardPage;