import { useState } from 'react';
import { Link } from 'react-router-dom';

function DashboardPage({}) {
    return(
        <div className="dashboard-page">
            <Link key="/parking-history" to="/parking-history">
                Parking History
            </Link>
            
            <Link key="/info" to="/info">
                Personal Info
            </Link>
        </div>
    )
}

export default DashboardPage;