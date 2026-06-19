import { createContext,useContext,useState } from "react";

const AuthContext=createContext();

export const AuthProvider=({children})=>{
    const [user,setUser]=useState(null);
    const [accessToken,setAccessToken]=useState(
        localStorage.getItem("accessToken")
    );

    const login=(userData,token)=>{
        setUser(userData);
        setAccessToken(token);
        localStorage.setItem("userId",userData.id);
        localStorage.setItem("accessToken",token);
    };

    const logout=()=>{
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
    };

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