import axios from 'axios';

/**
 * Universal API Configuration for Paradise Hotel
 * - Localhost: uses "/api" proxied by CRA to http://localhost:5000
 * - Production (Vercel / live domains): connects directly to Render backend (https://paradise-hotel-ff69.onrender.com/api)
 */
const PRODUCTION_BACKEND_URL = 'https://paradise-hotel-ff69.onrender.com';

const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.local')
);

const DEFAULT_API_URL = (!isLocalhost && isBrowser)
    ? `${PRODUCTION_BACKEND_URL}/api`
    : '/api';

const BASE_URL =
    process.env.REACT_APP_API_URL ||
    process.env.VITE_API_URL ||
    DEFAULT_API_URL;

export const API_ORIGIN = (
    process.env.REACT_APP_API_URL ||
    process.env.VITE_API_URL ||
    (!isLocalhost && isBrowser ? PRODUCTION_BACKEND_URL : '')
).replace(/\/api\/?$/, '');

export const getMediaUrl = (imgPath) => {
    if (!imgPath) return '';
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('data:')) {
        return imgPath;
    }
    const cleanPath = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
    if (API_ORIGIN) {
        return `${API_ORIGIN}${cleanPath}`;
    }
    return isLocalhost
        ? `http://localhost:5000${cleanPath}`
        : `${PRODUCTION_BACKEND_URL}${cleanPath}`;
};

const API = axios.create({
    baseURL: BASE_URL,
    timeout: 60000, // 60s timeout ensures Render free-tier cold starts do not time out
});

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            if (config.headers) {
                delete config.headers['Content-Type'];
                delete config.headers['content-type'];
            }
        } else if (config.data && typeof config.data === 'object') {
            config.headers = config.headers || {};
            if (!config.headers['Content-Type'] && !config.headers['content-type']) {
                config.headers['Content-Type'] = 'application/json';
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

API.interceptors.response.use(
    (response) => {
        // Guard against HTML returned when an endpoint returns index.html fallback
        if (typeof response.data === 'string' && response.data.trim().startsWith('<!doctype html>')) {
            console.warn('[API Notice] Received HTML instead of JSON for', response.config.url);
        }
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('role');
        }
        if (!error.response) {
            error.message =
                error.code === 'ECONNABORTED'
                    ? 'Server request timed out. The backend server may be waking up.'
                    : 'Cannot reach the database server. Please check your connection or try again in a few moments.';
        }
        return Promise.reject(error);
    }
);

export default API;
