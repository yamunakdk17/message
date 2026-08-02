import { createContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.PROD && import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    // Check if user is authenticated and if so, set the user data and connect the socket
    const checkAuth = async () => {
        if (!token) return;

        try {
            const { data } = await axios.get("/api/auth/check");

            if (data.success) {
                setAuthUser(data.user)
                connectSocket(data.user)
            }

        } catch (error) {
            // Remove invalid or expired tokens automatically
            const status = error.response?.status;
            if (status === 401) {
                localStorage.removeItem("token");
                setToken(null);
                setAuthUser(null);
                delete axios.defaults.headers.common["token"];
                delete axios.defaults.headers.common["Authorization"];
            }
            console.log("Auth check failed:", error.message);
        }
    };
    // Login function to handle user authentication and socket connection

    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);

            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message)
            }else{

                toast.error(data.message)
            }

            

        } catch (error) {

            toast.error(error.message)


        }
    };
    // Logout function to handle user logout and socket disconnection

    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        delete axios.defaults.headers.common["token"];
        delete axios.defaults.headers.common["Authorization"];
        toast.success("Logged out successfully");
        socket?.disconnect();   
     };
    // Update profile function to handle user profile updates

    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put(
                "/api/auth/update-profile",
                body
            );

            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
                return true;
            }

            return false;
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };












    // Connect socket function to handle socket connection and online users updates
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;

        const newSocket = io(backendUrl, {
            withCredentials: true,
            query: {
                userId: userData._id,
            }
        });

            newSocket.connect();
            setSocket(newSocket);

            newSocket.on("getOnlineUsers", (userIds) => {
                setOnlineUsers(userIds);
    });
}

    useEffect(()=>{
        if(token){
            axios.defaults.headers.common["token"] = token;
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common["token"];
            delete axios.defaults.headers.common["Authorization"];
        }
        checkAuth()
    },[token])


    const value = {
     axios,
     authUser,
     onlineUsers,
     socket,
     login,
     logout,updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};