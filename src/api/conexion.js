import axios from "axios";

const redBoxApi = axios.create({
    baseURL: "http://192.168.1.107:8000/api",
});

// Usuarios
export const getUsuarios = () => redBoxApi.get('/usuarios');
export const getUsuario = () => getUsuarios();

// Registro de usuario
export const registrarUsuario = (datos) => redBoxApi.post('/registro/', datos);

// Login
export const loginUsuario = (correo, contrasena) => 
    redBoxApi.post('/login/', { correo, contrasena });