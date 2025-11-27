// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import FirmwarePage from "./pages/FirmwarePage";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública - Login */}
        <Route path="/" element={<LoginPage />} />
        
        {/* Rutas protegidas */}
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <UsersPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/firmware"
          element={
            <PrivateRoute>
              <FirmwarePage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
