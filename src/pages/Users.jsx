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

export default function Users() {
  const [users, setUsers] = useState([]);
  const { user } = useAuth();

  const loadUsers = async () => {
    try {
      const res = await api.get("/api/users");
      setUsers(res.data);
    } catch {
      Swal.fire("Error", "No se pudieron cargar los usuarios", "error");
    }
  };

  useEffect(() => {
    if (user?.role === "admin") loadUsers();
  }, [user]);

  const onDelete = async (userId, username) => {
    const result = await Swal.fire({
      title: `¿Eliminar usuario ${username}?`,
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/users/${userId}`);
      Swal.fire("Eliminado", "Usuario eliminado correctamente", "success");
      loadUsers();
    } catch {
      Swal.fire("Error", "No se pudo eliminar el usuario", "error");
    }
  };

  const onChangeRole = async (userId, username, currentRole) => {
    const { value: newRole } = await Swal.fire({
      title: `Cambiar rol de ${username}`,
      input: "select",
      inputOptions: {
        admin: "admin",
        moderator: "moderator",
        user: "user",
      },
      inputValue: currentRole,
      showCancelButton: true,
      inputValidator: (value) => !value && "Debes seleccionar un rol",
    });

    if (!newRole || newRole === currentRole) return;

    try {
      await api.patch(`/api/users/${userId}/role`, { role: newRole });
      Swal.fire("Actualizado", "Rol actualizado correctamente", "success");
      loadUsers();
    } catch {
      Swal.fire("Error", "No se pudo actualizar el rol", "error");
    }
  };

  if (user?.role !== "admin") {
    return (
      <Container sx={{ mt: 4 }}>
        <h3>No tienes permisos para ver esta página</h3>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <h3>Usuarios</h3>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre de usuario</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="warning"
                    size="small"
                    onClick={() => onChangeRole(u.id, u.username, u.role)}
                    sx={{ mr: 1 }}
                  >
                    Cambiar rol
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => onDelete(u.id, u.username)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}