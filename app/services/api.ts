// API service cho Google Apps Script
// const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbzG92AlrxB29UGKizp7bMhwed9gXuYWq0ILYQSRhCnFsRg-v22oKNoCkv5FCK7eJfgpPA/exec';
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbwFgeXDJniaPOTNHbHyveB055wMTw8P-ZfxUtRC39JU7m-cRjQfTGi-JjCX18WvLyLElQ/exec'
const API_KEY = 'abc123xyz789';

// Cấu hình cho production build
const API_CONFIG = {
  timeout: 10000, // 10 giây timeout
  retryAttempts: 3,
  retryDelay: 1000, // 1 giây
};

export interface TeacherReportData {
  timestamp: string;
  className: string;
  classSize: number;
  absences: number;
  ratings: string[];
  teacherStatus: string[];
  teacherAbsenceReason: string[];
}

export interface ApiResponse {
  values: any[][];
  error?: string;
}

// Hàm retry cho API calls
const retryFetch = async (url: string, options: RequestInit, retries: number = API_CONFIG.retryAttempts): Promise<Response> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (retries > 0 && (error instanceof TypeError || (error as any).name === 'AbortError')) {
      console.log(`Retry attempt ${API_CONFIG.retryAttempts - retries + 1}/${API_CONFIG.retryAttempts}`);
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
      return retryFetch(url, options, retries - 1);
    }
    throw error;
  }
};

export const apiService = {
  // Lấy tất cả dữ liệu từ Google Sheet
  async getTeacherReports(): Promise<TeacherReportData[]> {
    try {
      console.log('Đang gọi API GET:', API_BASE_URL);
      
      const url = `${API_BASE_URL}?apiKey=${encodeURIComponent(API_KEY)}`;
      const response = await retryFetch(url, { method: 'GET' });
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log('Response text:', responseText.substring(0, 200) + '...');
      
      // Kiểm tra xem response có phải là HTML không
      if (responseText.trim().startsWith('<!DOCTYPE html>') || responseText.includes('<html>')) {
        console.error('Server trả về HTML thay vì JSON');
        throw new Error('Server không hoạt động đúng cách. Vui lòng kiểm tra lại Google Apps Script deployment.');
      }
      
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response text:', responseText);
        throw new Error(`Không thể parse JSON từ server: ${responseText.substring(0, 100)}`);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.values || !Array.isArray(data.values)) {
        console.log('No data values found, returning empty array');
        return [];
      }

      // Bỏ qua hàng đầu tiên (header)
      const rows = data.values.slice(1);
      console.log('Found rows:', rows.length);
      
      return rows.map((row: any[], index: number) => {
        console.log(`Processing row ${index}:`, row);
        return {
          timestamp: row[0] || '',
          className: row[1] || '',
          classSize: parseInt(row[2]) || 0,
          absences: parseInt(row[3]) || 0,
          ratings: [
            row[4] || '', // Rating1
            row[5] || '', // Rating2
            row[6] || '', // Rating3
            row[7] || '', // Rating4
            row[8] || '', // Rating5
          ],
          teacherStatus: [
            row[9] || '', // TeacherStatus1
            row[10] || '', // TeacherStatus2
            row[11] || '', // TeacherStatus3
            row[12] || '', // TeacherStatus4
            row[13] || '', // TeacherStatus5
          ],
          teacherAbsenceReason: [
            row[14] || '', // TeacherAbsenceReason1
            row[15] || '', // TeacherAbsenceReason2
            row[16] || '', // TeacherAbsenceReason3
            row[17] || '', // TeacherAbsenceReason4
            row[18] || '', // TeacherAbsenceReason5
          ],
        };
      });
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      throw error;
    }
  },

  // Thêm dữ liệu mới
  async addTeacherReport(data: Omit<TeacherReportData, 'timestamp'>): Promise<any> {
    try {
      console.log('Đang gọi API POST với dữ liệu:', data);
      
      const payload = {
        values: [
          [
            new Date().toISOString(), // timestamp
            data.className,
            data.classSize,
            data.absences,
            ...data.ratings, // Rating1-5
            ...data.teacherStatus, // TeacherStatus1-5
            ...data.teacherAbsenceReason, // TeacherAbsenceReason1-5
          ]
        ]
      };

      console.log('Payload:', JSON.stringify(payload, null, 2));

      const url = `${API_BASE_URL}?apiKey=${encodeURIComponent(API_KEY)}`;
      const response = await retryFetch(url, { method: 'POST', body: JSON.stringify(payload) });

      console.log('POST Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('POST Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('POST Response text:', responseText);
      
      // Kiểm tra xem response có phải là HTML không
      if (responseText.trim().startsWith('<!DOCTYPE html>') || responseText.includes('<html>')) {
        console.error('Server trả về HTML thay vì JSON');
        throw new Error('Server không hoạt động đúng cách. Vui lòng kiểm tra lại Google Apps Script deployment.');
      }
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('POST JSON Parse Error:', parseError);
        console.error('POST Response text:', responseText);
        throw new Error(`Không thể parse JSON từ server: ${responseText.substring(0, 100)}`);
      }
    } catch (error) {
      console.error('Lỗi khi thêm dữ liệu:', error);
      throw error;
    }
  },

  // Cập nhật dữ liệu
  async updateTeacherReport(timestamp: string, data: Omit<TeacherReportData, 'timestamp'>): Promise<any> {
    try {
      console.log('Đang gọi API PUT với timestamp:', timestamp);
      
      const payload = {
        timestamp,
        values: [
          data.className,
          data.classSize,
          data.absences,
          ...data.ratings, // Rating1-5
          ...data.teacherStatus, // TeacherStatus1-5
          ...data.teacherAbsenceReason, // TeacherAbsenceReason1-5
        ]
      };

      const url = `${API_BASE_URL}?apiKey=${encodeURIComponent(API_KEY)}`;
      const response = await retryFetch(url, { method: 'PUT', body: JSON.stringify(payload) });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const responseText = await response.text();
      
      // Kiểm tra xem response có phải là HTML không
      if (responseText.trim().startsWith('<!DOCTYPE html>') || responseText.includes('<html>')) {
        throw new Error('Server không hoạt động đúng cách. Vui lòng kiểm tra lại Google Apps Script deployment.');
      }
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Không thể parse JSON từ server: ${responseText.substring(0, 100)}`);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật dữ liệu:', error);
      throw error;
    }
  },

  // Xóa dữ liệu
  async deleteTeacherReport(timestamp: string): Promise<any> {
    try {
      console.log('Đang gọi API DELETE với timestamp:', timestamp);
      
      const url = `${API_BASE_URL}?apiKey=${encodeURIComponent(API_KEY)}&timestamp=${encodeURIComponent(timestamp)}`;
      const response = await retryFetch(url, { method: 'DELETE' });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const responseText = await response.text();
      
      // Kiểm tra xem response có phải là HTML không
      if (responseText.trim().startsWith('<!DOCTYPE html>') || responseText.includes('<html>')) {
        throw new Error('Server không hoạt động đúng cách. Vui lòng kiểm tra lại Google Apps Script deployment.');
      }
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Không thể parse JSON từ server: ${responseText.substring(0, 100)}`);
      }
    } catch (error) {
      console.error('Lỗi khi xóa dữ liệu:', error);
      throw error;
    }
  },
}; 

export default apiService; 