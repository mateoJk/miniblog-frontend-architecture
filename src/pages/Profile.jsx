import React, { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import {
  Container, Card, CardContent, Typography, Divider, 
  Box, Avatar, Chip, Skeleton, Fade, Paper,
  List, ListItem, ListItemText, ListItemIcon
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import Swal from "sweetalert2";
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import ShieldIcon from '@mui/icons-material/Shield';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const resUser = await api.get(`/api/users/${user.id}`);
      setProfile(resUser.data);
    } catch (err) {
      Swal.fire({
        title: "Error de Perfil",
        text: "No pudimos sincronizar tus datos con el servidor.",
        icon: "error",
        confirmButtonColor: "#3085d6"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Formateador de fechas
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Determinar color del rol para el Chip
  const getRoleColor = (role) => {
    const roles = {
      admin: "error",
      moderator: "warning",
      user: "primary"
    };
    return roles[role] || "default";
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 2 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <Fade in={true} timeout={800}>
        <Box>
          <Paper elevation={4} sx={{ borderRadius: 4, overflow: 'hidden' }}>
            {/* Header del Perfil con Identidad Visual */}
            <Box sx={{ 
              bgcolor: 'primary.main', 
              height: 100, 
              display: 'flex', 
              justifyContent: 'center', 
              position: 'relative',
              mb: 6
            }}>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  fontSize: '2.5rem', 
                  bgcolor: 'white', 
                  color: 'primary.main',
                  position: 'absolute',
                  bottom: -50,
                  border: '4px solid white',
                  boxShadow: 3
                }}
              >
                {profile?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </Box>

            <CardContent sx={{ textAlign: 'center', pt: 0 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {profile?.username}
              </Typography>
              <Chip 
                label={profile?.role?.toUpperCase()} 
                color={getRoleColor(profile?.role)} 
                size="small" 
                sx={{ fontWeight: 'bold', px: 2, mb: 3 }} 
              />
              
              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                  INFORMACIÓN DE LA CUENTA
                </Typography>
              </Divider>

              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <ListItem>
                  <ListItemIcon><PersonIcon color="action" /></ListItemIcon>
                  <ListItemText 
                    primary="Nombre de Usuario" 
                    secondary={profile?.username} 
                    secondaryTypographyProps={{ fontWeight: 'medium', color: 'text.primary' }}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon><EmailIcon color="action" /></ListItemIcon>
                  <ListItemText 
                    primary="Correo Electrónico" 
                    secondary={profile?.email} 
                    secondaryTypographyProps={{ fontWeight: 'medium', color: 'text.primary' }}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon><ShieldIcon color="action" /></ListItemIcon>
                  <ListItemText 
                    primary="Nivel de Acceso" 
                    secondary={profile?.role === 'admin' ? 'Administrador Total' : 'Usuario Estándar'} 
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon><CalendarMonthIcon color="action" /></ListItemIcon>
                  <ListItemText 
                    primary="Miembro desde" 
                    secondary={formatDate(profile?.fecha_creacion)} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Paper>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
            ID de Usuario: <strong>{profile?.id}</strong> • Estado: <strong>Activo</strong>
          </Typography>
        </Box>
      </Fade>
    </Container>
  );
}