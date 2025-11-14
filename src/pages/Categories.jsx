import React, { useEffect, useState } from "react";
import api from "../api/api";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import Swal from "sweetalert2";
import { useAuth } from "../contexts/AuthContext";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const { user } = useAuth();

  const loadCategories = async () => {
    try {
      const res = await api.get("/api/categories");
      setCategories(res.data);
    } catch {
      Swal.fire("Error", "No se pudieron cargar las categorías", "error");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const onDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar categoría?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/categories/${id}`);
      Swal.fire("Eliminado", "Categoría eliminada correctamente", "success");
      loadCategories();
    } catch {
      Swal.fire("Error", "No se pudo eliminar la categoría", "error");
    }
  };

  const onEdit = async (category) => {
    const { value: newName } = await Swal.fire({
      title: "Editar categoría",
      input: "text",
      inputLabel: "Nombre de la categoría",
      inputValue: category.nombre,
      showCancelButton: true,
      inputValidator: (value) => !value && "El nombre no puede estar vacío",
    });

    if (!newName) return;

    try {
      await api.put(`/api/categories/${category.id}`, { nombre: newName });
      Swal.fire("Actualizado", "Categoría actualizada correctamente", "success");
      loadCategories();
    } catch {
      Swal.fire("Error", "No se pudo actualizar la categoría", "error");
    }
  };

  const onAdd = async () => {
    const { value: name } = await Swal.fire({
      title: "Agregar nueva categoría",
      input: "text",
      inputLabel: "Nombre de la categoría",
      showCancelButton: true,
      inputValidator: (value) => !value && "El nombre no puede estar vacío",
    });

    if (!name) return;

    try {
      await api.post("/api/categories", { nombre: name });
      Swal.fire("Creado", "Categoría agregada correctamente", "success");
      loadCategories();
    } catch {
      Swal.fire("Error", "No se pudo agregar la categoría", "error");
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3>Categorías</h3>
        {(user?.role === "admin" || user?.role === "moderator") && (
          <Button variant="contained" color="success" size="small" onClick={onAdd}>
            Agregar categoría
          </Button>
        )}
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.nombre}</TableCell>
                <TableCell>
                  {(user?.role === "admin" || user?.role === "moderator") && (
                    <Button
                      variant="outlined"
                      color="warning"
                      size="small"
                      onClick={() => onEdit(c)}
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                  )}
                  {user?.role === "admin" && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => onDelete(c.id)}
                    >
                      Eliminar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}