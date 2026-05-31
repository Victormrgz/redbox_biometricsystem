import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const redBoxApi = axios.create({
    baseURL: "http://192.168.1.110:8000/api",
});

// Usuarios
export const getUsuarios = () => redBoxApi.get('/usuarios');

// Obtener un usuario por ID
export const getUsuarioById = async (id) => {
    const token = await AsyncStorage.getItem('userToken');
    const respuesta = await redBoxApi.get(`/perfil/${id}/`, {
        headers: { Authorization: `Token ${token}` }
    });
    return respuesta.data;
};

// Registro de usuario
export const registrarUsuario = async (datos) => {
    const respuesta = await redBoxApi.post('/registro/', datos);
    return respuesta.data; 
};

// Login
export const loginUsuario = async (credenciales) => {
    const res = await redBoxApi.post('/login/', credenciales);
    return res.data; 
};

//Crear clases
export const crearClases = async (datos) => {
    const respuesta = await redBoxApi.post('/clases/', datos);
    return respuesta.data; 
};

//Eliminar Clases
export const cancelarClase = async (claseId) => {
    try {
        const response = await api.post(`/clases/${claseId}/cancelar/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};


//obtener reservas
export const getReservasUsuario = async (userId) => {

    const respuesta = await redBoxApi.get(`/clases/?id_usuario=${userId}`);
    return respuesta.data; 
};

// Registrar pago (solo admin)
export const registrarPago = async (datos, token) => {
    const respuesta = await redBoxApi.post('/registrar_pago/', datos, {
        headers: { Authorization: `Token ${token}` }
    });
    return respuesta.data;
};

// Obtener suscripción de un usuario
export const getSuscripcion = async (idUsuario, token) => {
    const respuesta = await redBoxApi.get(`/suscripcion/${idUsuario}/`, {
        headers: { Authorization: `Token ${token}` }
    });
    return respuesta.data;
};

// Obtener todos los usuarios
export const getTodosLosUsuarios = async (token) => {
    const respuesta = await redBoxApi.get('/usuarios/', {
        headers: { Authorization: `Token ${token}` }
    });
    return respuesta.data;
};

// Obtener usuarios registrados en una fecha y hora específica
export const getUsuariosEnClase = async (fecha, hora) => {
    const respuesta = await redBoxApi.get(`/clases/?fecha=${fecha}&hora=${hora}`);
    return respuesta.data;
};

// obtener historial de pagos segun el rol del usuario
export const getHistorialPagos = async (token, { idUsuario = null, fecha = null } = {}) => {
    const params = new URLSearchParams();
    if (idUsuario) params.append('id_usuario', idUsuario);
    if (fecha) params.append('fecha', fecha);
    const query = params.toString() ? `?${params.toString()}` : '';
    const respuesta = await redBoxApi.get(`/historial_pagos/${query}`, {
        headers: { Authorization: `Token ${token}` }
    });
    return respuesta.data;
};

// Editar mi propio perfil (usuario logueado)
export const editarMiPerfil = async (datos, token) => {
    const respuesta = await redBoxApi.put('/editar_mi_perfil/', datos, {
        headers: { Authorization: `Token ${token}` }
    });
    return respuesta.data;
};

// Gestionar Roles
export const getUsuariosConRoles = async (token) => {
    const respuesta = await redBoxApi.get('/usuarios_con_roles/', {
        headers: { Authorization: `Token ${token}` }
    });
    return respuesta.data;
};

export const asignarRol = async (idUsuario, rol, token) => {
    const respuesta = await redBoxApi.put(`/asignar_rol/${idUsuario}/`, 
        { rol: rol },
        { headers: { Authorization: `Token ${token}` } }
    );
    return respuesta.data;
};