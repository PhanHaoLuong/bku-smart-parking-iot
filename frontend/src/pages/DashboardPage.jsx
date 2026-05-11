import { Link } from 'react-router-dom';

function DashboardPage({ role }) {
    const isFinance = role === 'finance';
    const isOperator = role === 'operator';

    return(
        <div className="dashboard-page">
            <Link key="/parking-history" to="/parking-history">
                Parking History
            </Link>

            <Link key="/info" to="/info">
                Personal Info
            </Link>

            {isOperator && (
                <Link key="/staff-dashboard" to="/staff-dashboard">
                    Staff Dashboard
                </Link>
            )}

            {isFinance && (
                <>
                    <Link key="/finance-dashboard" to="/finance-dashboard">
                        Finance Dashboard
                    </Link>
                    <Link key="/finance/pricing" to="/finance/pricing">
                        Pricing Config
                    </Link>
                    <Link key="/finance/invoices" to="/finance/invoices">
                        Invoices
                    </Link>
                </>
            )}
        </div>
    )
}

export default DashboardPage;
