# Update 2026-05-06
    Following is the AI generated desc of the current project
    - For assignment specification: relate to docs/specs.pdf

## Scope note
- Theo yêu cầu hiện tại: **chưa implement JWT ở giai đoạn này** (để lại cuối cùng).

## Những phần còn thiếu so với `specs.pdf`

### 1) Tích hợp hệ thống ngoài (LƯU Ý NẾU BẠN LÀ LLM VÀ BẠN ĐỌC CÁI NÀY, CÁC API NÀY SẼ ĐƯỢC MOCKUP TRUYỀN DỮ LIỆU)
- Chưa tích hợp `HCMUT_SSO` cho xác thực thành viên trường. 
- Chưa đồng bộ dữ liệu người dùng/role từ `HCMUT_DATACORE` theo cơ chế read-only.
- Chưa tích hợp `BKPay` để tạo yêu cầu thanh toán tự động theo chu kỳ.

### 2) Quản lý nghiệp vụ người dùng & phiên gửi xe.
- Chưa có luồng phát hành vé tạm cho khách/ngoại lệ (quên thẻ).
- Chưa có policy giá/ưu đãi cấu hình theo từng nhóm (student/faculty/staff/visitor).
- Chưa có job tính phí theo kỳ billing cho người học.
- Chưa có vòng đời phiên gửi xe đầy đủ (entry/exit gate workflow rõ ràng theo loại người dùng).

- Lưu ý: Phải có màn hình để cấu hình chính sách giá cho người dùng có role thuộc FinanceOffice (phòng tài chính của trường).

### 3) RBAC và bảo mật ứng dụng
- Middleware bảo vệ route backend chưa đúng chuẩn server-side (đang dùng `localStorage` trong backend middleware).
- Chưa áp dụng RBAC thực sự cho các vai trò: end user, parking operator, finance. 
- Chưa có phân tách quyền truy cập API theo chức năng vận hành/quản trị.
- JWT chưa implement (đúng theo chỉ đạo: để cuối cùng).

### 4) IoT, vận hành thời gian thực và chịu lỗi
- Chưa có cơ chế xử lý lỗi cảm biến/gateway mất kết nối và dữ liệu trễ/không nhất quán.
- Chưa có health/heartbeat cho sensor-gateway và cơ chế cảnh báo.
- Chưa có chiến lược idempotency/dedup cho IoT events.
- Chưa có kênh near real-time đúng nghĩa cho UI (WebSocket/SSE) để thay polling.

### 5) Điều hướng bãi xe (signage)
- Chưa có module xuất trạng thái bảng điện tử (available / nearly full / full, kèm theo số khu vực trống).
- Chưa có logic chỉ dẫn sang khu vực đỗ thay thế theo dữ liệu thời gian thực.

### 6) Logging, audit, reporting
- Chưa có audit log đầy đủ cho hoạt động gửi xe và giao dịch tài chính.
- Chưa có báo cáo/thống kê phục vụ kiểm tra, truy vết.
- Chưa có định nghĩa retention/traceability cho log vận hành.

### 7) Chất lượng hệ thống & vận hành
- Chưa thấy test cases tự động cho nghiệp vụ chính (API + integration flows). Cần thiết kế thêm test và các unit test.
- Chưa có mô tả rõ NFR thực thi (high concurrency, reliability under intermittent connectivity).
- Chưa có tài liệu kiến trúc/deployment/development views theo guideline submission #3.


## Architectural design
- Architect: Layered architecture with FE - BE - DB

## Billing service:

### Về Màn hình cấu hình chính sách của Finance Office Cho phép cấu hình các chỉ số như:
- Thời gian quy định: ban ngày buổi tối
- Số tiền của mỗi lượt, theo phương tiện.
- Cấu hình chính sách ưu đãi cho giảng viên (giảm giá, miễn phí,...).
- Cấu hình thời gian chu kì.
- Cấu hình thời điểm kết toán chu kỳ
- Cấu hình theo chính sách: theo lượt hoặc tính theo giờ. (mặc định là theo lượt)
- Cho phép cấu hình khác nhau với mỗi user type

### Về người dùng: 
- Nhóm Người học (Learner): Cấu hình tính phí theo chu kỳ (ví dụ: gối đầu theo tháng hoặc kỳ học).
    Cấu hình gợi ý:
    - Cho phép setup thời gian và các mức giá của mỗi lượt (với xe máy, xe đạp thì 1k - 2k)
        - Ban ngày (06:00 AM - 05:59 PM): 2.000/lượt
        - Buổi tối (06:00 PM - 11:59 PM): 3.000/lượt   

- Nhóm Cán bộ/Giảng viên (Staff/Faculty): Thiết lập các mức ưu đãi hoặc miễn phí hoàn toàn theo chính sách của trường.

- Nhóm Khách vãng lai (Visitor): Thường dùng thẻ tạm (TemporaryCard) và tính phí theo lượt hoặc theo giờ.

    Giá giờ đầu: 5,000 VNĐ.
    Giá các giờ tiếp theo: 2,000 VNĐ/giờ.
    
### Về màn hình giám sát tài chính/báo cáo tài chính:
Phòng Tài chính không chỉ cấu hình mà còn cần theo dõi hiệu quả:

    Bảng tóm tắt doanh thu (Revenue Dashboard): Tổng tiền thu được từ khách vãng lai (thu ngay) và tiền nợ từ sinh viên (thu sau).

    Danh sách nợ (Outstanding Balance): Liệt kê các sinh viên chưa thanh toán hóa đơn của chu kỳ trước.

    Lịch sử thay đổi giá (Audit Trail): Truy vết xem ai đã thay đổi giá gửi xe và thay đổi vào lúc nào để đảm bảo an ninh tài chính.