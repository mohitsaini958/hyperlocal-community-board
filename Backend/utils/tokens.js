import jwt from "jsonwebtoken";

export const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "1d";
const REFRESH_TOKEN_DAYS = 30;
const isProd = process.env.NODE_ENV === "production";

export const refreshCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/api/auth",
};

export const signAccessToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });

export const signRefreshToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: `${REFRESH_TOKEN_DAYS}d` });

export const setRefreshCookie = (res, token) =>
    res.cookie("refreshToken", token, {
        ...refreshCookieOptions,
        maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    });

export const clearRefreshCookie = (res) => {
    res.clearCookie("refreshToken", refreshCookieOptions);
    // legacy cookie set on "/" by older builds
    res.clearCookie("refreshToken", { ...refreshCookieOptions, path: "/" });
};

export const issueTokens = (res, userId) => {
    setRefreshCookie(res, signRefreshToken(userId));
    return signAccessToken(userId);
};
