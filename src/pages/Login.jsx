import React, { useState, useEffect } from "react";
import { 
  Container, Box, Paper, Typography, TextField, 
  Button, IconButton, InputAdornment, CircularProgress, 
  Link as MuiLink, Fade, Avatar, Alert 
} from "@mui/material";
import { Visibility, VisibilityOff, LoginOutlined } from "@mui/icons-material";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/api";
import Swal from "sweetalert2";


// LOGIN COMPONENT - Enterprise Architecture Level

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Si el usuario venía de una ruta protegida, lo devolvemos allí. Si no, al Home.
  const from = location.state?.from?.pathname || "/";
  
  // Detectar si el interceptor de API nos mando aqui por token expirado
  const isExpired = new URLSearchParams(location.search).get("expired") === "true";

  // Estados locales
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevencion de doble envío (Race Conditions)

    // Validación básica pre-vuelo
    if (!email.trim() || !password) {
      return Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Por favor, completa tus credenciales.",
        confirmButtonColor: "#1976d2"
      });
    }

    setLoading(true);
    try {
      // NORMALIZACIÓN: Los correos viajan en minúsculas al servidor
      const res = await api.post("/api/login", { 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      const { access_token } = res.data;

      // Actualizar estado global
      login(access_token);

      // Toast no intrusivo
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
      });

      await Toast.fire({
        icon: 'success',
        title: '¡Autenticación exitosa!'
      });

    // replace: true limpia el historial de login
      navigate(from, { replace: true });

    } catch (err) {
      const errorMsg = err?.response?.data?.error || 
                       err?.response?.data?.msg || 
                       "Error de comunicación con el servidor central.";

      Swal.fire({
        icon: "error",
        title: "Fallo en el acceso",
        text: errorMsg,
        confirmButtonColor: "#d32f2f",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Fade in={true} timeout={600}>
        <Box sx={{ mt: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          {/* Feedback de Sesión Expirada */}
          {isExpired && (
            <Alert severity="info" variant="filled" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
              Tu sesión ha expirado. Por favor, ingresa de nuevo.
            </Alert>
          )}

          <Paper 
            elevation={12} 
            sx={{ 
              p: 4, 
              width: "100%", 
              borderRadius: 4, 
              textAlign: "center",
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 64, height: 64, boxShadow: 3 }}>
                <LoginOutlined fontSize="large" />
              </Avatar>
            </Box>

            <Typography component="h1" variant="h4" fontWeight="900" letterSpacing={-1} gutterBottom>
              Identificarse
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Panel de Gestión de Software Corporativo
            </Typography>

            <Box component="form" onSubmit={onSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Corporativo"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                variant="outlined"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label="mostrar contraseña"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  mt: 4, 
                  mb: 2, 
                  py: 1.8, 
                  fontWeight: 800, 
                  borderRadius: 2.5,
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 16px rgba(25, 118, 210, 0.24)'
                }}
              >
                {loading ? <CircularProgress size={26} color="inherit" /> : "Acceder al Portal"}
              </Button>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  ¿Problemas con tu acceso?{" "}
                  <MuiLink 
                    component={Link} 
                    to="/register" 
                    sx={{ 
                      fontWeight: 800, 
                      textDecoration: 'none',
                      color: 'primary.main',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Crea una cuenta nueva
                  </MuiLink>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
}

