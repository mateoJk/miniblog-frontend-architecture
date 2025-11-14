import React, { useEffect, useState } from "react";
import api from "../api/api";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Snackbar,
  IconButton,
  Box,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import MuiAlert from "@mui/material/Alert";
import Swal from "sweetalert2";
import DeleteIcon from "@mui/icons-material/Delete";

export default function PostDetail() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [contenido, setContenido] = useState("");
  const { user } = useAuth();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const load = async () => {
    try {
      const res = await api.get(`/api/posts/${postId}`);
      setPost(res.data);
      const c = await api.get(`/api/posts/${postId}/comments`);
      setComments(c.data);
    } catch {
      setSnackbar({
        open: true,
        message: "Error cargando post o comentarios",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    load();
  }, [postId]);

  const submitComment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/posts/${postId}/comments`, { contenido });
      setContenido("");
      await load();
      setSnackbar({
        open: true,
        message: "Comentario agregado correctamente",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Error creando comentario",
        severity: "error",
      });
    }
  };

  const deleteComment = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar comentario?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/comments/${id}`);
      await load();
      setSnackbar({
        open: true,
        message: "Comentario eliminado",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Error eliminando comentario",
        severity: "error",
      });
    }
  };

  if (!post) return <Container sx={{ mt: 4 }}>Cargando...</Container>;

  return (
    <Container sx={{ mt: 4 }}>
      {/* Post */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {post.titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Autor: {post.autor_username} — {new Date(post.fecha_creacion).toLocaleString()}
          </Typography>
          <Typography variant="body1">{post.contenido}</Typography>
        </CardContent>
      </Card>

      {/* Comentarios */}
      <Card sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          💬 Comentarios ({comments.length})
        </Typography>

        {/* Formulario de comentario */}
        {user && (
          <Box component="form" onSubmit={submitComment} sx={{ mb: 2 }}>
            <TextField
              label="Escribe un comentario..."
              multiline
              rows={3}
              fullWidth
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" sx={{ mt: 1 }}>
              Enviar
            </Button>
          </Box>
        )}
        {!user && <Typography>Inicia sesión para comentar.</Typography>}

        {/* Lista de comentarios */}
        {comments.map((c) => (
          <Card key={c.id} sx={{ mb: 1, p: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Box>
                <Typography variant="subtitle2">
                  {c.autor_username || `Usuario #${c.usuario_id}`}
                </Typography>
                <Typography variant="body2">{c.contenido}</Typography>
              </Box>
              {user && (user.role === "admin" || user.role === "moderator" || parseInt(user.id) === parseInt(c.usuario_id)) && (
                <IconButton color="error" onClick={() => deleteComment(c.id)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </Card>
        ))}
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <MuiAlert elevation={6} variant="filled" severity={snackbar.severity}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
}