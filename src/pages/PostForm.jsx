import React, { useEffect, useState } from "react";
import api from "../api/api";
import {
  Container,
  Card,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

export default function PostForm() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [isEdit, setIsEdit] = useState(false);

  // Cargar categorías existentes
  const loadCategorias = async () => {
    try {
      const res = await api.get("/api/categories");
      setCategorias(res.data);
    } catch {
      Swal.fire("Error", "No se pudieron cargar las categorías", "error");
    }
  };

  useEffect(() => {
    loadCategorias();

    if (postId) {
      setIsEdit(true);
      api.get(`/api/posts/${postId}`)
        .then((r) => {
          setTitulo(r.data.titulo);
          setContenido(r.data.contenido);
          if (r.data.categorias) {
            // Guardamos IDs de categorías seleccionadas
            setCategoriasSeleccionadas(r.data.categorias.map(c => c.id));
          }
        })
        .catch(() => Swal.fire("Error", "No se pudo cargar el post", "error"));
    }
  }, [postId]);

  // Toggle para los checkboxes
  const toggleCategoria = (id) => {
    setCategoriasSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

const onSubmit = async (e) => {
  e.preventDefault();

  if (!titulo.trim() || !contenido.trim()) {
    Swal.fire("Error", "Título y contenido son obligatorios", "error");
    return;
  }

  // Verificamos que haya al menos una categoría seleccionada o nueva
  if (categoriasSeleccionadas.length === 0 && !nuevaCategoria.trim()) {
    Swal.fire("Error", "Debes seleccionar o crear al menos una categoría", "error");
    return;
  }

  const payload = {
    titulo: titulo.trim(),
    contenido: contenido.trim(),
    // enviamos solo si hay categorías seleccionadas
    ...(categoriasSeleccionadas.length > 0 && { categoria_ids: categoriasSeleccionadas }),
    // enviamos solo si hay nueva categoría
    ...(nuevaCategoria.trim() && { nueva_categoria: nuevaCategoria.trim() }),
  };

  try {
    if (isEdit) {
      await api.put(`/api/posts/${postId}`, payload);
      Swal.fire("Actualizado", "Post actualizado correctamente", "success");
    } else {
      await api.post("/api/posts", payload);
      Swal.fire("Creado", "Post creado correctamente", "success");
    }
    navigate("/posts");
  } catch (err) {
    console.log(err.response?.data);
    Swal.fire("Error", err?.response?.data?.error || "Error guardando post", "error");
  }
};

  return (
    <Container sx={{ mt: 4 }}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {isEdit ? "Editar Post" : "Nuevo Post"}
        </Typography>

        <Box component="form" onSubmit={onSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            fullWidth
            margin="normal"
            inputProps={{ minLength: 3 }}
          />

          <TextField
            label="Contenido"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            required
            fullWidth
            multiline
            rows={6}
            margin="normal"
            inputProps={{ minLength: 10 }}
          />

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Categorías existentes
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", mb: 2, maxHeight: 150, overflowY: "auto", p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
            {categorias.map(c => (
              <FormControlLabel
                key={c.id}
                control={
                  <Checkbox
                    checked={categoriasSeleccionadas.includes(c.id)}
                    onChange={() => toggleCategoria(c.id)}
                  />
                }
                label={c.nombre}
              />
            ))}
          </Box>

          <TextField
            label="O escribe una nueva categoría"
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
            fullWidth
            margin="normal"
          />

          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            {isEdit ? "Actualizar" : "Crear"}
          </Button>
        </Box>
      </Card>
    </Container>
  );
}