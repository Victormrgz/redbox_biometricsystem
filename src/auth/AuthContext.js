// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUsuarioById } from '../api/conexion';

export const AuthContext = createContext();

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
      const token = await AsyncStorage.getItem('userToken');
      const id = await AsyncStorage.getItem('userId');
      
      if (!token || !id) {
        console.log('No hay token o userId, usuario no autenticado');
        setUsuario(null);
        setCargandoAuth(false);
        return;
      }

      try {
        const datos = await getUsuarioById(JSON.parse(id));
        setUsuario(datos);
      } catch (error) {
        // ✅ Si el token es inválido (401), limpiamos el almacenamiento
        if (error.response && error.response.status === 401) {
          console.log('Token inválido, limpiando almacenamiento...');
          await AsyncStorage.clear();
          setUsuario(null);
        } else {
          console.error('Error en AuthContext:', error);
        }
      }
    } catch (e) {
      console.error('Error en AuthContext', e);
    } finally {
      setCargandoAuth(false);
    }
  };

  useEffect(() => {
    actualizarUsuario();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      usuario, 
      setUsuario, 
      actualizarUsuario, 
      cargandoAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};