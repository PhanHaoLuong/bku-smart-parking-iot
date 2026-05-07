1. Thông tin chung về dự án (Project Overview)

    Tên dự án: Hệ thống Quản lý Bãi đỗ xe Thông minh cho Khuôn viên Trường Đại học (IoT-SPMS).  

    Đơn vị: Đại học Bách Khoa – ĐHQG TP.HCM (HCMUT).  

    Mục tiêu: Giải quyết tình trạng ùn tắc, tối ưu hóa việc sử dụng chỗ đậu xe, giám sát thời gian thực và tự động hóa việc tính phí.  

    Công nghệ cốt lõi: Internet vạn vật (IoT) và các nguyên lý công nghệ phần mềm hiện đại.  

2. Các thành phần hệ thống và Yêu cầu chức năng

Hệ thống được chia thành hai mảng chính: Quản lý người dùng/thanh toán và Hạ tầng IoT.
Đối tượng người dùng và Truy cập:

    Người dùng nội bộ: Sinh viên, học viên, nghiên cứu sinh, giảng viên và cán bộ nhân viên.  

        Sử dụng thẻ định danh (ID card) để ra vào tự động.  

        Xác thực qua hệ thống HCMUT_SSO.  

        Dữ liệu cá nhân đồng bộ từ HCMUT_DATACORE (chế độ chỉ đọc).  

    Khách vãng lai/Trường hợp ngoại lệ: Những người không có thẻ hoặc thẻ tạm thời.  

        Cung cấp cơ chế cấp vé tạm thời tại cổng.  

        Quản lý phiên gửi xe độc lập với hệ thống xác thực tập trung.  

Cơ chế thanh toán:

    BKPay: Tích hợp nền tảng thanh toán nội bộ của trường.  

    Quy trình: Hệ thống tổng hợp hoạt động gửi xe theo chu kỳ, tự động tính phí và gửi yêu cầu thanh toán qua BKPay.  

    Chính sách: Giá phí và quyền lợi có thể thay đổi tùy theo vai trò (giảng viên, cán bộ) và phải cấu hình được bởi quản trị viên.  

Hạ tầng IoT và Điều hướng:

    Cảm biến (Sensors): Mỗi chỗ đậu xe được gắn cảm biến để phát hiện trạng thái chiếm chỗ.  

    Gateway: Thu thập dữ liệu từ cảm biến và truyền về hệ thống trung tâm qua các giao thức tiêu chuẩn.  

    Bảng hiển thị (Signage): Đặt tại cổng và các nút giao để hiển thị trạng thái bãi xe (còn chỗ, gần đầy, hết chỗ) và hướng dẫn vị trí đỗ xe thay thế.  

3. Yêu cầu phi chức năng (Non-functional Requirements)

    Khả năng chịu tải: Hoạt động ổn định với số lượng người dùng lớn và truy cập đồng thời cao.  

    Tính linh hoạt/Chịu lỗi: Hoạt động được khi kết nối không liên tục, cảm biến hỏng hoặc gateway mất kết nối.  

    Bảo mật & Truy vết: Phân quyền dựa trên vai trò (RBAC). Mọi hoạt động và giao dịch phải được ghi nhật ký (log) để phục vụ kiểm tra và báo cáo.