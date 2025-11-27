// src/pages/FirmwarePage.js
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  LinearProgress,
  Alert,
  IconButton,
  Chip,
  Avatar,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutIcon from "@mui/icons-material/Logout";
import MemoryIcon from "@mui/icons-material/Memory";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

function FirmwarePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const allowedExtensions = [".bin", ".hex", ".fw", ".img"];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (allowedExtensions.includes(ext)) {
      setSelectedFile(file);
      setMessage({ type: "", text: "" });
    } else {
      setMessage({
        type: "error",
        text: `Tipo de archivo no permitido. Usa: ${allowedExtensions.join(", ")}`,
      });
      setSelectedFile(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: "error", text: "Por favor selecciona un archivo" });
      return;
    }
    if (!version.trim()) {
      setMessage({ type: "error", text: "Por favor ingresa la versión del firmware" });
      return;
    }

    setUploading(true);
    setProgress(0);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("firmware", selectedFile);
    formData.append("version", version);
    formData.append("description", description);

    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/firmware/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      setMessage({ type: "success", text: "¡Firmware subido correctamente! 🚀" });
      setSelectedFile(null);
      setVersion("");
      setDescription("");
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Error al subir el firmware";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="md">
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
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/users")}
            sx={{
              color: "#fff",
              borderColor: "rgba(255,255,255,0.3)",
              "&:hover": {
                borderColor: "#fff",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
            variant="outlined"
          >
            Volver
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

        {/* Título principal */}
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
            <MemoryIcon sx={{ fontSize: 40 }} />
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
            Subir Firmware
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Actualiza el firmware de tus dispositivos IoT
          </Typography>
        </Box>

        {/* Alertas */}
        {message.text && (
          <Alert
            severity={message.type}
            sx={{
              mb: 3,
              borderRadius: 2,
              "& .MuiAlert-icon": {
                fontSize: 28,
              },
            }}
            onClose={() => setMessage({ type: "", text: "" })}
          >
            {message.text}
          </Alert>
        )}

        {/* Card principal */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Zona de Drop */}
          <Box
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            sx={{
              p: 5,
              mb: 3,
              borderRadius: 3,
              border: "2px dashed",
              borderColor: dragActive
                ? "#667eea"
                : selectedFile
                ? "#4caf50"
                : "rgba(255,255,255,0.2)",
              backgroundColor: dragActive
                ? "rgba(102, 126, 234, 0.1)"
                : selectedFile
                ? "rgba(76, 175, 80, 0.1)"
                : "rgba(255,255,255,0.02)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: selectedFile ? "#4caf50" : "#667eea",
                backgroundColor: selectedFile
                  ? "rgba(76, 175, 80, 0.15)"
                  : "rgba(102, 126, 234, 0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            {!selectedFile ? (
              <Box sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    margin: "0 auto 20px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
                    animation: dragActive ? "pulse 1s infinite" : "none",
                    "@keyframes pulse": {
                      "0%": { transform: "scale(1)" },
                      "50%": { transform: "scale(1.05)" },
                      "100%": { transform: "scale(1)" },
                    },
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 50, color: "#fff" }} />
                </Box>
                <Typography variant="h6" sx={{ color: "#fff", mb: 1, fontWeight: 600 }}>
                  Arrastra tu archivo aquí
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 2 }}>
                  o haz clic para seleccionar
                </Typography>
                <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
                  {allowedExtensions.map((ext) => (
                    <Chip
                      key={ext}
                      label={ext}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(102, 126, 234, 0.2)",
                        color: "#a5b4fc",
                        border: "1px solid rgba(102, 126, 234, 0.3)",
                      }}
                    />
                  ))}
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(76, 175, 80, 0.3)",
                  }}
                >
                  <InsertDriveFileIcon sx={{ fontSize: 35, color: "#fff" }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
                      {selectedFile.name}
                    </Typography>
                    <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 20 }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    {formatFileSize(selectedFile.size)}
                  </Typography>
                </Box>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  sx={{
                    color: "#ff6b6b",
                    backgroundColor: "rgba(255,107,107,0.1)",
                    "&:hover": {
                      backgroundColor: "rgba(255,107,107,0.2)",
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={allowedExtensions.join(",")}
            style={{ display: "none" }}
          />

          {/* Campos del formulario */}
          <TextField
            label="Versión del Firmware"
            variant="outlined"
            fullWidth
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="Ej: 1.0.0"
            disabled={uploading}
            required
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255,255,255,0.4)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#667eea",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255,255,255,0.6)",
                "&.Mui-focused": {
                  color: "#667eea",
                },
              },
            }}
          />

          <TextField
            label="Descripción (opcional)"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notas sobre esta versión..."
            disabled={uploading}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255,255,255,0.4)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#667eea",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255,255,255,0.6)",
                "&.Mui-focused": {
                  color: "#667eea",
                },
              },
            }}
          />

          {/* Barra de progreso */}
          {uploading && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                  Subiendo firmware...
                </Typography>
                <Typography variant="body2" sx={{ color: "#667eea", fontWeight: 600 }}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                  },
                }}
              />
            </Box>
          )}

          {/* Botón de subida */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            startIcon={<RocketLaunchIcon />}
            sx={{
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 600,
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px rgba(102, 126, 234, 0.4)",
              },
              "&:disabled": {
                background: "rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.3)",
              },
            }}
          >
            {uploading ? "Subiendo..." : "Subir Firmware"}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default FirmwarePage;