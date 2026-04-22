import { useState } from 'react';
import { Link } from 'react-router-dom';

function DashboardPage({}) {
    return(
        <div clasName="dashboard-page">
            <Link key="/parking-history" to="/parking-history">
                Parking History
            </Link>
            
            <Link key="/personal-info" to="/personal-info">
                Personal Info
            </Link>
        </div>
    )
}

export default DashboardPage;