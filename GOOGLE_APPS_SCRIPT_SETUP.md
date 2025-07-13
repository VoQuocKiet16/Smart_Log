# Hướng dẫn Setup Google Apps Script

## Vấn đề hiện tại
Server trả về HTML thay vì JSON với thông báo: "Không tìm thấy hàm tập lệnh: doGet"

## Nguyên nhân
1. Google Apps Script chưa được deploy đúng cách
2. URL deployment không đúng
3. Script chưa được publish

## Cách khắc phục

### Bước 1: Kiểm tra Google Apps Script
1. Mở [Google Apps Script](https://script.google.com/)
2. Tạo project mới hoặc mở project hiện có
3. Copy code sau vào file `Code.gs`:

```javascript
// Hàm chính xử lý các yêu cầu HTTP
function doGet(e) {
  try {
    // Kiểm tra API key
    if (e.parameter.apiKey !== 'x7k9p3m2q8w4z6t1') {
      return ContentService.createTextOutput(
        JSON.stringify({ error: 'API key không hợp lệ' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
    const data = sheet.getDataRange().getValues();
    return ContentService.createTextOutput(
      JSON.stringify({ values: data })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'Không thể lấy dữ liệu: ' + error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    // Kiểm tra API key
    if (e.parameter.apiKey !== 'x7k9p3m2q8w4z6t1') {
      return ContentService.createTextOutput(
        JSON.stringify({ error: 'API key không hợp lệ' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
    const data = JSON.parse(e.postData.contents).values[0];
    sheet.appendRow(data);
    return ContentService.createTextOutput(
      JSON.stringify({ message: 'Dữ liệu đã được thêm thành công', timestamp: data[0] })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'Không thể thêm dữ liệu: ' + error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPut(e) {
  try {
    // Kiểm tra API key
    if (e.parameter.apiKey !== 'x7k9p3m2q8w4z6t1') {
      return ContentService.createTextOutput(
        JSON.stringify({ error: 'API key không hợp lệ' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
    const data = JSON.parse(e.postData.contents);
    const timestamp = data.timestamp;
    const values = data.values;

    // Tìm hàng cần chỉnh sửa
    const dataRange = sheet.getDataRange();
    const dataValues = dataRange.getValues();
    let rowIndex = -1;

    for (let i = 1; i < dataValues.length; i++) {
      if (dataValues[i][0] === timestamp) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: 'Không tìm thấy bản ghi với timestamp: ' + timestamp })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Cập nhật hàng
    sheet.getRange(rowIndex, 1, 1, values.length).setValues([values]);
    return ContentService.createTextOutput(
      JSON.stringify({ message: 'Dữ liệu đã được cập nhật thành công' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'Không thể cập nhật dữ liệu: ' + error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doDelete(e) {
  try {
    // Kiểm tra API key
    if (e.parameter.apiKey !== 'x7k9p3m2q8w4z6t1') {
      return ContentService.createTextOutput(
        JSON.stringify({ error: 'API key không hợp lệ' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
    const timestamp = e.parameter.timestamp;

    // Tìm hàng cần xóa
    const dataRange = sheet.getDataRange();
    const dataValues = dataRange.getValues();
    let rowIndex = -1;

    for (let i = 1; i < dataValues.length; i++) {
      if (dataValues[i][0] === timestamp) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: 'Không tìm thấy bản ghi với timestamp: ' + timestamp })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Xóa hàng
    sheet.deleteRow(rowIndex);
    return ContentService.createTextOutput(
      JSON.stringify({ message: 'Dữ liệu đã được xóa thành công' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'Không thể xóa dữ liệu: ' + error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Bước 2: Tạo Google Sheet
1. Tạo Google Sheet mới
2. Đặt tên sheet đầu tiên là "Sheet1"
3. Thêm header row:
```
Timestamp | Class | ClassSize | Absences | Rating1 | Rating2 | Rating3 | Rating4 | Rating5 | TeacherStatus1 | TeacherStatus2 | TeacherStatus3 | TeacherStatus4 | TeacherStatus5 | TeacherAbsenceReason1 | TeacherAbsenceReason2 | TeacherAbsenceReason3 | TeacherAbsenceReason4 | TeacherAbsenceReason5
```

### Bước 3: Link Google Sheet với Apps Script
1. Trong Apps Script, click "Resources" > "Advanced Google services"
2. Enable Google Sheets API
3. Trong code, thay đổi:
```javascript
const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
```
thành:
```javascript
const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getSheetByName('Sheet1');
```
(Thay YOUR_SHEET_ID bằng ID của Google Sheet)

### Bước 4: Deploy Script
1. Click "Deploy" > "New deployment"
2. Chọn "Web app"
3. Set:
   - Execute as: "Me"
   - Who has access: "Anyone"
4. Click "Deploy"
5. Copy URL deployment mới

### Bước 5: Cập nhật URL trong app
Thay đổi `API_BASE_URL` trong `app/services/api.ts`:
```javascript
const API_BASE_URL = 'YOUR_NEW_DEPLOYMENT_URL';
```

### Bước 6: Test API
Mở browser và truy cập:
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?apiKey=x7k9p3m2q8w4z6t1
```

Nếu thấy JSON response thì đã thành công!

## Troubleshooting

### Lỗi "Không tìm thấy hàm tập lệnh: doGet"
- Kiểm tra tên hàm có đúng là `doGet` không
- Đảm bảo script đã được deploy
- Kiểm tra URL deployment có đúng không

### Lỗi "Spreadsheet not found"
- Kiểm tra Sheet ID có đúng không
- Đảm bảo script có quyền truy cập Sheet
- Share Sheet với email của script

### Lỗi "API key không hợp lệ"
- Kiểm tra API key có đúng không
- Đảm bảo API key được gửi trong parameter 