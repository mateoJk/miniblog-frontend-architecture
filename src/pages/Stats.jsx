import React, { useEffect, useState } from "react";
import api from "../api/api";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { useAuth } from "../contexts/AuthContext";

export default function Stats() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  const loadStats = async () => {
    try {
      const res = await api.get("/api/stats");
      setStats(res.data);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || "Error al cargar estadísticas",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Estadísticas
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#f5f5f5" }}>
            <CardContent>
              <Typography variant="subtitle1">Total de Posts</Typography>
              <Typography variant="h5">{stats.total_posts}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#f5f5f5" }}>
            <CardContent>
              <Typography variant="subtitle1">Total de Comentarios</Typography>
              <Typography variant="h5">{stats.total_comments}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: "#f5f5f5" }}>
            <CardContent>
            <Typography variant="subtitle1">Total de Categorias</Typography>
            <Typography variant="h5">{stats.total_categories ?? 0}</Typography>
            </CardContent>
        </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: "#f5f5f5" }}>
            <CardContent>
            <Typography variant="subtitle1">Total de Usuarios</Typography>
            <Typography variant="h5">{stats.total_users ?? 0}</Typography>
            </CardContent>
        </Card>
        </Grid>

        {user?.role === "admin" && (
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#f5f5f5" }}>
              <CardContent>
                <Typography variant="subtitle1">Posts Última Semana</Typography>
                <Typography variant="h5">{stats.posts_last_week}</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

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