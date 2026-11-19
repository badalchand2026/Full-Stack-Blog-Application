
import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("user");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    });

    const [accessToken, setAccessToken] = useState(() =>
        localStorage.getItem("accessToken")
    );

    const login = async (email, password) => {
        const response = await api.post("/auth/login/", {
            email,
            password,
        });

        const { access, refresh, user: loggedInUser } = response.data;

        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);
        localStorage.setItem("user", JSON.stringify(loggedInUser));

        setAccessToken(access);
        setUser(loggedInUser);

        return loggedInUser;
    };

    const logout = async () => {
        const refreshToken = localStorage.getItem("refreshToken");

        try {
            if (accessToken && refreshToken) {
                await api.post(
                    "/auth/logout/",
                    { refresh: refreshToken },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
            }
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");

            setAccessToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                isAuthenticated: Boolean(accessToken && user),
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
