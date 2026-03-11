import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

// Estilos de terceros (Vendor CSS)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// Arquitectura Core
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";

/**
 * Enterprise Theme Configuration
 * Centraliza la paleta de colores de componentes.
 */
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      dark: "#115293",
      lighter: "#e3f2fd",
    },
    success: {
      main: "#2e7d32",
      lighter: "#e8f5e9",
    },
    background: {
      default: "#f8f9fa",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalización de estilos global */}
      <Router>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);