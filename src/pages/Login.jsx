import React, { useState } from "react";
import api from "../api/api";
import { useAuth } from "../contexts/AuthContext";
import { Container, Form, Button, Card } from "react-bootstrap";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/login", { email, password });
      const token = res.data.access_token;

      login(token);

      // SweetAlert correcto
      Swal.fire({
        icon: "success",
        title: "Login correcto",
        showConfirmButton: false,
        timer: 1500,
      });

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      // Extraer mensaje desde backend
      const backendMessage =
        err?.response?.data?.error ||
        err?.response?.data?.msg;

      const finalMessage =
        backendMessage || "Usuario o contraseña inválidos";

      // SweetAlert de error
      Swal.fire({
        icon: "error",
        title: finalMessage,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  return (
    <Container className="d-flex justify-content-center">
      <Card style={{ maxWidth: 520 }} className="p-3 mt-4">
        <h4>Login</h4>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button type="submit">Entrar</Button>
        </Form>
      </Card>
    </Container>
  );
}