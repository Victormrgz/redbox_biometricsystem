import axios from "axios";

const redBoxApi = axios.create({
    baseURL: "http://192.168.1.107:8000/api",
});

// Usuarios
export const getUsuarios = () => redBoxApi.get('/usuarios');

// Obtener un usuario por ID
export const getUsuarioById = async (id) => {
    const respuesta = await redBoxApi.get(`/usuarios/${id}/`);
    return respuesta.data;
};

// Registro de usuario
export const registrarUsuario = async (datos) => {
    const respuesta = await redBoxApi.post('/registro/', datos);
    return respuesta.data; 
};

// Login
// En tu archivo de api/conexion.js
export const loginUsuario = async (credenciales) => {
    const res = await redBoxApi.post('/login/', credenciales);
    return res.data; 
};