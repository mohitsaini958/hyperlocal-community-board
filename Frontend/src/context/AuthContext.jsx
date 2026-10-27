import { createContext,useCallback,useContext,useEffect,useState } from "react";
import api,{ AUTH_EXPIRED_EVENT,AUTH_TOKEN_EVENT } from "../api/axios";
import { showToast } from "../components/Toast.jsx";

const AuthContext=createContext();

const readStoredUser=()=>{
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch {
        return null;
    }
};

const clearStorage=()=>{
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
};

export const AuthProvider=({children})=>{
    const [user,setUser]=useState(readStoredUser);
    const [accessToken,setAccessToken]=useState(
        localStorage.getItem("accessToken")
    );

    const login=(userData,token)=>{
        setUser(userData);
        setAccessToken(token);
        localStorage.setItem("userId",userData.id);
        localStorage.setItem("user",JSON.stringify(userData));
        localStorage.setItem("accessToken",token);
    };

    const clearSession=useCallback(()=>{
        clearStorage();
        setUser(null);
        setAccessToken(null);
    },[]);

    const logout=useCallback(async()=>{
        clearSession();
        try {
            await api.post("/auth/logout");
        } catch {
            // cookie will still expire on its own
        }
    },[clearSession]);

    useEffect(()=>{
        const onRefreshed=(e)=>{
            setAccessToken(e.detail.accessToken);
            if(e.detail.user){
                setUser(e.detail.user);
                localStorage.setItem("userId",e.detail.user.id);
                localStorage.setItem("user",JSON.stringify(e.detail.user));
            }
        };
        const onExpired=()=>{
            if(!localStorage.getItem("accessToken")) return;
            clearSession();
            showToast("Session expired, please sign in again","error");
        };
        window.addEventListener(AUTH_TOKEN_EVENT,onRefreshed);
        window.addEventListener(AUTH_EXPIRED_EVENT,onExpired);
        return ()=>{
            window.removeEventListener(AUTH_TOKEN_EVENT,onRefreshed);
            window.removeEventListener(AUTH_EXPIRED_EVENT,onExpired);
        };
    },[clearSession]);

    const isAuthenticated=!!accessToken;

    const value={
        user,
        accessToken,
        login,
        logout,
        setUser,
        setAccessToken,
        isAuthenticated,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext=()=>useContext(AuthContext);
