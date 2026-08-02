import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";

import bimage from "./assets/bimage.svg";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "./context/AuthContext";

const App = () => {
  const { authUser } = useContext(AuthContext);

  return (
    <div
      className="w-full min-h-screen bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${bimage})` }}
    >
      <Toaster />

      <Routes>
        {/* Default Route */}
        <Route
          path="/"
          element={
            authUser ? <Navigate to="/home" /> : <Navigate to="/login" />
          }
        />

        {/* Home Route */}
        <Route
          path="/home"
          element={
            authUser ? <HomePage /> : <Navigate to="/login" />
          }
        />

        {/* Login Route */}
        <Route
          path="/login"
          element={
            !authUser ? <LoginPage /> : <Navigate to="/home" />
          }
        />

        {/* Profile Route */}
        <Route
          path="/profile"
          element={
            authUser ? <ProfilePage /> : <Navigate to="/login" />
          }
        />

        {/* Unknown Route */}
        <Route
          path="*"
          element={<Navigate to="/" />}
        />
      </Routes>
    </div>
  );
};

export default App;