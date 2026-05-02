import axios from "axios";

export const redBoxApi = axios.create({
    baseURL: "http://192.168.1.108:8000/api",
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