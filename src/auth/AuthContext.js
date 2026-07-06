import React, { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUsuarioById } from '../api/conexion';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargandoAuth, setCargandoAuth] = useState(true);

    // ✅ Función para actualizar usuario
    const actualizarUsuario = useCallback(async (datosDirectos = null) => {
        if (datosDirectos) {
            setUsuario(datosDirectos);
            setCargandoAuth(false);
            return;
        }

        try {
            const token = await AsyncStorage.getItem('userToken');
            const id = await AsyncStorage.getItem('userId');
            
            if (!token || !id) {
                setUsuario(null);
                setCargandoAuth(false);
                return;
            }

            const datos = await getUsuarioById(JSON.parse(id));
            setUsuario(datos);
        } catch (e) {
            console.error("Error en AuthContext", e);
            setUsuario(null);
        } finally {
            setCargandoAuth(false);
        }
    }, []);

    // ✅ Cargar usuario al iniciar la app
    useEffect(() => {
        const cargarUsuarioInicial = async () => {
            // Verificar si hay token guardado
            const token = await AsyncStorage.getItem('userToken');
            const id = await AsyncStorage.getItem('userId');
            
            if (token && id) {
                await actualizarUsuario();
            } else {
                setCargandoAuth(false);
            }
        };
        
        cargarUsuarioInicial();
    }, []); // ← Se ejecuta solo al montar

    const value = useMemo(() => ({
        usuario,
        setUsuario,
        actualizarUsuario,
        cargandoAuth
    }), [usuario, actualizarUsuario, cargandoAuth]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};