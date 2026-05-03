import React, { useState, useCallback, useContext } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderColor from '../componentes/HeaderColor';
import Constants from 'expo-constants';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import TituloTerciario from '../componentes/TituloTerciario';
import CardMisReservas from '../componentes/CardMisReservas';
import {  redBoxApi } from '../api/conexion';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../auth/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MisReservas = () => {
    const insets = useSafeAreaInsets();
    const { usuario, actualizarUsuario, cargandoAuth } = useContext(AuthContext);
    const [reservasAgrupadas, setReservasAgrupadas] = useState({});
    const [cargandoClases, setCargandoClases] = useState(true);
    const [cargando, setCargando] = useState(true);

    useFocusEffect(
        useCallback(() => {
            cargarHistorial();
        }, [])
    );

    const obtenerNumeroMes = (nombreMes) => {
        const meses = {
            'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
            'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
        };
        return meses[nombreMes.toLowerCase()];
    };
    const cargarHistorial = async () => {
        try {
            setCargandoClases(true);
            
            // 4. Actualizamos los créditos globalmente (por si acaso) y pedimos las clases
            // Usamos usuario.id_usuario directamente del contexto
            if (!usuario?.id_usuario) return;

            const [_, respClases] = await Promise.all([
                actualizarUsuario(), // Refresca créditos globalmente
                redBoxApi.get(`/clases/?id_usuario=${usuario.id_usuario}`) // Trae las clases
            ]);

            const agrupado = respClases.data.reduce((acc, reserva) => {
                const fechaObj = new Date(reserva.fecha_clase);
                const mesAño = fechaObj.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
                const tituloSeccion = mesAño.charAt(0).toUpperCase() + mesAño.slice(1);

                if (!acc[tituloSeccion]) acc[tituloSeccion] = [];
                
                acc[tituloSeccion].push({
                    id_clase: reserva.id_clase,
                    fecha: fechaObj.toLocaleDateString('es-ES'),
                    hora: reserva.hora_inicio_clase ? reserva.hora_inicio_clase.substring(0, 5) : '--:--',
                    estado: 'Confirmada',
                });
                return acc;
            }, {});

            setReservasAgrupadas(agrupado);
        } catch (error) {
            console.error("Error al cargar historial:", error);
        } finally {
            setCargandoClases(false); 
        }
    };

    return (
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
            <ScrollView style={styles.container}> 
                <HeaderColor />
                <View style={styles.content}>
                    <TituloPrincipal titulo="Mis Reservas" />
                    <TituloSecundario titulo="Consulta tu historial y resumen mensual de clases." />
                    
                    {/* 5. Usamos los datos del contexto directamente */}
                    <View style={styles.contenedorCreditos}>
                        <Text style={styles.titulo_creditos}>
                            Créditos usados: <Text style={styles.texto_valor}>
                                {usuario ? (30 - usuario.creditos_usuario) : '...'}
                            </Text>
                        </Text>
                        <Text style={styles.titulo_creditos}>
                            Créditos disponibles: <Text style={[styles.texto_valor, {color: '#FF4D4D'}]}>
                                {usuario ? usuario.creditos_usuario : '...'}
                            </Text>
                        </Text>
                    </View>

                    {(cargandoClases || cargandoAuth) ? (
                        <ActivityIndicator size="large" color="#FF4D4D" style={{ marginTop: 30 }} />
                    ) : (
                        Object.keys(reservasAgrupadas).length > 0 ? (
                            Object.keys(reservasAgrupadas)
                                .sort((a, b) => {
                                    const dateA = new Date(a.split(' ')[1], obtenerNumeroMes(a.split(' ')[0]));
                                    const dateB = new Date(b.split(' ')[1], obtenerNumeroMes(b.split(' ')[0]));
                                    return dateB - dateA;
                                })
                                .map((mes) => (
                                    <View key={mes} style={{ marginBottom: 25 }}>
                                        <TituloTerciario titulo={mes} />
                                        <CardMisReservas data={reservasAgrupadas[mes]} />
                                    </View>
                                ))
                        ) : (
                            <View style={styles.vacioContainer}>
                                <Text style={styles.textoVacio}>No se encontraron reservas en tu historial.</Text>
                            </View>
                        )
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff', 
    },
    container: {
        flex: 1,
        backgroundColor: '#fff', 
    },
    content: {
        flex: 1,
        padding: 20,
    },
    contenedorCreditos: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 12,
        marginVertical: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#FF4D4D'
    },
    titulo_creditos: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    texto_valor: {
        fontWeight: 'normal',
        color: '#666',
    },
    vacioContainer: {
        marginTop: 50,
        alignItems: 'center'
    },
    textoVacio: {
        color: '#999',
        fontSize: 16,
        fontStyle: 'italic'
    }
});

export default MisReservas;