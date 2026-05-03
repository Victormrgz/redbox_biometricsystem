import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUsuarioById } from '../api/conexion';

export const AuthContext = createContext();

// AuthContext.js
export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargandoAuth, setCargandoAuth] = useState(true);

    const actualizarUsuario = async (datosDirectos = null) => {
        if (datosDirectos) {
            setUsuario(datosDirectos);
            setCargandoAuth(false);
            return;
        }

        try {
            const id = await AsyncStorage.getItem('userId');
            if (id) {
                const datos = await getUsuarioById(JSON.parse(id));
                setUsuario(datos);
            } else {
                setUsuario(null); // Si no hay ID, el usuario es null
            }
        } catch (e) {
            console.error("Error en AuthContext", e);
        } finally {
            setCargandoAuth(false);
        }
    };

    useEffect(() => {
        actualizarUsuario();
    }, []);

    return (
        <AuthContext.Provider value={{ usuario, setUsuario, actualizarUsuario, cargandoAuth }}>
            {children}
        </AuthContext.Provider>
    );
};