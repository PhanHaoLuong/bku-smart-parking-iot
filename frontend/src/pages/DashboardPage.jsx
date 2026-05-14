import { Link } from 'react-router-dom';

function DashboardPage({ role }) {
    const isFinance = role === 'finance';
    const isOperator = role === 'operator';

    return(
        <div className="dashboard-page">
            <Link key="/parking-history" to="/parking-history">
                Lịch sử đỗ xe
            </Link>

            <Link key="/info" to="/info">
                Thông tin cá nhân
            </Link>

            {isOperator && (
                <Link key="/staff-dashboard" to="/staff-dashboard">
                    Bảng điều khiển
                </Link>
            )}

            {isFinance && (
                <>
                    <Link key="/finance-dashboard" to="/finance-dashboard">
                        Bảng tài chính
                    </Link>
                    <Link key="/finance/pricing" to="/finance/pricing">
                        Cấu hình giá
                    </Link>
                    <Link key="/finance/invoices" to="/finance/invoices">
                        Hóa đơn
                    </Link>
                </>
            )}
        </div>
    )
}

export default DashboardPage;
