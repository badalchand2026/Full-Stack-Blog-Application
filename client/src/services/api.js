import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Prevent multiple simultaneous refresh requests.
let refreshPromise = null;

// Attach the access token to outgoing requests.
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("accessToken");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Refresh the access token when the server returns 401.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            originalRequest.url?.includes("/auth/login/") ||
            originalRequest.url?.includes("/auth/refresh/")
        ) {
            return Promise.reject(error);
        }

        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
            clearSession();
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = axios
                    .post(
                        `${api.defaults.baseURL}/auth/refresh/`,
                        { refresh: refreshToken }
                    )
                    .then((response) => {
                        const { access, refresh } = response.data;

                        localStorage.setItem("accessToken", access);

                        // The backend may rotate the refresh token.
                        if (refresh) {
                            localStorage.setItem("refreshToken", refresh);
                        }

                        return access;
                    })
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            const newAccessToken = await refreshPromise;

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return api(originalRequest);
        } catch (refreshError) {
            clearSession();
            window.location.assign("/login");

            return Promise.reject(refreshError);
        }
    }
);

function clearSession() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
}

export default api;