import { useEffect, useState } from 'react';

function InfoPage({}) {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch('/apiv1/auth/user-info', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user info');
                }

                const userData = await response.json();
                setUserInfo(userData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return(
        <div className="info-page">
            <h1>This is Personal Information Page</h1>
            {userInfo ? (
                <div>
                    <p>Username: {userInfo.username}</p>
                    <p>Full Name: {userInfo.fullName}</p>
                    <p>Email: {userInfo.email}</p>
                    <p>Role: {userInfo.role}</p>
                </div>
            ) : (
                <p>No user information available.</p>
            )}
        </div>
    )
}

export default InfoPage;