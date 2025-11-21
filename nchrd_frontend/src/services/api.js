import axios from 'axios';

// رابط السيرفر الخاص بنا (تأكد أن الباك اند شغال على هذا الرابط)
const BASE_URL = 'http://127.0.0.1:8000/api/';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. اعتراض أي طلب لإضافة التوكن (Token) إذا كان موجوداً
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. اعتراض الاستجابة (لو التوكن انتهى، يخرج المستخدم)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // إذا انتهت الصلاحية، احذف التوكن ووجهه لصفحة الدخول
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;