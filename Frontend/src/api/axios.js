import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({ baseURL, withCredentials: true });

// separate instance so refresh calls never pass through the 401 interceptor
const refreshClient = axios.create({ baseURL, withCredentials: true });

const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];

export const AUTH_TOKEN_EVENT = "auth:token-refreshed";
export const AUTH_EXPIRED_EVENT = "auth:session-expired";

let refreshPromise = null;

// all concurrent 401s share one refresh request
export const refreshAccessToken = () => {
    if (!refreshPromise) {
        refreshPromise = refreshClient
            .post("/auth/refresh")
            .then(({ data }) => {
                localStorage.setItem("accessToken", data.accessToken);
                window.dispatchEvent(new CustomEvent(AUTH_TOKEN_EVENT, { detail: data }));
                return data.accessToken;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
};

const isAuthRoute = (url = "") => AUTH_ROUTES.some((route) => url.includes(route));

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            isAuthRoute(originalRequest.url)
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        // token was already renewed by another request while this one was in flight
        const sentToken = originalRequest.headers.Authorization?.split(" ")[1];
        const currentToken = localStorage.getItem("accessToken");
        if (currentToken && sentToken && currentToken !== sentToken) {
            originalRequest.headers.Authorization = `Bearer ${currentToken}`;
            return api(originalRequest);
        }

        try {
            const newAccessToken = await refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            // only end the session when the server rejected the refresh token
            if (refreshError.response?.status === 401) {
                window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
            }
            return Promise.reject(refreshError);
        }
    }
);

export default api;
