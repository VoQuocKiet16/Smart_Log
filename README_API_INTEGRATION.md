# Hướng dẫn tích hợp API Google Apps Script

## Cấu trúc dữ liệu

### Google Sheet Structure
```
Timestamp | Class | ClassSize | Absences | Rating1 | Rating2 | Rating3 | Rating4 | Rating5 | TeacherStatus1 | TeacherStatus2 | TeacherStatus3 | TeacherStatus4 | TeacherStatus5 | TeacherAbsenceReason1 | TeacherAbsenceReason2 | TeacherAbsenceReason3 | TeacherAbsenceReason4 | TeacherAbsenceReason5
```

### API Endpoints

#### GET - Lấy dữ liệu
```
GET https://script.google.com/macros/s/AKfycbwJuKAC_nj3SVgG9bk0mnyw8-yzr1QqmMntdSYaVTsHyccue5lwOuEhs6S71kwugSxt-A/exec
```

#### POST - Thêm dữ liệu
```
POST https://script.google.com/macros/s/AKfycbwJuKAC_nj3SVgG9bk0mnyw8-yzr1QqmMntdSYaVTsHyccue5lwOuEhs6S71kwugSxt-A/exec
Content-Type: application/json

{
  "values": [
    [
      "2024-01-15T10:30:00.000Z", // timestamp
      "10A1", // className
      40, // classSize
      2, // absences
      "Tốt", // Rating1
      "Tốt", // Rating2
      "Khá", // Rating3
      "Tốt", // Rating4
      "Trung bình", // Rating5
      "Vắng mặt", // TeacherStatus1
      "Có mặt", // TeacherStatus2
      "Có mặt", // TeacherStatus3
      "Có mặt", // TeacherStatus4
      "Có mặt", // TeacherStatus5
      "Bệnh", // TeacherAbsenceReason1
      "", // TeacherAbsenceReason2
      "", // TeacherAbsenceReason3
      "", // TeacherAbsenceReason4
      "" // TeacherAbsenceReason5
    ]
  ]
}
```

#### PUT - Cập nhật dữ liệu
```
PUT https://script.google.com/macros/s/AKfycbwJuKAC_nj3SVgG9bk0mnyw8-yzr1QqmMntdSYaVTsHyccue5lwOuEhs6S71kwugSxt-A/exec
Content-Type: application/json

{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "values": [
    "10A1", // className
    40, // classSize
    2, // absences
    "Tốt", // Rating1
    "Tốt", // Rating2
    "Khá", // Rating3
    "Tốt", // Rating4
    "Trung bình", // Rating5
    "Vắng mặt", // TeacherStatus1
    "Có mặt", // TeacherStatus2
    "Có mặt", // TeacherStatus3
    "Có mặt", // TeacherStatus4
    "Có mặt", // TeacherStatus5
    "Bệnh", // TeacherAbsenceReason1
    "", // TeacherAbsenceReason2
    "", // TeacherAbsenceReason3
    "", // TeacherAbsenceReason4
    "" // TeacherAbsenceReason5
  ]
}
```

#### DELETE - Xóa dữ liệu
```
DELETE https://script.google.com/macros/s/AKfycbwJuKAC_nj3SVgG9bk0mnyw8-yzr1QqmMntdSYaVTsHyccue5lwOuEhs6S71kwugSxt-A/exec?timestamp=2024-01-15T10:30:00.000Z
```

## Tính năng đã tích hợp

### 1. Tải dữ liệu từ Google Sheet
- Tự động tải dữ liệu khi mở ứng dụng
- Hiển thị loading indicator trong khi tải
- Xử lý lỗi và hiển thị thông báo

### 2. Kết hợp dữ liệu
- Dữ liệu học sinh: Giữ nguyên (sẽ có API riêng sau)
- Dữ liệu giám thị: Lấy từ Google Sheet
- Fallback về dữ liệu mẫu nếu không tìm thấy

### 3. Giao diện người dùng
- Nút "Làm mới" để tải lại dữ liệu
- Hiển thị trạng thái loading và error
- Giao diện responsive và thân thiện

## Cấu trúc file

```
app/
├── services/
│   └── api.ts          # API service
├── index.tsx           # Màn hình chính
└── teacher-input.tsx   # Màn hình nhập liệu giám thị
```

## Lưu ý

1. **API Key**: Hiện tại API key được hardcode trong Google Apps Script
2. **Bảo mật**: GET request không cần API key (có thể cần cải thiện)
3. **Rate Limiting**: Chưa có giới hạn request
4. **Validation**: Cần thêm validation cho dữ liệu đầu vào

## Cải thiện đề xuất

1. Thêm API key cho GET request
2. Thêm validation cho dữ liệu
3. Thêm retry mechanism
4. Thêm caching để giảm request
5. Thêm offline support 