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
        return response.data; 
    },
    (error) => {
        if (err.name === 'AbortError') {
            return Promise.reject(error);
        }
        const needSkipAlert = error.config?.headers?.['X-Skip-Alert'] === true 
                            || error.config?.headers?.['X-Skip-Alert'] === 'true';
        
        if (!needSkipAlert) { 
            console.error('Failure to request', error.message);
            alert('Failure to request: ' +  (error.response?.data?.message || error.message));
        }
        return Promise.reject(error);
    }
)

export default api;