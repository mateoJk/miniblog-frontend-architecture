import axios from "axios";

/**
 * API Service Configuration - Enterprise Grade
 * Centraliza la comunicación, seguridad y resiliencia de peticiones.
 */

export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://172.26.121.196:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000, // Aumentado a 20s para operaciones pesadas de IA/Análisis
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
});

// Bandera para evitar múltiples redirecciones en ráfagas de errores 401
let isRedirecting = false;

/**
 * INTERCEPTOR DE PETICIÓN
 * Inyección dinámica de identidad y trazabilidad.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * INTERCEPTOR DE RESPUESTA
 * Normalización de flujos de error y gestión de sesión.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // GESTIÓN DE EXPIRACIÓN DE SESIÓN (401)
    if (response?.status === 401) {
      if (!window.location.pathname.includes("/login") && !isRedirecting) {
        isRedirecting = true;
        localStorage.removeItem("access_token");
        
        // Redirección atómica
        window.location.replace("/login?expired=true");
      }
      return Promise.reject(error);
    }

    // Reintento automático en errores de red o servidor (503)
    // Solo reintentamos si es una petición GET y no ha excedido los reintentos.
    config.retryCount = config.retryCount || 0;
    if (
      (error.code === 'ECONNABORTED' || !response || response.status === 503) && 
      config.method === 'get' && 
      config.retryCount < 2
    ) {
      config.retryCount += 1;
      const delay = config.retryCount * 1000; // Delay exponencial simple
      
      return new Promise(resolve => 
        setTimeout(() => resolve(api(config)), delay)
      );
    }

    // MANEJO DE CANCELACIONES
    if (axios.isCancel(error)) {
      console.warn("Petición cancelada por el usuario o limpieza de componente.");
      return new Promise(() => {}); // Retornamos promesa pendiente para silenciar el error en el catch
    }

    // LOG DE ERRORES CRÍTICOS EN CONSOLA
    if (process.env.NODE_ENV === 'development') {
      console.error(`[API Error] ${config.method?.toUpperCase()} ${config.url}:`, error.message);
    }

    return Promise.reject(error);
  }
);

export default api;