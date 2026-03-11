import React, { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import {
  Container, Card, CardContent, Typography, Button, TextField,
  Snackbar, IconButton, Box, Divider, Avatar, Skeleton, Alert, Paper, Fade, Stack, Chip
} from "@mui/material";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Swal from "sweetalert2";

export default function PostDetail() {
  const { postId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  /**
   * DATA ACQUISITION
   * Ejecución paralela y manejo de errores con redirección defensiva.
   */
  const fetchPostData = useCallback(async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        api.get(`/api/posts/${postId}`),
        api.get(`/api/posts/${postId}/comments`)
      ]);
      setPost(postRes.data);
      setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error al recuperar la publicación",
        severity: "error"
      });
      // Si el post no existe, redirigimos tras un breve delay
      if (err.response?.status === 404) navigate("/posts");
    } finally {
      setLoading(false);
    }
  }, [postId, navigate]);

  useEffect(() => {
    fetchPostData();
  }, [fetchPostData]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const cleanComment = commentText.trim();
    if (!cleanComment || submitting) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/api/posts/${postId}/comments`, { contenido: cleanComment });
      // Inserción al inicio para feedback inmediato
      setComments(prev => [res.data, ...prev]); 
      setCommentText("");
      setSnackbar({ open: true, message: "Comentario añadido con éxito", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: "Error al publicar comentario", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const result = await Swal.fire({
      title: "¿Eliminar comentario?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setSnackbar({ open: true, message: "Comentario removido", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: "No se pudo eliminar el comentario", severity: "error" });
    }
  };

  // RENDER: Loading State (Enterprise Skeleton)
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Skeleton variant="text" width={150} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 4, mb: 4 }} />
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  // RENDER: Error State
  if (!post) return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Alert severity="error" variant="outlined" sx={{ borderRadius: 3 }}>
        La publicación solicitada no está disponible o ha sido eliminada.
      </Alert>
    </Container>
  );

  return (
    <Fade in={!loading}>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          component={Link} 
          to="/posts" 
          sx={{ mb: 4, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
        >
          Volver al Feed
        </Button>

        {/* ARTÍCULO PRINCIPAL */}
        <Card sx={{ 
          borderRadius: 5, 
          boxShadow: "0 10px 40px rgba(0,0,0,0.04)", 
          border: '1px solid', 
          borderColor: 'divider',
          mb: 6 
        }}>
          <CardContent sx={{ p: { xs: 3, md: 6 } }}>
            <Typography variant="h2" fontWeight={900} letterSpacing="-2px" gutterBottom sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
              {post.titulo}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 5, mt: 3, gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, fontWeight: 800 }}>
                {post.autor_username?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ lineHeight: 1.2 }}>
                  {post.autor_username || "Autor anónimo"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(post.fecha_creacion).toLocaleDateString('es-AR', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 5, borderStyle: 'dashed' }} />

            <Typography variant="body1" sx={{ 
              lineHeight: 1.9, 
              fontSize: '1.15rem', 
              color: 'text.primary',
              opacity: 0.9,
              whiteSpace: 'pre-line' 
            }}>
              {post.contenido}
            </Typography>
          </CardContent>
        </Card>

        {/* SECCIÓN DE FEEDBACK */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={900}>Participación</Typography>
          <Chip label={comments.length} size="small" color="primary" sx={{ fontWeight: 800 }} />
        </Stack>

        <Paper sx={{ 
          p: { xs: 2, md: 4 }, 
          borderRadius: 4, 
          bgcolor: 'grey.50', 
          border: '1px solid', 
          borderColor: 'divider' 
        }}>
          {isAuthenticated ? (
            <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 5 }}>
              <TextField
                fullWidth
                placeholder="Escribe una respuesta profesional..."
                multiline
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={submitting}
                variant="outlined"
                sx={{ 
                  bgcolor: 'white',
                  "& .MuiOutlinedInput-root": { borderRadius: 3 }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={!commentText.trim() || submitting}
                  sx={{ borderRadius: 2, px: 4, fontWeight: 800, textTransform: 'none' }}
                >
                  {submitting ? "Procesando..." : "Enviar Comentario"}
                </Button>
              </Box>
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 5, borderRadius: 3, fontWeight: 500 }}>
              Participa en el debate <Link to="/login" style={{ fontWeight: 800, color: 'inherit' }}>iniciando sesión</Link> en tu cuenta corporativa.
            </Alert>
          )}

          {/* LISTADO DE COMENTARIOS */}
          <Stack spacing={2.5}>
            {comments.map((c) => {
              const isOwnerOrAdmin = isAuthenticated && (
                user?.role === "admin" || 
                user?.role === "moderator" || 
                Number(user?.id) === Number(c.usuario_id)
              );

              return (
                <Fade key={c.id} in={true}>
                  <Box sx={{ 
                    p: 3, 
                    bgcolor: 'white', 
                    borderRadius: 3, 
                    border: '1px solid', 
                    borderColor: 'divider',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    position: 'relative' 
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                        @{c.autor_username || "colaborador"}
                      </Typography>
                      {isOwnerOrAdmin && (
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDeleteComment(c.id)}
                          sx={{ mt: -0.5, mr: -0.5, '&:hover': { bgcolor: 'error.lighter' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6, wordBreak: 'break-word' }}>
                      {c.contenido}
                    </Typography>
                  </Box>
                </Fade>
              );
            })}
            
            {comments.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4, fontStyle: 'italic' }}>
                Aún no hay interacciones en este hilo de conversación.
              </Typography>
            )}
          </Stack>
        </Paper>

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={4000} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2, fontWeight: 700 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Fade>
  );
}