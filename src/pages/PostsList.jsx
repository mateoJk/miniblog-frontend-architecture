import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../api/api";
import {
  Card, CardContent, CardActions, Typography,
  Button, IconButton, Menu, MenuItem, Snackbar,
  Container, Chip, Box, Skeleton, Alert, Divider, Fade, Stack, Avatar
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CommentIcon from "@mui/icons-material/Comment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import ConfirmModal from "../components/ConfirmModal"; 
import FilterListIcon from "@mui/icons-material/FilterList";

export default function PostsList() {
  const { user } = useAuth();
  const navigate = useNavigate(); // Hook para navegación programática empresarial
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  /**
   * DATA FETCHING - Resilient Pattern
   */
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/posts");
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: "Error de sincronización con el servicio de datos", 
        severity: "error" 
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  /**
   * BUSINESS LOGIC 
   */
  const categories = useMemo(() => {
    const allCats = posts.flatMap(p => p.categorias?.map(c => c.nombre || c) || []);
    return ["Todas", ...new Set(allCats)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "Todas") return posts;
    return posts.filter(p => 
      p.categorias?.some(c => (c.nombre || c) === selectedCategory)
    );
  }, [posts, selectedCategory]);

  /**
   * ACTION HANDLERS - Enterprise Grade
   */
  const handleConfirmDelete = async () => {
    if (!selectedPost) return;
    try {
      await api.delete(`/api/posts/${selectedPost.id}`);
      setPosts(prev => prev.filter(p => p.id !== selectedPost.id));
      setSnackbar({ open: true, message: "Entrada eliminada del sistema", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: "Error crítico: No se pudo procesar la eliminación", severity: "error" });
    } finally {
      setOpenDeleteModal(false);
      setSelectedPost(null);
    }
  };

  const handleOpenMenu = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Navegación segura para edición
  const handleEditNavigation = () => {
    if (!selectedPost?.id) return; // Cláusula de guarda
    handleCloseMenu();
    navigate(`/posts/${selectedPost.id}/edit`);
  };

  const canManagePost = (post) => {
    if (!user) return false;
    return user.role === "admin" || Number(user.id) === Number(post.usuario_id);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      
      {/* HEADER SECTION */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h3" fontWeight={900} letterSpacing="-2px" gutterBottom>
              Explorar Feed
            </Typography>
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              Gestión y visualización de contenido corporativo.
            </Typography>
          </Box>
          {user && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              component={Link} 
              to="/posts/new"
              sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 800, textTransform: "none", boxShadow: 3 }}
            >
              Nueva Publicación
            </Button>
          )}
        </Box>

        {/* CATEGORY SELECTOR */}
        {!loading && posts.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FilterListIcon color="action" />
            <Stack 
              direction="row" 
              spacing={1.5} 
              sx={{ 
                overflowX: "auto", 
                pb: 1, 
                width: '100%',
                '&::-webkit-scrollbar': { display: 'none' } 
              }}
            >
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  onClick={() => setSelectedCategory(cat)}
                  color={selectedCategory === cat ? "primary" : "default"}
                  variant={selectedCategory === cat ? "filled" : "outlined"}
                  sx={{ 
                    fontWeight: 700, 
                    px: 1.5,
                    borderRadius: 2,
                    transition: "0.2s",
                    '&:hover': { transform: "scale(1.05)" } 
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      {/* LISTING SECTION */}
      <Box sx={{ minHeight: "40vh" }}>
        {loading ? (
          [1, 2, 3].map((i) => (
            <Box key={i} sx={{ mb: 4 }}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4, mb: 1 }} />
              <Skeleton width="60%" height={30} />
            </Box>
          ))
        ) : filteredPosts.length === 0 ? (
          <Fade in={true}>
            <Alert severity="info" variant="outlined" sx={{ borderRadius: 4, py: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6" fontWeight={700}>
                No se encontraron resultados para "{selectedCategory}"
              </Typography>
            </Alert>
          </Fade>
        ) : (
          filteredPosts.map((p) => (
            <Fade key={p.id} in={true} timeout={400}>
              <Card 
                sx={{ 
                  mb: 4, 
                  borderRadius: 5, 
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                  transition: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": { 
                    boxShadow: "0 20px 40px rgba(0,0,0,0.08)", 
                    borderColor: "primary.main",
                    transform: "translateY(-4px)"
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'secondary.light', fontWeight: 800, fontSize: '0.8rem' }}>
                        {p.autor_username?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight={900} letterSpacing="-0.5px">
                          {p.titulo}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          @{p.autor_username} • {new Date(p.fecha_creacion).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    {canManagePost(p) && (
                      <IconButton onClick={(e) => handleOpenMenu(e, p)} sx={{ bgcolor: 'action.hover' }}>
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </Box>

                  <Typography variant="body1" sx={{ mt: 3, color: "text.primary", lineHeight: 1.8, fontSize: "1.05rem", opacity: 0.9 }}>
                    {p.contenido.length > 250 ? `${p.contenido.substring(0, 250)}...` : p.contenido}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mt: 3, flexWrap: "wrap", gap: 1 }}>
                    {p.categorias?.map((cat, i) => (
                      <Chip 
                        key={i} 
                        label={cat.nombre || cat} 
                        size="small" 
                        sx={{ borderRadius: 1.5, fontWeight: 700, fontSize: "0.7rem", bgcolor: 'grey.100' }} 
                      />
                    ))}
                  </Stack>
                </CardContent>
                
                <Divider sx={{ borderStyle: 'dashed' }} />

                <CardActions sx={{ px: 3, py: 2, justifyContent: 'space-between', bgcolor: 'rgba(0,0,0,0.01)' }}>
                  <Box>
                    <Button size="small" startIcon={<VisibilityIcon />} component={Link} to={`/posts/${p.id}`} sx={{ fontWeight: 800, textTransform: "none", borderRadius: 2 }}>
                      Ver Detalles
                    </Button>
                    <Button size="small" startIcon={<CommentIcon />} component={Link} to={`/posts/${p.id}`} color="inherit" sx={{ fontWeight: 800, textTransform: "none", ml: 1, borderRadius: 2 }}>
                      Feedback
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Fade>
          ))
        )}
      </Box>

      {/* OVERLAYS & MODALS */}
      <Menu 
        anchorEl={anchorEl} 
        open={Boolean(anchorEl)} 
        onClose={handleCloseMenu}
        TransitionComponent={Fade}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 200, mt: 1, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' } }}
      >
        <MenuItem onClick={handleEditNavigation} sx={{ py: 1.5, fontWeight: 600 }}>
          Editar Publicación
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => { handleCloseMenu(); setOpenDeleteModal(true); }} 
          sx={{ color: "error.main", py: 1.5, fontWeight: 700 }}
        >
          Eliminar del sistema
        </MenuItem>
      </Menu>

      <ConfirmModal 
        show={openDeleteModal}
        onHide={() => setOpenDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Acción Crítica"
        message={`¿Está seguro de eliminar "${selectedPost?.titulo}"? Esta operación no se puede deshacer.`}
        confirmText="Eliminar permanentemente"
        confirmColor="error"
      />

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={5000} 
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2, fontWeight: 700 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Container>
  );
}