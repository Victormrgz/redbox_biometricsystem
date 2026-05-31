// hooks/useRoles.js
import { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';

const useRoles = () => {
    const { usuario } = useContext(AuthContext);
    
    const esAdministrador = () => {
        return usuario?.rol === 'Administrador';
    };
    
    const esEntrenador = () => {
        return usuario?.rol === 'Entrenador';
    };
    
    const esUsuario = () => {
        return usuario?.rol === 'Usuario';
    };
    
    const puedeVer = (recurso) => {
        const permisos = {
            // Administrador puede ver todo
            'gestionarRoles': esAdministrador(),
            'registrarPago': esAdministrador(),
            'verTodosPagos': esAdministrador(),
            'verTodasSuscripciones': esAdministrador(),
            
            // Entrenador puede ver
            'gestionarClases': esEntrenador(),
            'verResultadosAlumnos': esEntrenador(),
            'verSuscripcionesAlumnos': esEntrenador(),
            'crearPlanificacion': esEntrenador(),
            
            // Usuario puede ver
            'editarPerfil': true, // Todos pueden editar su perfil
            'verPlanificacion': true,
            'verMisPagos': true,
            'verMiSuscripcion': true,
            'misResultados': true,
            'reservarClase': true,
        };
        
        return permisos[recurso] || false;
    };
    
    return {
        esAdministrador,
        esEntrenador,
        esUsuario,
        puedeVer,
        rol: usuario?.rol || 'Usuario'
    };
};

export default useRoles;