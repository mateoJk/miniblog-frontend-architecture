import React, { useState } from "react";
import api from "../api/api";
import { Container, Form, Button, Card } from "react-bootstrap";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/register", { username, email, password, role });
      
      // Alerta de éxito y redirección al login
      await Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "Usuario creado correctamente. Serás redirigido al login.",
        confirmButtonText: "OK"
      });

      navigate("/login"); // redirige al login
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.details || "Error en el registro";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
        confirmButtonText: "Aceptar"
      });
    }
  };

  return (
    <Container className="d-flex justify-content-center">
      <Card style={{ maxWidth: 520 }} className="p-3 mt-4">
        <h4>Registro</h4>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>Nombre</Form.Label>
            <Form.Control value={username} onChange={(e) => setUsername(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Rol</Form.Label>
            <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">user</option>
              <option value="moderator">moderator</option>
              <option value="admin">admin</option>
            </Form.Select>
          </Form.Group>
          <Button type="submit">Registrar</Button>
        </Form>
      </Card>
    </Container>
  );
}