// src/pages/UsersPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Typography,
  Button,
  Container,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import RefreshIcon from "@mui/icons-material/Refresh";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
        setUsers(Array.isArray(res.data) ? res.data : res.data.users || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Función para generar color basado en el nombre
  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "#667eea",
      "#764ba2",
      "#f093fb",
      "#4caf50",
      "#ff6b6b",
      "#feca57",
      "#48dbfb",
      "#ff9ff3",
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => navigate("/firmware")}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Subir Firmware
          </Button>
          <Button
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              color: "#ff6b6b",
              borderColor: "#ff6b6b",
              "&:hover": {
                borderColor: "#ff5252",
                backgroundColor: "rgba(255,107,107,0.1)",
              },
            }}
            variant="outlined"
          >
            Cerrar Sesión
          </Button>
        </Box>

        {/* Título */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              margin: "0 auto 16px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)",
            }}
          >
            <PeopleIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            Usuarios Registrados
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Gestión de usuarios de la plataforma IoT
          </Typography>
        </Box>

        {/* Stats */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            mb: 4,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: "rgba(102, 126, 234, 0.1)",
              border: "1px solid rgba(102, 126, 234, 0.2)",
              minWidth: 150,
              textAlign: "center",
            }}
          >
            <Typography variant="h3" sx={{ color: "#667eea", fontWeight: 700 }}>
              {users.length}
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
              Total Usuarios
            </Typography>
          </Paper>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: "rgba(76, 175, 80, 0.1)",
              border: "1px solid rgba(76, 175, 80, 0.2)",
              minWidth: 150,
              textAlign: "center",
            }}
          >
            <Typography variant="h3" sx={{ color: "#4caf50", fontWeight: 700 }}>
              {users.filter((u) => {
                const date = new Date(u.registrationDate);
                const now = new Date();
                return (now - date) / (1000 * 60 * 60 * 24) < 7;
              }).length}
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
              Nuevos (7 días)
            </Typography>
          </Paper>
        </Box>

        {/* Tabla */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            overflow: "hidden",
          }}
        >
          {/* Header de la tabla */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
              Lista de Usuarios
            </Typography>
            <Tooltip title="Refrescar">
              <IconButton
                onClick={fetchUsers}
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  "&:hover": {
                    color: "#667eea",
                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                  },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
              <CircularProgress
                sx={{
                  color: "#667eea",
                }}
              />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        color: "rgba(255,255,255,0.7)",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        fontWeight: 600,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PersonIcon fontSize="small" />
                        Usuario
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(255,255,255,0.7)",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        fontWeight: 600,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <EmailIcon fontSize="small" />
                        Email
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(255,255,255,0.7)",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        fontWeight: 600,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <FingerprintIcon fontSize="small" />
                        UUID
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(255,255,255,0.7)",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        fontWeight: 600,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CalendarTodayIcon fontSize="small" />
                        Fecha de Registro
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u, index) => (
                    <TableRow
                      key={u._id}
                      sx={{
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(102, 126, 234, 0.1)",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          color: "#fff",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: stringToColor(u.username || ""),
                              fontSize: "1rem",
                              fontWeight: 600,
                            }}
                          >
                            {u.username?.charAt(0).toUpperCase() || "?"}
                          </Avatar>
                          <Typography sx={{ fontWeight: 500 }}>{u.username}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "rgba(255,255,255,0.8)",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        {u.email}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <Chip
                          label={u.uuid?.substring(0, 8) + "..."}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(102, 126, 234, 0.2)",
                            color: "#a5b4fc",
                            border: "1px solid rgba(102, 126, 234, 0.3)",
                            fontFamily: "monospace",
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "rgba(255,255,255,0.6)",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        {new Date(u.registrationDate).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!loading && users.length === 0 && (
            <Box sx={{ textAlign: "center", p: 8 }}>
              <PeopleIcon sx={{ fontSize: 64, color: "rgba(255,255,255,0.2)", mb: 2 }} />
              <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.5)" }}>
                No hay usuarios registrados
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default UsersPage;