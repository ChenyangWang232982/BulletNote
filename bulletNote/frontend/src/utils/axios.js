import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 5000,
    withCredentials: true,
    headers: {
    'Content-Type': 'application/json'
   }
});

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

api.interceptors.response.use(
    (response) => {
        return response.data; // 原有逻辑不变
    },
    (error) => {
        // 核心修复1：过滤AbortError（取消请求的错误，直接抛错不弹框）
        if (err.name === 'AbortError') {
            return Promise.reject(error);
        }
        // 核心修复2：判断请求头（兼容布尔/字符串，只要有X-Skip-Alert就跳过）
        const needSkipAlert = error.config?.headers?.['X-Skip-Alert'] === true 
                            || error.config?.headers?.['X-Skip-Alert'] === 'true';
        
        if (!needSkipAlert) { // 非跳过请求，正常弹框+打印
            console.error('Failure to request', error.message);
            alert('Failure to request: ' +  (error.response?.data?.message || error.message));
        }
        return Promise.reject(error);
    }
)

export default api;