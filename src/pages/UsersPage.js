import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Box, Typography,
  Button
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LogoutIcon from "@mui/icons-material/Logout";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        // Cambia a ruta relativa - nginx redirige /api/ a tu backend
        const res = await axios.get("/api/auth/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (err) {
        console.error(err);
        // Si hay error 401, redirigir al login
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      sx={{ mt: 5, px: 2 }}
    >
      {/* Header con botones de navegación */}
      <Box 
        sx={{ 
          width: "100%", 
          maxWidth: 900, 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          mb: 3 
        }}
      >
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={() => navigate("/firmware")}
        >
          Subir Firmware
        </Button>
        <Button
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Cerrar Sesión
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom>
        Lista de Usuarios
      </Typography>
      <TableContainer component={Paper} sx={{ maxWidth: 900, width: "100%", mx: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Username</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>UUID</strong></TableCell>
              <TableCell><strong>Registration Date</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u._id}>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.uuid}</TableCell>
                <TableCell>{new Date(u.registrationDate).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default UsersPage;