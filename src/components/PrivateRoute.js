// src/components/PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  // Redirige a "/" que es donde está el LoginPage
  return token ? children : <Navigate to="/" replace />;
}

export default PrivateRoute;
