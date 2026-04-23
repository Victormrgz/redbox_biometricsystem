import axios from "axios";

const redBoxApi = axios.create({
    baseURL: "http://192.168.1.107:8000/api",
});

export const getUsuarios = () => redBoxApi.get('/usuarios');
export const getUsuario = () => getUsuarios();