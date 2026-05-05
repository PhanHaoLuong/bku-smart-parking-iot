//https://www.figma.com/make/WzzgIHWqZ9dV8XokiMAR02/Operator-Dashboard-Design?p=f
//Dashboard page for monitoring real-time statuses
//Includes: Entry/Exit camera, Exception alerts - queue, Logs, Parking space availability
import { useEffect, useState } from 'react';

function StaffDashboardPage({}) {
    const [realTimeData, setRealTimeData] = useState(null);

    useEffect(() => {
        // Simulate fetching real-time data
        const fetchData = async () => {
            // Replace this with your actual data fetching logic
            const data = await fetch('/apiv1/monitoring/summary');
            setRealTimeData(await data.json());
        };

        fetchData();
        const interval = setInterval(fetchData, 20000); // Update every 20 seconds

        return () => clearInterval(interval);
    }, []);

    return(
        <div className="staff-dashboard-page">
            <h1>This is Staff Dashboard Page</h1>
            {realTimeData ? (
                <div>
                    <h2>Real-Time Data</h2>
                    <pre>{JSON.stringify(realTimeData, null, 2)}</pre>
                </div>
            ) : (
                <p>Loading real-time data...</p>
            )}
        </div>
    )
}

export default StaffDashboardPage;