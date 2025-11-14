# E.F.I – Práctica Profesionalizante I (JavaScript)

## Frontend con React + JWT + CRUD (Posts)

## Integrantes del Equipo

- **Mateo Johnston**
- **Federico Ramirez**
- **Juan Laporte**

## Backend (API Flask)

URL del backend provisto por la cátedra:  
**https://github.com/mateoJk/efi_segundo_semestre.git**

## Descripción del Proyecto

Este proyecto es una aplicación web desarrollada en **React** que consume una API en **Flask** utilizando **JWT** para autenticación.  
Incluye un CRUD completo de **posts**, manejo de roles, rutas protegidas y una interfaz visual moderna y simple

## Objetivos

- Implementar autenticación con JWT (Bearer Token)
- Crear, listar, editar y eliminar posts
- Gestionar roles (admin / user)
- Proteger rutas según permisos
- Presentar una interfaz clara, simple

## Tecnologías Utilizadas

- React 18+
- React Router DOM
- Context API (AuthContext)
- JWT Decode
- Material UI / React Bootstrap
- SweetAlert2 / Toasts
- API Flask (externa)

## Funcionalidades

### Autenticación
- Registro con: name, email, password y rol
- Inicio de sesión y obtención del JWT
- Decodificación del token
- Manejo de sesión con AuthContext
- Logout limpiando token y usuario

### CRUD de Posts
- Crear publicaciones
- Editar publicaciones
- Eliminar publicaciones
- Listar publicaciones
- Datos: título, contenido, autor

### Seguridad y Roles
- Validación de token en rutas privadas
- Expiración del token
- Roles:
  - **admin**: acceso ampliado
  - **user**: solo gestiona sus propios posts y reviews
  - **moderator**: gestiona posts y comentarios de usuarios

### Interfaz de Usuario
- UI simple y sencilla
- Formularios con validaciones
- Navegación clara mediante navbar
- Alertas visuales de error y éxito

## Estructura del Proyecto

```
/src
 ├── api/
 │     └── api.js
 │
 ├── components/
 │     ├── ConfirmModal.jsx
 │     ├── NavbarTop.jsx
 │     └── ProtectedRoute.jsx
 │
 ├── contexts/
 │     └── AuthContext.jsx
 │
 ├── pages/
 │     ├── Categories.jsx
 │     ├── Login.jsx
 │     ├── PostDetail.jsx
 │     ├── PostForm.jsx
 │     ├── PostsList.jsx
 │     ├── Profile.jsx
 │     ├── Register.jsx
 │     ├── Stats.jsx
 │     └── Users.jsx
 │
 ├── App.jsx
 ├── App.css
 
 ├── index.css
 ├── index.js
 ├── logo.svg
 ├── reportWebVitals.js
 └── setupTests.js

```

## Instalación y Ejecución

### 1. Clonar el repositorio
```
git clone https://github.com/mateoJk/efi_js_miniblog
```

### 2. Entrar al directorio
```
cd efi_js_miniblog
```

### 3. Instalar dependencias
```
npm install
```


### 5. Ejecutar en modo desarrollo
```
npm start
```
REACT_APP_API_URL=http://localhost:5000/api

Abrir en navegador:  
http://localhost:3000 



## Buenas Prácticas Implementadas

- Componentes reutilizables
- Código modular organizado por responsabilidades
- Manejo de sesión global con Context API
- Hooks para comunicación con API
- Validaciones en formularios
- Manejo de errores y mensajes al usuario
- Control de permisos por rol
- Rutas protegidas con React Router

## Conclusión

El proyecto demuestra dominio en React, JWT, consumo de APIs, CRUDs, manejo de sesiones, roles de usuario y diseño simple y claro.  

