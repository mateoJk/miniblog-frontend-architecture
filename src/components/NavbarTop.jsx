import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function NavbarTop() {
  const { user, logout } = useAuth();

  return (
    <Navbar bg="light" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/">Miniblog</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/posts">Posts</Nav.Link>
            {(user?.role === "admin") && <Nav.Link as={Link} to="/users">Usuarios</Nav.Link>}
            {(user?.role === "admin" || user?.role === "moderator") && (
              <Nav.Link as={Link} to="/categories">Categorías</Nav.Link>
            )}
            {(user?.role === "admin" || user?.role === "moderator") && (
              <Nav.Link as={Link} to="/stats">Estadísticas</Nav.Link>
            )}
          </Nav>

          <Nav>
            {!user ? (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            ) : (
              <>
                <Navbar.Text className="me-2">Hola, {user.username} ({user.role})</Navbar.Text>
                <Nav.Link as={Link} to="/profile" className="me-2">Mi perfil</Nav.Link>
                <Button variant="outline-secondary" size="sm" onClick={logout}>Logout</Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}