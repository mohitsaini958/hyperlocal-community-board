import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});


// REQUEST INTERCEPTOR
api.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem(
                "accessToken"
            );

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },
    (error) =>
        Promise.reject(error)
);


// RESPONSE INTERCEPTOR
api.interceptors.response.use(
    (response) => response,

    async (error) => {

        const originalRequest =
            error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {

            originalRequest._retry =
                true;

            try {

                const response =
                    await api.post(
                        "/auth/refresh"
                    );

                const newAccessToken =
                    response.data
                        .accessToken;

                localStorage.setItem(
                    "accessToken",
                    newAccessToken
                );

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return api(
                    originalRequest
                );

            } catch (
                refreshError
            ) {

                localStorage.removeItem(
                    "accessToken"
                );

                localStorage.removeItem(
                    "user"
                );

                window.location.href =
                    "/login";

                return Promise.reject(
                    refreshError
                );
            }
        }

        return Promise.reject(
            error
        );
    }
);

export default api;