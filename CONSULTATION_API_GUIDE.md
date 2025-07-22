# Hướng Dẫn API Đăng Ký Tư Vấn (Consultation API)

## Tổng Quan

Tính năng đăng ký tư vấn cho phép khách hàng yêu cầu tư vấn từ các chuyên gia mà không cần đăng ký tài khoản trước. Hệ thống sẽ quản lý toàn bộ quy trình từ yêu cầu đến hoàn thành tư vấn.

## Luồng Hoạt Động

1. **Khách hàng gửi yêu cầu tư vấn** (không cần đăng ký)
2. **Hệ thống gửi email xác nhận** cho khách hàng
3. **Admin/Manager nhận thông báo** và gán chuyên gia tư vấn
4. **Chuyên gia tư vấn** liên hệ và lập lịch tư vấn
5. **Thực hiện tư vấn** và cập nhật trạng thái
6. **Hoàn thành** hoặc lên lịch tư vấn tiếp theo nếu cần

## API Endpoints

### 1. Tạo Yêu Cầu Tư Vấn (Public - Không cần đăng nhập)

```http
POST /api/appointment/consultation
Content-Type: application/json

{
  "first_name": "Nguyễn",
  "last_name": "Văn A",
  "email": "nguyenvana@example.com",
  "phone_number": "0901234567",
  "type": "HOME", // hoặc "FACILITY"
  "collection_address": "123 Đường ABC, Quận 1, TP.HCM", // bắt buộc nếu type = "HOME"
  "subject": "Tư vấn về xét nghiệm DNA dòng họ",
  "consultation_notes": "Tôi muốn tìm hiểu về dịch vụ xét nghiệm DNA...",
  "preferred_date": "2024-02-15",
  "preferred_time": "9:00 AM - 11:00 AM"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Consultation request created successfully",
  "data": {
    "_id": "consultation_id",
    "first_name": "Nguyễn",
    "last_name": "Văn A",
    "email": "nguyenvana@example.com",
    "consultation_status": "REQUESTED",
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

### 2. Lấy Danh Sách Yêu Cầu Tư Vấn (Admin/Manager/Staff)

```http
GET /api/appointment/consultation?pageNum=1&pageSize=10&consultation_status=REQUESTED
Authorization: Bearer <token>
```

**Query Parameters:**
- `pageNum`: Số trang (mặc định: 1)
- `pageSize`: Số lượng item per page (mặc định: 10)
- `consultation_status`: Lọc theo trạng thái (REQUESTED, ASSIGNED, SCHEDULED, etc.)
- `type`: Lọc theo loại (HOME, FACILITY)
- `search_term`: Tìm kiếm theo tên, email, hoặc chủ đề
- `start_date`, `end_date`: Lọc theo khoảng thời gian

### 3. Lấy Chi Tiết Yêu Cầu Tư Vấn

```http
GET /api/appointment/consultation/:id
Authorization: Bearer <token>
```

### 4. Gán Chuyên Gia Tư Vấn (Admin/Manager)

```http
PATCH /api/appointment/consultation/:id/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "consultant_id": "staff_user_id"
}
```

### 5. Cập Nhật Trạng Thái Tư Vấn

```http
PATCH /api/appointment/consultation/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "SCHEDULED",
  "appointment_date": "2024-02-15T10:00:00.000Z",
  "meeting_link": "https://meet.google.com/abc-def-ghi",
  "meeting_notes": "Ghi chú về cuộc họp",
  "follow_up_required": true,
  "follow_up_date": "2024-02-22T10:00:00.000Z"
}
```

## Trạng Thái Tư Vấn

| Trạng Thái | Mô Tả |
|-----------|--------|
| `REQUESTED` | Yêu cầu mới được tạo |
| `ASSIGNED` | Đã gán chuyên gia tư vấn |
| `SCHEDULED` | Đã lên lịch tư vấn |
| `IN_PROGRESS` | Đang thực hiện tư vấn |
| `COMPLETED` | Hoàn thành tư vấn |
| `CANCELLED` | Đã hủy |
| `FOLLOW_UP_REQUIRED` | Cần tư vấn tiếp theo |

## Validation Rules

### CreateConsultationDto
- `first_name`: Bắt buộc, 2-50 ký tự
- `last_name`: Bắt buộc, 2-50 ký tự
- `email`: Bắt buộc, định dạng email hợp lệ
- `phone_number`: Bắt buộc, 10-15 ký tự
- `type`: Bắt buộc, HOME hoặc FACILITY
- `collection_address`: Bắt buộc nếu type = HOME, tối đa 500 ký tự
- `subject`: Bắt buộc, 5-200 ký tự
- `consultation_notes`: Tùy chọn, tối đa 1000 ký tự
- `preferred_time`: Tùy chọn, tối đa 200 ký tự

## Phân Quyền

| Role | Quyền |
|------|--------|
| Public | Tạo yêu cầu tư vấn |
| ADMIN | Tất cả quyền |
| MANAGER | Xem, gán chuyên gia, cập nhật trạng thái |
| STAFF | Xem yêu cầu được gán, cập nhật trạng thái |
| CUSTOMER | Không có quyền (vì không cần đăng ký) |

## Email Notifications

### 1. Email Xác Nhận cho Khách Hàng
- Gửi ngay sau khi tạo yêu cầu
- Chứa thông tin yêu cầu và Reference ID

### 2. Email Thông Báo cho Staff
- Gửi đến Admin và Manager khi có yêu cầu mới
- Chứa thông tin khách hàng và yêu cầu

### 3. Email Gán Chuyên Gia
- Gửi cho khách hàng khi được gán chuyên gia
- Chứa thông tin chuyên gia

### 4. Email Cập Nhật Trạng Thái
- Gửi khi trạng thái thay đổi
- Nội dung tùy theo trạng thái mới

## Logging

Hệ thống tự động ghi log các hoạt động:
- Tạo yêu cầu tư vấn
- Gán chuyên gia
- Thay đổi trạng thái

## Database Collections

### consultations
```javascript
{
  _id: ObjectId,
  first_name: String,
  last_name: String,
  email: String,
  phone_number: String,
  type: String, // HOME, FACILITY
  collection_address: String,
  subject: String,
  consultation_notes: String,
  preferred_date: Date,
  preferred_time: String,
  consultation_status: String,
  assigned_consultant_id: ObjectId,
  meeting_link: String,
  meeting_notes: String,
  follow_up_required: Boolean,
  follow_up_date: Date,
  appointment_date: Date,
  created_at: Date,
  updated_at: Date
}
```

## Ví Dụ Sử Dụng

### Frontend Form cho Khách Hàng
```html
<form id="consultationForm">
  <input name="first_name" placeholder="Họ" required>
  <input name="last_name" placeholder="Tên" required>
  <input name="email" type="email" placeholder="Email" required>
  <input name="phone_number" placeholder="Số điện thoại" required>
  <select name="type" required>
    <option value="FACILITY">Tại cơ sở</option>
    <option value="HOME">Tại nhà</option>
  </select>
  <textarea name="collection_address" placeholder="Địa chỉ (nếu chọn tại nhà)"></textarea>
  <input name="subject" placeholder="Chủ đề tư vấn" required>
  <textarea name="consultation_notes" placeholder="Ghi chú thêm"></textarea>
  <input name="preferred_date" type="date">
  <input name="preferred_time" placeholder="Giờ mong muốn">
  <button type="submit">Gửi Yêu Cầu Tư Vấn</button>
</form>
```

### JavaScript Submit
```javascript
document.getElementById('consultationForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  try {
    const response = await fetch('/api/appointment/consultation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    if (result.status === 'success') {
      alert('Yêu cầu tư vấn đã được gửi thành công!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});
```

## Lưu Ý Quan Trọng

1. **Không cần Authentication** cho endpoint tạo yêu cầu tư vấn
2. **Validation nghiêm ngặt** để đảm bảo data quality
3. **Email notifications** tự động cho tất cả stakeholders
4. **Logging đầy đủ** để tracking và audit
5. **Phân quyền rõ ràng** theo role
6. **Support cả HOME và FACILITY** consultation
7. **Follow-up mechanism** cho consultation phức tạp 