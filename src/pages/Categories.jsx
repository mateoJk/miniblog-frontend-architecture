import React, { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import {
  Container, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Typography,
  Box, IconButton, Tooltip, LinearProgress, Fade, Stack, Chip
} from "@mui/material";
import Swal from "sweetalert2";
import { useAuth } from "../contexts/AuthContext";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CategoryIcon from '@mui/icons-material/Category';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Permisos centralizados con lógica semántica
  const canEdit = user?.role === "admin" || user?.role === "moderator";
  const canDelete = user?.role === "admin";

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/categories");
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      Swal.fire({
        title: "Error de Sistema",
        text: "No se pudo sincronizar el catálogo de categorías con el servidor.",
        icon: "error",
        confirmButtonColor: "#3085d6"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const onAdd = async () => {
    const { value: name } = await Swal.fire({
      title: "Nueva Categoría",
      input: "text",
      inputLabel: "Asigne un nombre descriptivo",
      inputPlaceholder: "Ej: Desarrollo, Negocios...",
      showCancelButton: true,
      confirmButtonColor: "#2e7d32",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Registrar Categoría",
      inputValidator: (value) => !value.trim() && "El nombre es mandatorio",
    });

    if (!name) return;

    try {
      const res = await api.post("/api/categories", { nombre: name.trim() });
      setCategories(prev => [...prev, res.data]); 
      Swal.fire("Éxito", "Categoría integrada correctamente.", "success");
    } catch (err) {
      Swal.fire("Conflicto", "No se pudo registrar. Es posible que el nombre ya exista.", "error");
    }
  };

  const onEdit = async (category) => {
    const { value: newName } = await Swal.fire({
      title: "Actualizar Nombre",
      input: "text",
      inputValue: category.nombre,
      showCancelButton: true,
      confirmButtonColor: "#ed6c02",
      inputValidator: (value) => !value.trim() && "El nombre no puede estar vacío",
    });

    if (!newName || newName.trim() === category.nombre) return;

    try {
      const res = await api.put(`/api/categories/${category.id}`, { nombre: newName.trim() });
      setCategories(prev => prev.map(c => c.id === category.id ? res.data : c));
      Swal.fire("Actualizado", "Los cambios han sido aplicados.", "success");
    } catch (err) {
      Swal.fire("Error", "La actualización falló en el servidor central.", "error");
    }
  };

  const onDelete = async (id, name) => {
    const result = await Swal.fire({
      title: `¿Eliminar "${name}"?`,
      text: "Esta acción es irreversible y puede afectar publicaciones existentes.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      confirmButtonText: "Confirmar Eliminación",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/categories/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
      Swal.fire("Eliminado", "El registro ha sido purgado del sistema.", "success");
    } catch (err) {
      const errorMsg = err.response?.status === 400 
        ? "Integridad Protegida: Existen publicaciones vinculadas a esta categoría." 
        : "Fallo en la comunicación con el servidor.";
      Swal.fire("Acción Denegada", errorMsg, "error");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Fade in={true} timeout={600}>
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ bgcolor: 'primary.main', p: 1, borderRadius: 2, display: 'flex' }}>
                <CategoryIcon sx={{ color: 'white', fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={900} letterSpacing="-1px">Categorías</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Gestión del catálogo de clasificación de contenido.
                </Typography>
              </Box>
            </Stack>
            
            {canEdit && (
              <Button 
                variant="contained" 
                color="success" 
                startIcon={<AddCircleOutlineIcon />}
                onClick={onAdd}
                sx={{ borderRadius: 2, px: 3, fontWeight: 800, textTransform: 'none' }}
              >
                Nueva Categoría
              </Button>
            )}
          </Box>

          <TableContainer 
            component={Paper} 
            sx={{ 
              borderRadius: 4, 
              overflow: 'hidden', 
              boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            {loading && <LinearProgress color="success" sx={{ height: 4 }} />}
            <Table>
              <TableHead sx={{ bgcolor: "grey.50" }}>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
                      NOMBRE DE CATEGORÍA
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
                      ACCIONES GESTIÓN
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ py: 2.5 }}>
                      <Typography variant="body1" fontWeight={700} color="text.primary">
                        {c.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {canEdit && (
                          <Tooltip title="Editar entrada">
                            <IconButton 
                              size="small"
                              sx={{ color: 'warning.main', bgcolor: 'warning.lighter', '&:hover': { bgcolor: 'warning.light', color: 'white' } }} 
                              onClick={() => onEdit(c)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canDelete && (
                          <Tooltip title="Eliminar definitivamente">
                            <IconButton 
                              size="small"
                              sx={{ color: 'error.main', bgcolor: 'error.lighter', '&:hover': { bgcolor: 'error.light', color: 'white' } }} 
                              onClick={() => onDelete(c.id, c.nombre)}
                            >
                              <DeleteSweepIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {!canEdit && (
                          <Chip label="Solo lectura" size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                
                {!loading && categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ py: 8 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        No se han encontrado categorías registradas en el catálogo central.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="caption" color="text.disabled" fontWeight={600}>
              Total: {categories.length} categorías activas
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Container>
  );
}