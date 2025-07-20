# Software Requirement Specification (SRS)
## Hệ Thống Quản Lý Dịch Vụ Xét Nghiệm ADN Huyết Thống

**Phiên bản:** 1.0  
**Ngày:** 20/07/2025  
**Dự án:** WDP392 - Bloodline DNA Testing Service Management System

---

## 1. GIỚI THIỆU

### 1.1 Mục đích tài liệu
Tài liệu này mô tả chi tiết các yêu cầu chức năng và phi chức năng cho hệ thống quản lý dịch vụ xét nghiệm ADN huyết thống của một cơ sở y tế.

### 1.2 Phạm vi dự án
Hệ thống quản lý toàn bộ quy trình xét nghiệm ADN từ đặt lịch hẹn, thu thập mẫu, thực hiện xét nghiệm đến trả kết quả, bao gồm cả xét nghiệm dân sự và hành chính.

### 1.3 Đối tượng sử dụng
- **Khách hàng**: Đặt dịch vụ, theo dõi tiến trình, xem kết quả
- **Nhân viên y tế**: Thu thập mẫu, quản lý quy trình
- **Kỹ thuật viên phòng thí nghiệm**: Thực hiện xét nghiệm
- **Quản trị viên**: Quản lý hệ thống, dịch vụ, báo cáo

---

## 2. MÔ TẢ TỔNG QUAN HỆ THỐNG

### 2.1 Mô tả chung
Hệ thống quản lý dịch vụ xét nghiệm ADN huyết thống hỗ trợ hai loại dịch vụ chính:
- **Xét nghiệm ADN dân sự**: Cho phép tự thu mẫu tại nhà
- **Xét nghiệm ADN hành chính**: Yêu cầu thu mẫu tại cơ sở y tế

### 2.2 Kiến trúc hệ thống
- **Backend**: Node.js + Express.js + MongoDB
- **Ngôn ngữ**: TypeScript (71.3%), JavaScript (28.3%)
- **API Documentation**: Swagger/OpenAPI
- **Authentication**: JWT Bearer Token

---

## 3. YÊU CẦU CHỨC NĂNG

### 3.1 Quản lý Người dùng và Phân quyền

#### 3.1.1 Đăng ký và Xác thực
- **FR-001**: Hệ thống cho phép người dùng đăng ký tài khoản mới
- **FR-002**: Hệ thống hỗ trợ đăng nhập bằng email/số điện thoại và mật khẩu
- **FR-003**: Hệ thống hỗ trợ xác thực 2 lớp (2FA)
- **FR-004**: Hệ thống có chức năng quên mật khẩu và đặt lại mật khẩu

#### 3.1.2 Phân quyền người dùng
- **FR-005**: Hệ thống phân quyền 4 vai trò chính:
  - Customer (Khách hàng)
  - Staff (Nhân viên y tế) 
  - Laboratory Technician (Kỹ thuật viên phòng thí nghiệm)
  - Admin/Manager (Quản trị viên)

### 3.2 Quản lý Dịch vụ

#### 3.2.1 Khai báo dịch vụ
- **FR-006**: Quản trị viên có thể tạo, sửa, xóa các dịch vụ xét nghiệm ADN
- **FR-007**: Hệ thống phân loại dịch vụ: Civil (Dân sự) và Administrative (Hành chính)
- **FR-008**: Mỗi dịch vụ bao gồm: tên, mô tả, giá cả, thời gian thực hiện
- **FR-009**: Hệ thống hỗ trợ upload hình ảnh cho dịch vụ

#### 3.2.2 Bảng giá và khuyến mãi
- **FR-010**: Quản trị viên có thể thiết lập bảng giá linh hoạt
- **FR-011**: Hệ thống hỗ trợ tạo mã giảm giá và chương trình khuyến mãi

### 3.3 Quản lý Lịch hẹn

#### 3.3.1 Đặt lịch hẹn
- **FR-012**: Khách hàng có thể đặt lịch hẹn xét nghiệm trực tuyến
- **FR-013**: Hệ thống hiển thị lịch trống và cho phép chọn ngày giờ phù hợp
- **FR-014**: Khách hàng chọn loại dịch vụ và phương thức thu mẫu:
  - Tự thu mẫu tại nhà (chỉ dành cho dịch vụ dân sự)
  - Thu mẫu tại cơ sở y tế
  - Thu mẫu tại nhà bởi nhân viên

#### 3.3.2 Quản lý lịch hẹn
- **FR-015**: Nhân viên có thể xác nhận, hủy hoặc thay đổi lịch hẹn
- **FR-016**: Hệ thống gửi thông báo email/SMS khi có thay đổi lịch hẹn
- **FR-017**: Theo dõi trạng thái lịch hẹn: Pending → Confirmed → Sample Collected → Testing → Completed

### 3.4 Quản lý Thanh toán

#### 3.4.1 Xử lý thanh toán
- **FR-018**: Hệ thống tích hợp nhiều phương thức thanh toán
- **FR-019**: Khách hàng chỉ có thể bắt đầu quy trình xét nghiệm khi đã thanh toán
- **FR-020**: Hệ thống tạo hóa đơn điện tử và gửi qua email

### 3.5 Quản lý Kit và Mẫu

#### 3.5.1 Quản lý Kit xét nghiệm
- **FR-021**: Hệ thống quản lý kho kit xét nghiệm với các trạng thái: Available → Assigned → Used
- **FR-022**: Mỗi kit có mã định danh duy nhất để theo dõi
- **FR-023**: Hệ thống cảnh báo khi số lượng kit sắp hết

#### 3.5.2 Quy trình thu mẫu tự phục vụ (Self-collection)
- **FR-024**: Hệ thống gửi kit xét nghiệm đến địa chỉ khách hàng
- **FR-025**: Khách hàng có thể cập nhật trạng thái "đã thu mẫu" và ngày thu mẫu
- **FR-026**: Hệ thống hướng dẫn khách hàng cách thu mẫu đúng cách
- **FR-027**: Khách hàng gửi mẫu về phòng thí nghiệm theo hướng dẫn

#### 3.5.3 Quy trình thu mẫu tại cơ sở
- **FR-028**: Nhân viên y tế thu mẫu trực tiếp tại cơ sở hoặc tại nhà khách hàng
- **FR-029**: Hệ thống cho phép ghi nhận thông tin chi tiết của từng mẫu
- **FR-030**: Mỗi mẫu bao gồm: loại mẫu (saliva, blood, hair), thông tin người cung cấp mẫu

#### 3.5.4 Quản lý mẫu trong phòng thí nghiệm
- **FR-031**: Nhân viên xác nhận đã nhận mẫu từ khách hàng
- **FR-032**: Hệ thống theo dõi trạng thái mẫu: Pending → Submitted → Received → Testing → Completed
- **FR-033**: Kỹ thuật viên có thể tìm kiếm mẫu theo nhiều tiêu chí

### 3.6 Quy trình Xét nghiệm

#### 3.6.1 Bắt đầu xét nghiệm
- **FR-034**: Kỹ thuật viên phòng thí nghiệm khởi tạo quy trình xét nghiệm
- **FR-035**: Hệ thống kiểm tra điều kiện trước khi bắt đầu:
  - Lịch hẹn đã được thanh toán
  - Mẫu đã được nhận và xác nhận
- **FR-036**: Hệ thống hỗ trợ xử lý batch (nhiều mẫu cùng lúc)

#### 3.6.2 Ghi nhận kết quả
- **FR-037**: Kỹ thuật viên nhập kết quả xét nghiệm vào hệ thống
- **FR-038**: Kết quả bao gồm:
  - Kết quả khớp/không khớp (is_match: boolean)
  - Dữ liệu chi tiết: tỷ lệ phần trăm khớp, độ tin cậy, số marker đã test
  - Khoảng tin cậy và mức độ tin cậy

#### 3.6.3 Tạo báo cáo
- **FR-039**: Hệ thống tự động tạo báo cáo PDF chi tiết
- **FR-040**: Báo cáo lưu trữ trên cloud storage với URL an toàn
- **FR-041**: Hệ thống tạo lại báo cáo khi có thay đổi kết quả

### 3.7 Quản lý Kết quả

#### 3.7.1 Truy xuất kết quả
- **FR-042**: Khách hàng xem kết quả xét nghiệm trên hệ thống
- **FR-043**: Hệ thống hiển thị kết quả dưới dạng dễ hiểu
- **FR-044**: Khách hàng có thể tải báo cáo PDF chi tiết

#### 3.7.2 Thông báo kết quả
- **FR-045**: Hệ thống gửi email thông báo khi kết quả sẵn sàng
- **FR-046**: Hệ thống gửi thông báo khi có cập nhật kết quả

### 3.8 Quản lý Vụ việc Hành chính

#### 3.8.1 Xử lý vụ việc hành chính
- **FR-047**: Hệ thống quản lý các vụ việc xét nghiệm ADN hành chính
- **FR-048**: Mỗi vụ việc có:
  - Số vụ việc (case_number) do cơ quan chính phủ cấp
  - Mã phê duyệt (approval_code) từ cơ quan có thẩm quyền
- **FR-049**: Xét nghiệm hành chính bắt buộc thu mẫu tại cơ sở y tế

### 3.9 Trang chủ và Nội dung

#### 3.9.1 Trang chủ
- **FR-050**: Trang chủ giới thiệu cơ sở y tế và dịch vụ
- **FR-051**: Hiển thị danh sách dịch vụ xét nghiệm ADN (dân sự, hành chính)
- **FR-052**: Tích hợp blog chia sẻ kiến thức ADN và hướng dẫn xét nghiệm

### 3.10 Quản lý Đánh giá và Phản hồi

#### 3.10.1 Hệ thống đánh giá
- **FR-053**: Khách hàng có thể đánh giá dịch vụ (rating)
- **FR-054**: Khách hàng có thể để lại feedback chi tiết
- **FR-055**: Quản trị viên có thể xem và quản lý các đánh giá

### 3.11 Quản lý Hồ sơ và Lịch sử

#### 3.11.1 Hồ sơ người dùng
- **FR-056**: Khách hàng quản lý thông tin cá nhân
- **FR-057**: Khách hàng xem lịch sử đặt xét nghiệm
- **FR-058**: Hệ thống lưu trữ toàn bộ lịch sử giao dịch

### 3.12 Dashboard và Báo cáo

#### 3.12.1 Dashboard quản trị
- **FR-059**: Dashboard hiển thị thống kê tổng quan:
  - Số lượng lịch hẹn theo trạng thái
  - Doanh thu theo thời gian
  - Số lượng xét nghiệm hoàn thành
- **FR-060**: Biểu đồ phân tích xu hướng và hiệu suất

#### 3.12.2 Báo cáo chi tiết
- **FR-061**: Tạo báo cáo theo nhiều tiêu chí (thời gian, dịch vụ, khách hàng)
- **FR-062**: Xuất báo cáo dưới nhiều định dạng (PDF, Excel)

---

## 4. YÊU CẦU PHI CHỨC NĂNG

### 4.1 Hiệu suất (Performance)
- **NFR-001**: Thời gian phản hồi API < 2 giây cho 95% requests
- **NFR-002**: Hệ thống hỗ trợ tối thiểu 1000 người dùng đồng thời
- **NFR-003**: Thời gian tải trang < 3 giây

### 4.2 Bảo mật (Security)
- **NFR-004**: Mã hóa dữ liệu nhạy cảm bằng AES-256
- **NFR-005**: Sử dụng HTTPS cho tất cả giao tiếp
- **NFR-006**: Xác thực và phân quyền nghiêm ngặt
- **NFR-007**: Audit log cho tất cả hoạt động quan trọng
- **NFR-008**: Tuân thủ quy định bảo mật dữ liệu y tế

### 4.3 Độ tin cậy (Reliability)
- **NFR-009**: Uptime 99.9% trong giờ hành chính
- **NFR-010**: Backup dữ liệu hàng ngày
- **NFR-011**: Recovery time < 4 giờ khi có sự cố

### 4.4 Khả năng mở rộng (Scalability)
- **NFR-012**: Kiến trúc microservices cho khả năng mở rộng
- **NFR-013**: Database sharding khi cần thiết
- **NFR-014**: Load balancing cho traffic cao

### 4.5 Khả năng sử dụng (Usability)
- **NFR-015**: Giao diện người dùng thân thiện và trực quan
- **NFR-016**: Responsive design cho mobile và desktop
- **NFR-017**: Hỗ trợ đa ngôn ngữ (Tiếng Việt, Tiếng Anh)

### 4.6 Khả năng tương thích (Compatibility)
- **NFR-018**: Tương thích với các trình duyệt chính
- **NFR-019**: API RESTful chuẩn cho tích hợp bên thứ 3
- **NFR-020**: Hỗ trợ mobile apps (iOS/Android)

---

## 5. QUY TRÌNH NGHIỆP VỤ

### 5.1 Quy trình Xét nghiệm Dân sự (Tự thu mẫu)
```
Đăng ký đặt hẹn → Thanh toán → Nhận kit xét nghiệm → 
Thu thập mẫu tại nhà → Gửi mẫu về phòng thí nghiệm → 
Xét nghiệm và ghi nhận kết quả → Trả kết quả
```

### 5.2 Quy trình Xét nghiệm tại Cơ sở
```
Đăng ký đặt hẹn → Thanh toán → Nhân viên thu mẫu 
(tại cơ sở hoặc tại nhà) → Xét nghiệm và ghi nhận kết quả → 
Trả kết quả
```

### 5.3 Trạng thái Lịch hẹn
- **PENDING**: Chờ xác nhận
- **CONFIRMED**: Đã xác nhận
- **SAMPLE_ASSIGNED**: Đã gán kit/mẫu
- **SAMPLE_COLLECTED**: Đã thu mẫu
- **TESTING**: Đang xét nghiệm
- **COMPLETED**: Hoàn thành
- **CANCELLED**: Đã hủy

### 5.4 Trạng thái Mẫu
- **PENDING**: Chờ thu mẫu
- **SUBMITTED**: Đã gửi mẫu (khách hàng)
- **RECEIVED**: Đã nhận mẫu (phòng thí nghiệm)
- **TESTING**: Đang xét nghiệm
- **COMPLETED**: Hoàn thành xét nghiệm

---

## 6. GIAO DIỆN VÀ TÍCH HỢP

### 6.1 API Endpoints chính
- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Services**: `/api/service/*`
- **Appointments**: `/api/appointment/*`
- **Samples**: `/api/sample/*`
- **Results**: `/api/result/*`
- **Administrative Cases**: `/api/administrative-cases/*`

### 6.2 Tích hợp bên thứ 3
- **Payment Gateway**: Tích hợp cổng thanh toán
- **Email Service**: Gửi thông báo và báo cáo
- **SMS Service**: Thông báo khẩn cấp
- **Cloud Storage**: Lưu trữ báo cáo PDF
- **Shipping Service**: Gửi kit xét nghiệm

---

## 7. DỮ LIỆU VÀ LƯU TRỮ

### 7.1 Cơ sở dữ liệu chính
- **MongoDB**: Lưu trữ dữ liệu chính
- **Collections chính**:
  - Users, Services, Appointments
  - Samples, Results, Administrative Cases
  - Payments, Reviews, Logs

### 7.2 Backup và Recovery
- **Daily backup**: Sao lưu hàng ngày
- **Point-in-time recovery**: Khôi phục theo thời điểm
- **Geographic redundancy**: Sao lưu đa vùng địa lý

---

## 8. BẢO TRÌ VÀ HỖ TRỢ

### 8.1 Monitoring
- **System monitoring**: Giám sát hệ thống 24/7
- **Application monitoring**: Theo dõi hiệu suất ứng dụng
- **Error tracking**: Theo dõi và xử lý lỗi

### 8.2 Cập nhật và Bảo trì
- **Regular updates**: Cập nhật định kỳ
- **Security patches**: Vá lỗi bảo mật kịp thời
- **Feature releases**: Phát hành tính năng mới

---

## 9. KẾT LUẬN

Hệ thống quản lý dịch vụ xét nghiệm ADN huyết thống được thiết kế để đáp ứng đầy đủ nhu cầu quản lý quy trình xét nghiệm từ A-Z, đảm bảo tính chính xác, bảo mật và trải nghiệm người dùng tốt nhất. Với kiến trúc linh hoạt và khả năng mở rộng cao, hệ thống có thể thích ứng với sự phát triển của cơ sở y tế trong tương lai.

---

**Người lập:** Dan Huy
**Ngày lập:** 20/07/2025  
**Phiên bản:** 1.0