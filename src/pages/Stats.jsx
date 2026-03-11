import React, { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import {
  Container, Typography, Card, CardContent, Grid,
  Box, Skeleton, Snackbar, Alert, Divider, Fade, Stack
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import ArticleIcon from '@mui/icons-material/Article';
import CommentIcon from '@mui/icons-material/Comment';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import UpdateIcon from '@mui/icons-material/Update';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Sub-componente interno refinado para métricas de alto nivel
const StatCard = ({ title, value, icon, loading, color = "primary.main", subtitle }) => (
  <Fade in={true} timeout={500}>
    <Card 
      sx={{ 
        height: '100%', 
        borderRadius: 4, 
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
          borderColor: color,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            p: 1.5, 
            borderRadius: 3, 
            bgcolor: `${color}15`, 
            color: color 
          }}>
            {React.cloneElement(icon, { fontSize: 'medium' })}
          </Box>
          <Typography variant="caption" fontWeight={800} sx={{ color: color, bgcolor: `${color}10`, px: 1, borderRadius: 1 }}>
            LIVE
          </Typography>
        </Box>
        
        <Typography variant="subtitle2" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, letterSpacing: '0.5px' }}>
          {title.toUpperCase()}
        </Typography>

        {loading ? (
          <Skeleton variant="text" width="50%" height={48} sx={{ borderRadius: 1 }} />
        ) : (
          <Stack spacing={0.5}>
            <Typography variant="h3" fontWeight={900} letterSpacing="-1px">
              {typeof value === 'number' ? value.toLocaleString() : '0'}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {subtitle}
              </Typography>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  </Fade>
);

export default function Stats() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/stats");
      setStats(data);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || "Error de sincronización con el servicio de métricas",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      {/* HEADER SECTION */}
      <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 2.5 }}>
        <Box sx={{ bgcolor: 'primary.main', p: 1.5, borderRadius: 3, display: { xs: 'none', sm: 'flex' } }}>
          <AssessmentIcon sx={{ color: 'white', fontSize: 32 }} />
        </Box>
        <Box>
          <Typography variant="h3" fontWeight={900} letterSpacing="-2px" color="text.primary">
            Panel de Control
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Análisis de rendimiento y activos del ecosistema.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Publicaciones" 
            value={stats?.total_posts} 
            icon={<ArticleIcon />} 
            loading={loading}
            color="#1976d2"
            subtitle="Artículos totales indexados"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Interacciones" 
            value={stats?.total_comments} 
            icon={<CommentIcon />} 
            loading={loading}
            color="#2e7d32"
            subtitle="Comentarios de la comunidad"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Categorías" 
            value={stats?.total_categories} 
            icon={<CategoryIcon />} 
            loading={loading}
            color="#ed6c02"
            subtitle="Segmentos de contenido"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Comunidad" 
            value={stats?.total_users} 
            icon={<PeopleIcon />} 
            loading={loading}
            color="#9c27b0"
            subtitle="Colaboradores activos"
          />
        </Grid>

        {/* MÉTRICA ADMINISTRATIVA AVANZADA */}
        {user?.role === "admin" && (
          <Grid item xs={12}>
            <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
            <Box sx={{ mt: 2 }}>
              <StatCard 
                title="Crecimiento Semanal (Nuevos registros)" 
                value={stats?.posts_last_week} 
                icon={<UpdateIcon />} 
                loading={loading}
                color="#d32f2f"
                subtitle="Impacto de contenido en los últimos 7 días laborables."
              />
            </Box>
          </Grid>
        )}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ width: '100%', borderRadius: 3, fontWeight: 700 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}