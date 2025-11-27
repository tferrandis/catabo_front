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
  Card,
  CardContent,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutIcon from "@mui/icons-material/Logout";

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

  // Tipos de archivo permitidos
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

      setMessage({ type: "success", text: "Firmware subido correctamente" });
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
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header con navegación */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/users")}
          >
            Volver a Usuarios
          </Button>
          <Button
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Cerrar Sesión
          </Button>
        </Box>

        <Typography variant="h4" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CloudUploadIcon fontSize="large" />
          Subir Firmware
        </Typography>

        {/* Mensajes de alerta */}
        {message.text && (
          <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: "", text: "" })}>
            {message.text}
          </Alert>
        )}

        {/* Zona de Drop */}
        <Paper
          sx={{
            p: 4,
            mb: 3,
            border: "2px dashed",
            borderColor: dragActive ? "primary.main" : "grey.400",
            backgroundColor: dragActive ? "action.hover" : "background.paper",
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "primary.main",
              backgroundColor: "action.hover",
            },
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
        >
          {!selectedFile ? (
            <Box sx={{ textAlign: "center" }}>
              <CloudUploadIcon sx={{ fontSize: 64, color: "grey.500", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Arrastra y suelta tu archivo de firmware aquí
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                o haz clic para seleccionar
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Formatos permitidos: {allowedExtensions.join(", ")}
              </Typography>
            </Box>
          ) : (
            <Card variant="outlined">
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <InsertDriveFileIcon sx={{ fontSize: 48, color: "primary.main" }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatFileSize(selectedFile.size)}
                  </Typography>
                </Box>
                <IconButton
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </CardContent>
            </Card>
          )}
        </Paper>

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
          margin="normal"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          placeholder="Ej: 1.0.0"
          disabled={uploading}
          required
        />

        <TextField
          label="Descripción (opcional)"
          variant="outlined"
          fullWidth
          margin="normal"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Notas sobre esta versión..."
          disabled={uploading}
        />

        {/* Barra de progreso */}
        {uploading && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              {progress}% completado
            </Typography>
          </Box>
        )}

        {/* Botón de subida */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          startIcon={<CloudUploadIcon />}
          sx={{ mt: 2 }}
        >
          {uploading ? "Subiendo..." : "Subir Firmware"}
        </Button>
      </Box>
    </Container>
  );
}

export default FirmwarePage;
