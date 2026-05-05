import { useEffect, useState } from 'react';

function ParkingHistoryPage({ role, userId }) {
    const [parkingHistory, setParkingHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchParkingHistory = async () => {
            try {
                const endpoint = role === 'admin' || role === 'operator'
                    ? '/apiv1/parking-history'
                    : `/apiv1/parking-history/${userId}`;

                const response = await fetch(endpoint, {
                    credentials: 'include',
                });

                if (response.status === 403) {
                    throw new Error('You do not have permission to access this resource');
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch parking history');
                }

                const data = await response.json();
                setParkingHistory(Array.isArray(data) ? data : []);
            } catch (fetchError) {
                console.error('Error fetching parking history:', fetchError);
                setError(fetchError.message || 'Unable to load parking history.');
            } finally {
                setLoading(false);
            }
        };

        fetchParkingHistory();
    }, [role, userId]);

    return (
        <div className="parking-history-page">
            <h1>This is Parking History Page</h1>
            {loading && <p>Loading parking history...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && (
                <ul>
                    {parkingHistory.map((entry) => (
                        <li key={entry._id}>
                            <p>Plate Number: {entry.plateNumber}</p>
                            <p>Entry Time: {new Date(entry.entryTime).toLocaleString()}</p>
                            <p>Exit Time: {entry.exitTime ? new Date(entry.exitTime).toLocaleString() : 'Still parked'}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ParkingHistoryPage;