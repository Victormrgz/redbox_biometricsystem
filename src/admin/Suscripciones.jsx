import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import HeaderColor from '../componentes/HeaderColor';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import { getTodosLosUsuarios, getSuscripcion } from '../api/conexion';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../auth/AuthContext';
import useRoles from '../hooks/useRoles';

const Suscripciones = () => {
    const insets = useSafeAreaInsets();
    const { usuario } = useContext(AuthContext);
    const { esAdministrador, esEntrenador, esUsuario } = useRoles();
    
    const [usuarios, setUsuarios] = useState([]);
    const [suscripciones, setSuscripciones] = useState({});
    const [cargando, setCargando] = useState(true);
    const [usuarioExpandido, setUsuarioExpandido] = useState(null);
    const [miSuscripcion, setMiSuscripcion] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const token = await AsyncStorage.getItem('userToken');
            const userId = await AsyncStorage.getItem('userId');
            const userIdNumber = userId ? JSON.parse(userId) : null;
            
            if (esAdministrador()) {
                // Admin: ver todos los usuarios
                const listaUsuarios = await getTodosLosUsuarios(token);
                setUsuarios(listaUsuarios);
                
                // Cargar suscripción de cada usuario
                const suscripcionesMap = {};
                await Promise.all(
                    listaUsuarios.map(async (u) => {
                        try {
                            const sus = await getSuscripcion(u.id_usuario, token);
                            suscripcionesMap[u.id_usuario] = sus;
                        } catch {
                            suscripcionesMap[u.id_usuario] = { activo: false, plan: null };
                        }
                    })
                );
                setSuscripciones(suscripcionesMap);
            } else {
                // Usuario normal: solo ver su propia suscripción
                const miSus = await getSuscripcion(userIdNumber, token);
                setMiSuscripcion(miSus);
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'No se pudieron cargar los datos.');
        } finally {
            setCargando(false);
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '--';
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const toggleUsuario = (id) => {
        setUsuarioExpandido(usuarioExpandido === id ? null : id);
    };

    if (cargando) return (
        <View style={styles.cargandoContainer}>
            <ActivityIndicator color="#FF4D4D" size="large" />
        </View>
    );

    // VISTA PARA USUARIO NORMAL (solo su suscripción)
    if (!esAdministrador()) {
        const activo = miSuscripcion?.activo || false;
        
        return (
            <View style={[styles.safeArea, { paddingTop: insets.top }]}>
                <ScrollView style={styles.container}>
                    <HeaderColor />
                    <View style={styles.content}>
                        <TituloPrincipal titulo="Mi Suscripción" />
                        <TituloSecundario titulo="Consulta el estado de tu plan y fechas de vigencia." />

                        <View style={styles.cardMiSuscripcion}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.nombreUsuario}>
                                    {usuario?.pnombre_usuario} {usuario?.papellido_usuario}
                                </Text>
                                <View style={[styles.badge, activo ? styles.badgeActivo : styles.badgeInactivo]}>
                                    <Text style={styles.badgeTexto}>
                                        {activo ? 'Activo' : 'Inactivo'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.detalle}>
                                <View style={styles.fila}>
                                    <Text style={styles.filaLabel}>Plan</Text>
                                    <Text style={styles.filaValor}>{miSuscripcion?.plan || 'Sin plan'}</Text>
                                </View>
                                <View style={styles.separador} />
                                <View style={styles.fila}>
                                    <Text style={styles.filaLabel}>Estado</Text>
                                    <Text style={[styles.filaValor, activo ? styles.textoActivo : styles.textoInactivo]}>
                                        {activo ? 'Activo' : 'Inactivo'}
                                    </Text>
                                </View>
                                <View style={styles.separador} />
                                <View style={styles.fila}>
                                    <Text style={styles.filaLabel}>Activado el</Text>
                                    <Text style={styles.filaValor}>{formatearFecha(miSuscripcion?.fecha_inicio)}</Text>
                                </View>
                                <View style={styles.separador} />
                                <View style={styles.fila}>
                                    <Text style={styles.filaLabel}>Expira el</Text>
                                    <Text style={styles.filaValor}>{formatearFecha(miSuscripcion?.fecha_fin)}</Text>
                                </View>
                                <View style={styles.separador} />
                                <View style={styles.fila}>
                                    <Text style={styles.filaLabel}>Créditos disponibles</Text>
                                    <Text style={styles.filaValor}>{usuario?.creditos_usuario ?? 0}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }

    // VISTA PARA ADMINISTRADOR (todos los usuarios)
    return (
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
            <ScrollView style={styles.container}>
                <HeaderColor />
                <View style={styles.content}>
                    <TituloPrincipal titulo="Gestionar suscripciones" />
                    <TituloSecundario titulo="Consulta el estado actual de cada usuario según su plan y fechas." />

                    {usuarios.length === 0 ? (
                        <Text style={styles.textoVacio}>No hay usuarios registrados.</Text>
                    ) : (
                        usuarios.map((u) => {
                            const sus = suscripciones[u.id_usuario];
                            const activo = sus?.activo || false;
                            const expandido = usuarioExpandido === u.id_usuario;

                            return (
                                <TouchableOpacity
                                    key={u.id_usuario}
                                    style={styles.card}
                                    onPress={() => toggleUsuario(u.id_usuario)}
                                    activeOpacity={0.85}
                                >
                                    {/* CABECERA */}
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.nombreUsuario}>
                                            {u.pnombre_usuario} {u.papellido_usuario}
                                        </Text>
                                        <View style={[styles.badge, activo ? styles.badgeActivo : styles.badgeInactivo]}>
                                            <Text style={styles.badgeTexto}>
                                                {activo ? 'Activo' : 'Inactivo'}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* DETALLE EXPANDIBLE */}
                                    {expandido && (
                                        <View style={styles.detalle}>
                                            <View style={styles.fila}>
                                                <Text style={styles.filaLabel}>Plan</Text>
                                                <Text style={styles.filaValor}>{sus?.plan || 'Sin plan'}</Text>
                                            </View>
                                            <View style={styles.separador} />
                                            <View style={styles.fila}>
                                                <Text style={styles.filaLabel}>Estado</Text>
                                                <Text style={[styles.filaValor, activo ? styles.textoActivo : styles.textoInactivo]}>
                                                    {activo ? 'Activo' : 'Inactivo'}
                                                </Text>
                                            </View>
                                            <View style={styles.separador} />
                                            <View style={styles.fila}>
                                                <Text style={styles.filaLabel}>Activado el</Text>
                                                <Text style={styles.filaValor}>{formatearFecha(sus?.fecha_inicio)}</Text>
                                            </View>
                                            <View style={styles.separador} />
                                            <View style={styles.fila}>
                                                <Text style={styles.filaLabel}>Expira el</Text>
                                                <Text style={styles.filaValor}>{formatearFecha(sus?.fecha_fin)}</Text>
                                            </View>
                                            <View style={styles.separador} />
                                            <View style={styles.fila}>
                                                <Text style={styles.filaLabel}>Créditos disponibles</Text>
                                                <Text style={styles.filaValor}>{u.creditos_usuario ?? 0}</Text>
                                            </View>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1 },
    content: { paddingHorizontal: 16, paddingBottom: 30 },
    cargandoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    textoVacio: { color: '#999', textAlign: 'center', marginTop: 40 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 3,
    },
    cardMiSuscripcion: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    nombreUsuario: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
    },
    badgeActivo: { backgroundColor: '#e6f9f0' },
    badgeInactivo: { backgroundColor: '#fdecea' },
    badgeTexto: { fontSize: 12, fontWeight: '600' },
    detalle: { marginTop: 14 },
    fila: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    filaLabel: { fontSize: 14, color: '#666' },
    filaValor: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
    textoActivo: { color: '#27ae60' },
    textoInactivo: { color: '#FF4D4D' },
    separador: { height: 1, backgroundColor: '#f0f0f0' },
});

export default Suscripciones;