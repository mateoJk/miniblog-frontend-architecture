import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, username, email, role, exp }
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const claims = jwtDecode(token);
        // claims.sub puede ser string id; conviértelo a número si querés
        setUser({
          id: claims.sub || claims.user_id || null,
          username: claims.username || claims.name,
          email: claims.email,
          role: claims.role,
          exp: claims.exp,
        });
      } catch (err) {
        console.warn("Token inválido:", err);
        localStorage.removeItem("access_token");
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("access_token", token);
    const claims = jwtDecode(token);
    setUser({
      id: claims.sub || claims.user_id || null,
      username: claims.username || claims.name,
      email: claims.email,
      role: claims.role,
      exp: claims.exp,
    });
    navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    navigate("/login");
  };

  const value = { user, login, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}