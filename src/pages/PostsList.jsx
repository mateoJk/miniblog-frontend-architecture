import React, { useEffect, useState } from "react";
import api from "../api/api";
import {
  Card, CardContent, CardActions, Typography,
  Button, IconButton, Menu, MenuItem, Snackbar,
  Container, Chip
} from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CommentIcon from "@mui/icons-material/Comment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import MuiAlert from "@mui/material/Alert";
import Swal from "sweetalert2";

export default function PostsList() {
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuPost, setMenuPost] = useState(null);

  const load = async () => {
    try {
      const res = await api.get("/api/posts");
      setPosts(res.data);
    } catch {
      setSnackbar({ open: true, message: "No se pudieron cargar posts", severity: "error" });
    }
  };

  useEffect(() => { load(); }, []);

  const onDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar post?",
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
      await api.delete(`/api/posts/${id}`);
      await load();
      setSnackbar({ open: true, message: "Post eliminado correctamente", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Error al eliminar post", severity: "error" });
    }
  };

  const handleMenuOpen = (event, post) => {
    setAnchorEl(event.currentTarget);
    setMenuPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuPost(null);
  };

  return (
    <Container sx={{ mt: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <Typography variant="h4">Posts</Typography>
        {user && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/posts/new"
          >
            Nuevo Post
          </Button>
        )}
      </div>

      {posts.map((p) => (
        <Card key={p.id} sx={{ mb: 2, p: 1 }}>
          <CardContent>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <Typography variant="h6">{p.titulo}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Autor: {p.autor_username} — {new Date(p.fecha_creacion).toLocaleString()}
                </Typography>
              </div>
              {user && (user.role === "admin" || parseInt(user.id) === parseInt(p.usuario_id)) && (
                <IconButton onClick={(e) => handleMenuOpen(e, p)}>
                  <MoreVertIcon />
                </IconButton>
              )}
            </div>

            <Typography variant="body1" sx={{ mt: 1 }}>
              {p.contenido.slice(0, 300)}{p.contenido.length > 300 ? "..." : ""}
            </Typography>

            {/* CATEGORÍAS COMO CHIPS */}
            {p.categorias && p.categorias.length > 0 && (
              <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Categorías:
                  </Typography>
                {p.categorias.map((cat, i) => (
                  <Chip
                    key={i}
                    label={cat.nombre || cat} // muestra solo el nombre
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </div>
            )}
          </CardContent>

          <CardActions>
            <Button
              size="small"
              startIcon={<VisibilityIcon />}
              component={Link}
              to={`/posts/${p.id}`}
            >
              Ver
            </Button>
            <Button
              size="small"
              startIcon={<CommentIcon />}
              component={Link}
              to={`/posts/${p.id}`}
            >
              Comentarios
            </Button>
          </CardActions>
        </Card>
      ))}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem component={Link} to={`/posts/${menuPost?.id}/edit`} onClick={handleMenuClose}>
          Editar
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onDelete(menuPost.id);
          }}
          sx={{ color: "error.main" }}
        >
          Eliminar
        </MenuItem>
      </Menu>

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