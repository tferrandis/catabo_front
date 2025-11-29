// src/pages/FirmwarePage.js
import React, { useState, useRef, useEffect } from "react";
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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tooltip,
    CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutIcon from "@mui/icons-material/Logout";
import MemoryIcon from "@mui/icons-material/Memory";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import DescriptionIcon from "@mui/icons-material/Description";

function FirmwarePage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [version, setVersion] = useState("");
    const [description, setDescription] = useState("");
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [dragActive, setDragActive] = useState(false);
    const [firmwares, setFirmwares] = useState([]);
    const [loadingFirmwares, setLoadingFirmwares] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, firmware: null });
    const [deleting, setDeleting] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const allowedExtensions = [".bin", ".hex", ".fw", ".img"];

    // Cargar lista de firmwares
    const fetchFirmwares = async () => {
        setLoadingFirmwares(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("/api/firmware", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFirmwares(res.data.firmwares || res.data || []);
        } catch (err) {
            console.error("Error cargando firmwares:", err);
            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/");
            }
        } finally {
            setLoadingFirmwares(false);
        }
    };

    useEffect(() => {
        fetchFirmwares();
    }, []);

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
            // Recargar lista
            fetchFirmwares();
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || "Error al subir el firmware";
            setMessage({ type: "error", text: errorMsg });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteDialog.firmware) return;

        setDeleting(true);
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`/api/firmware/${deleteDialog.firmware._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage({ type: "success", text: "Firmware eliminado correctamente" });
            setDeleteDialog({ open: false, firmware: null });
            fetchFirmwares();
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Error al eliminar el firmware" });
        } finally {
            setDeleting(false);
        }
    };

    const handleSetActive = async (firmwareId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`/api/firmware/${firmwareId}/activate`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage({ type: "success", text: "Firmware activado como versión principal" });
            fetchFirmwares();
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Error al activar el firmware" });
        }
    };

    const handleDownload = (firmwareId) => {
        window.open(`/api/firmware/download/${firmwareId}`, "_blank");
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
                        Gestión de Firmware
                    </Typography>
                    <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)" }}>
                        Sube y administra el firmware de tus dispositivos IoT
                    </Typography>
                </Box>

                {/* Alertas */}
                {message.text && (
                    <Alert
                        severity={message.type}
                        sx={{ mb: 3, borderRadius: 2 }}
                        onClose={() => setMessage({ type: "", text: "" })}
                    >
                        {message.text}
                    </Alert>
                )}

                {/* Card de subida */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        mb: 4,
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.05)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                    }}
                >
                    <Typography variant="h6" sx={{ color: "#fff", mb: 3, fontWeight: 600 }}>
                        Subir Nuevo Firmware
                    </Typography>

                    {/* Zona de Drop */}
                    <Box
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => !selectedFile && fileInputRef.current?.click()}
                        sx={{
                            p: 4,
                            mb: 3,
                            borderRadius: 3,
                            border: "2px dashed",
                            borderColor: dragActive ? "#667eea" : selectedFile ? "#4caf50" : "rgba(255,255,255,0.2)",
                            backgroundColor: dragActive ? "rgba(102, 126, 234, 0.1)" : selectedFile ? "rgba(76, 175, 80, 0.1)" : "rgba(255,255,255,0.02)",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                borderColor: selectedFile ? "#4caf50" : "#667eea",
                                backgroundColor: selectedFile ? "rgba(76, 175, 80, 0.15)" : "rgba(102, 126, 234, 0.1)",
                            },
                        }}
                    >
                        {!selectedFile ? (
                            <Box sx={{ textAlign: "center" }}>
                                <CloudUploadIcon sx={{ fontSize: 50, color: "rgba(255,255,255,0.5)", mb: 2 }} />
                                <Typography variant="body1" sx={{ color: "#fff", mb: 1 }}>
                                    Arrastra tu archivo aquí o haz clic para seleccionar
                                </Typography>
                                <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
                                    {allowedExtensions.map((ext) => (
                                        <Chip key={ext} label={ext} size="small" sx={{ backgroundColor: "rgba(102, 126, 234, 0.2)", color: "#a5b4fc" }} />
                                    ))}
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <InsertDriveFileIcon sx={{ fontSize: 40, color: "#4caf50" }} />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography sx={{ color: "#fff", fontWeight: 600 }}>{selectedFile.name}</Typography>
                                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>{formatFileSize(selectedFile.size)}</Typography>
                                </Box>
                                <IconButton onClick={(e) => { e.stopPropagation(); removeFile(); }} sx={{ color: "#ff6b6b" }}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        )}
                    </Box>

                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept={allowedExtensions.join(",")} style={{ display: "none" }} />

                    {/* Campos */}
                    <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                        <TextField
                            label="Versión"
                            variant="outlined"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            placeholder="Ej: 1.0.0"
                            disabled={uploading}
                            required
                            sx={{
                                flex: "1 1 200px",
                                "& .MuiOutlinedInput-root": { color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.2)" }, "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" }, "&.Mui-focused fieldset": { borderColor: "#667eea" } },
                                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)", "&.Mui-focused": { color: "#667eea" } },
                            }}
                        />
                        <TextField
                            label="Descripción (opcional)"
                            variant="outlined"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Notas sobre esta versión..."
                            disabled={uploading}
                            sx={{
                                flex: "2 1 300px",
                                "& .MuiOutlinedInput-root": { color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.2)" }, "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" }, "&.Mui-focused fieldset": { borderColor: "#667eea" } },
                                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)", "&.Mui-focused": { color: "#667eea" } },
                            }}
                        />
                    </Box>

                    {/* Progreso */}
                    {uploading && (
                        <Box sx={{ mb: 3 }}>
                            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.1)", "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)" } }} />
                            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 1, textAlign: "center" }}>{progress}%</Typography>
                        </Box>
                    )}

                    {/* Botón */}
                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={handleUpload}
                        disabled={uploading || !selectedFile}
                        startIcon={<RocketLaunchIcon />}
                        sx={{
                            py: 1.5,
                            fontWeight: 600,
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            "&:hover": { background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)" },
                            "&:disabled": { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" },
                        }}
                    >
                        {uploading ? "Subiendo..." : "Subir Firmware"}
                    </Button>
                </Paper>

                {/* Lista de Firmwares */}
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
                    <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
                            Firmwares Disponibles ({firmwares.length})
                        </Typography>
                        <Tooltip title="Refrescar">
                            <IconButton onClick={fetchFirmwares} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#667eea" } }}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {loadingFirmwares ? (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
                            <CircularProgress sx={{ color: "#667eea" }} />
                        </Box>
                    ) : firmwares.length === 0 ? (
                        <Box sx={{ textAlign: "center", p: 6 }}>
                            <DescriptionIcon sx={{ fontSize: 64, color: "rgba(255,255,255,0.2)", mb: 2 }} />
                            <Typography sx={{ color: "rgba(255,255,255,0.5)" }}>No hay firmwares subidos</Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: "rgba(255,255,255,0.7)", borderBottom: "1px solid rgba(255,255,255,0.1)", fontWeight: 600 }}>Versión</TableCell>
                                        <TableCell sx={{ color: "rgba(255,255,255,0.7)", borderBottom: "1px solid rgba(255,255,255,0.1)", fontWeight: 600 }}>Archivo</TableCell>
                                        <TableCell sx={{ color: "rgba(255,255,255,0.7)", borderBottom: "1px solid rgba(255,255,255,0.1)", fontWeight: 600 }}>Tamaño</TableCell>
                                        <TableCell sx={{ color: "rgba(255,255,255,0.7)", borderBottom: "1px solid rgba(255,255,255,0.1)", fontWeight: 600 }}>Fecha</TableCell>
                                        <TableCell sx={{ color: "rgba(255,255,255,0.7)", borderBottom: "1px solid rgba(255,255,255,0.1)", fontWeight: 600 }}>Descargas</TableCell>
                                        <TableCell sx={{ color: "rgba(255,255,255,0.7)", borderBottom: "1px solid rgba(255,255,255,0.1)", fontWeight: 600 }} align="right">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {firmwares.map((fw) => (
                                        <TableRow key={fw._id} sx={{ "&:hover": { backgroundColor: "rgba(102, 126, 234, 0.1)" } }}>
                                            <TableCell sx={{ color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Chip
                                                        label={fw.version}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: fw.isActive ? "rgba(76, 175, 80, 0.2)" : "rgba(102, 126, 234, 0.2)",
                                                            color: fw.isActive ? "#4caf50" : "#a5b4fc",
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                    {fw.isActive && <StarIcon sx={{ color: "#ffd700", fontSize: 18 }} />}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ color: "rgba(255,255,255,0.8)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                {fw.originalName || fw.filename}
                                            </TableCell>
                                            <TableCell sx={{ color: "rgba(255,255,255,0.6)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                {formatFileSize(fw.size)}
                                            </TableCell>
                                            <TableCell sx={{ color: "rgba(255,255,255,0.6)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                {new Date(fw.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                                            </TableCell>
                                            <TableCell sx={{ color: "rgba(255,255,255,0.6)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                {fw.downloads || 0}
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }} align="right">
                                                <Tooltip title={fw.isActive ? "Versión activa" : "Marcar como activa"}>
                                                    <IconButton
                                                        onClick={() => handleSetActive(fw._id)}
                                                        sx={{ color: fw.isActive ? "#ffd700" : "rgba(255,255,255,0.5)", "&:hover": { color: "#ffd700" } }}
                                                    >
                                                        {fw.isActive ? <StarIcon /> : <StarBorderIcon />}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Descargar">
                                                    <IconButton onClick={() => handleDownload(fw._id)} sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#4caf50" } }}>
                                                        <DownloadIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar">
                                                    <IconButton onClick={() => setDeleteDialog({ open: true, firmware: fw })} sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#ff6b6b" } }}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>

                {/* Dialog de confirmación de eliminación */}
                <Dialog
                    open={deleteDialog.open}
                    onClose={() => setDeleteDialog({ open: false, firmware: null })}
                    PaperProps={{
                        sx: {
                            backgroundColor: "#1a1a2e",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 3,
                        },
                    }}
                >
                    <DialogTitle sx={{ color: "#fff" }}>¿Eliminar firmware?</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ color: "rgba(255,255,255,0.7)" }}>
                            ¿Estás seguro de que deseas eliminar el firmware <strong style={{ color: "#ff6b6b" }}>{deleteDialog.firmware?.version}</strong>?
                            Esta acción no se puede deshacer.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={() => setDeleteDialog({ open: false, firmware: null })}
                            sx={{ color: "rgba(255,255,255,0.7)" }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={deleting}
                            variant="contained"
                            sx={{
                                backgroundColor: "#ff6b6b",
                                "&:hover": { backgroundColor: "#ff5252" },
                            }}
                        >
                            {deleting ? "Eliminando..." : "Eliminar"}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}

export default FirmwarePage;