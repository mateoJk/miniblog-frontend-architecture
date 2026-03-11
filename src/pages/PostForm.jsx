import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../api/api";
import {
  Container, Card, Typography, TextField, Button,
  FormControlLabel, Checkbox, Box, Divider, CircularProgress, Fade, Grid
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAuth } from "../contexts/AuthContext"; 

export default function PostForm() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const isEdit = Boolean(postId);

  const [form, setForm] = useState({ titulo: "", contenido: "", nuevaCategoria: "" });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

const fetchData = useCallback(async () => {
    // 1. Si no hay usuario todavía, no hacemos nada (esperamos al contexto)
    if (isEdit && !user) {
      console.log("Esperando a que cargue el usuario del contexto...");
      return; 
    }

    setLoading(true);
    try {
      console.log("Iniciando carga de datos para post:", postId);
      
      const [catRes, postRes] = await Promise.all([
        api.get("/api/categories"),
        isEdit ? api.get(`/api/posts/${postId}`) : Promise.resolve(null)
      ]);

      setAvailableCategories(catRes.data);

      if (isEdit && postRes?.data) {
        console.log("Datos del Post recibidos:", postRes.data);
        console.log("Usuario actual en contexto:", user);

      
        const postOwnerId = postRes.data.usuario_id || postRes.data.user_id;
        const currentUserId = user?.id || user?.sub; // sub es común en JWT

        const isOwner = String(currentUserId) === String(postOwnerId);
        const isAdmin = user?.role === "admin";

        console.log(`Verificación: Owner(${postOwnerId}) === Current(${currentUserId})? ${isOwner}`);

        if (!isOwner && !isAdmin) {
          throw new Error("DENEGADO");
        }

        setForm({
          titulo: postRes.data.titulo || "",
          contenido: postRes.data.contenido || "",
          nuevaCategoria: ""
        });
        setSelectedIds(postRes.data.categorias?.map(c => c.id) || []);
      }
    } catch (err) {
      console.error("Error capturado en fetchData:", err);
      
      if (err.message === "DENEGADO") {
        Swal.fire({
          icon: "error",
          title: "Acceso Denegado",
          text: "No tienes permisos para editar esta publicación.",
          confirmButtonColor: "#1976d2"
        });
        navigate("/posts");
      } else {
        const serverMsg = err.response?.data?.error || "Error de comunicación con el servidor.";
        Swal.fire({
          icon: "warning",
          title: "Sincronización Fallida",
          text: serverMsg,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [isEdit, postId, navigate, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // PREVENCIÓN DE SALIDA ACCIDENTAL
  useEffect(() => {
    const hasContent = form.titulo || form.contenido;
    if (hasContent && !submitting) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [form.titulo, form.contenido, submitting]);

  const toggleCategory = useCallback((id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }, []);

  const renderedCategories = useMemo(() => (
    availableCategories.map(c => (
      <FormControlLabel
        key={c.id}
        control={
          <Checkbox 
            checked={selectedIds.includes(c.id)} 
            onChange={() => toggleCategory(c.id)} 
            color="primary"
          />
        }
        label={<Typography variant="body2" sx={{ fontWeight: 500 }}>{c.nombre}</Typography>}
      />
    ))
  ), [availableCategories, selectedIds, toggleCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.titulo.trim() || !form.contenido.trim()) {
      Swal.fire("Campos incompletos", "El título y el contenido son obligatorios.", "warning");
      return;
    }

    if (selectedIds.length === 0 && !form.nuevaCategoria.trim()) {
      Swal.fire("Categorización requerida", "Seleccione al menos una categoría existente o proponga una nueva.", "warning");
      return;
    }

    setSubmitting(true);
    
    const payload = {
      titulo: form.titulo.trim(),
      contenido: form.contenido.trim(),
      categoria_ids: selectedIds,
      ...(form.nuevaCategoria.trim() && { nueva_categoria: form.nuevaCategoria.trim() }),
    };

    try {
      if (isEdit) {
        await api.put(`/api/posts/${postId}`, payload);
      } else {
        await api.post("/api/posts", payload);
      }
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      await Toast.fire({
        icon: 'success',
        title: isEdit ? 'Cambios guardados con éxito' : 'Entrada publicada correctamente'
      });
      
      navigate("/posts");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Error al procesar la solicitud en el servidor.";
      Swal.fire("Error de Publicación", errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress thickness={4} size={48} />
    </Box>
  );

  return (
    <Fade in={!loading} timeout={500}>
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
        <Card sx={{ 
          p: { xs: 2.5, md: 4 }, 
          borderRadius: 5, 
          boxShadow: "0 24px 48px rgba(0,0,0,0.06)",
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
          <Typography variant="h3" fontWeight={900} letterSpacing="-2px" gutterBottom>
            {isEdit ? "Edición de Post" : "Nueva Publicación"}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '600px' }}>
            Complete los campos para {isEdit ? "actualizar la información" : "distribuir contenido"} en la red corporativa.
          </Typography>
          
          <Divider sx={{ mb: 3 }} />

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2.5} direction={"column"}>
              <Grid item xs={12}>
                <TextField
                  fullWidth label="Título"
                  placeholder="Escriba un título impactante..."
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  required
                  disabled={submitting}
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth label="Contenido del Artículo"
                  value={form.contenido}
                  onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                  required multiline rows={8}
                  disabled={submitting}
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="overline" fontWeight={700} sx={{ mb: 1.5, display: 'block', color: 'primary.main' }}>
                  Clasificación de Contenido
                </Typography>
                
                <Box sx={{ 
                  display: "grid", 
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, 
                  gap: 1, p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 3,
                  maxHeight: 160, overflowY: "auto", bgcolor: "grey.50"
                }}>
                  {renderedCategories}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth label="Nueva Categoría"
                  value={form.nuevaCategoria}
                  onChange={(e) => setForm({ ...form, nuevaCategoria: e.target.value })}
                  placeholder="Solo si no existe en la lista superior"
                  disabled={submitting}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                  <Button 
                    type="submit" variant="contained" size="large" 
                    disabled={submitting} 
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    sx={{ 
                      px: 6, py: 2, borderRadius: 3, textTransform: "none", 
                      fontWeight: 900, fontSize: '1rem',
                      boxShadow: '0 8px 20px rgba(25, 118, 210, 0.3)'
                    }}
                  >
                    {isEdit ? "Guardar Cambios" : "Publicar Ahora"}
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate("/posts")} 
                    disabled={submitting}
                    startIcon={<ArrowBackIcon />}
                    sx={{ px: 4, borderRadius: 3, textTransform: "none", fontWeight: 700, borderColor: 'divider', color: 'text.primary' }}
                  >
                    Cancelar
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Container>
    </Fade>
  );
}