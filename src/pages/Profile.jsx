import React, { useEffect, useState } from "react";
import api from "../api/api";
import {
  Card, CardContent, Typography,
  Container, Divider
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import Swal from "sweetalert2";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  const loadProfile = async () => {
    try {
      const resUser = await api.get(`/api/users/${user.id}`);
      setProfile(resUser.data);
    } catch {
      Swal.fire("Error", "No se pudo cargar la información del perfil", "error");
    }
  };

  React.useEffect(() => {
    loadProfile();
  }, [user.id]);

  if (!profile) return null;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date) ? "-" : date.toLocaleString();
  };

  return (
    <Container sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
      <Card sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h4" gutterBottom align="center">
          Mi Perfil
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle1" sx={{ mt: 2 }}>Nombre de usuario</Typography>
        <Typography variant="body1">{profile.username}</Typography>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>Email</Typography>
        <Typography variant="body1">{profile.email}</Typography>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>Rol</Typography>
        <Typography variant="body1" sx={{ textTransform: "capitalize" }}>
          {profile.role}
        </Typography>
      </Card>
    </Container>
  );
}