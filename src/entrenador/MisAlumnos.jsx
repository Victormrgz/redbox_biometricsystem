import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import HeaderColor from '../componentes/HeaderColor';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { redBoxApi } from '../api/conexion';
import { AuthContext } from '../auth/AuthContext';
import useRoles from '../hooks/useRoles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MisAlumnos = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { usuario } = useContext(AuthContext);
    const { esEntrenador } = useRoles();
    
    const [clases, setClases] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [refrescando, setRefrescando] = useState(false);
    const [claseSeleccionada, setClaseSeleccionada] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Verificar permisos
    useEffect(() => {
        if (!esEntrenador()) {
            Alert.alert('Acceso Denegado', 'No tienes permisos para ver esta pantalla.');
            navigation.goBack();
        }
    }, []);

    // Cargar clases con alumnos
    const cargarClases = async () => {
        try {
            setCargando(true);
            const token = await AsyncStorage.getItem('userToken');
            const response = await redBoxApi.get('/mis_clases_con_alumnos/', {
                headers: { Authorization: `Token ${token}` }
            });
            setClases(response.data);
        } catch (error) {
            console.error('Error cargando clases:', error);
            Alert.alert('Error', 'No se pudieron cargar las clases');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarClases();
    }, []);

    const onRefresh = async () => {
        setRefrescando(true);
        await cargarClases();
        setRefrescando(false);
    };

    const verDetalleClase = (clase) => {
        setClaseSeleccionada(clase);
        setModalVisible(true);
    };

    const formatFecha = (fechaStr) => {
        if (!fechaStr) return '';
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (cargando) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#e60000" />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
            <ScrollView 
                style={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={['#e60000']} />
                }
            >
                <HeaderColor />

                <View style={styles.content}>
                    <TituloPrincipal titulo="Mis Alumnos" />
                    <TituloSecundario titulo="Alumnos que han reservado tus clases." />

                    {clases.length === 0 ? (
                        <View style={styles.vacio}>
                            <MaterialIcons name="calendar-today" size={64} color="#ccc" />
                            <Text style={styles.textoVacio}>
                                No tienes clases programadas próximamente.
                            </Text>
                            <Text style={styles.textoVacioSub}>
                                Cuando los alumnos reserven tus clases, aparecerán aquí.
                            </Text>
                        </View>
                    ) : (
                        clases.map((clase) => (
                            <TouchableOpacity
                                key={clase.id_clase}
                                style={styles.card}
                                onPress={() => verDetalleClase(clase)}
                                activeOpacity={0.7}
                            >
                                {/* Fecha y hora */}
                                <View style={styles.cardHeader}>
                                    <View style={styles.fechaContainer}>
                                        <MaterialIcons name="date-range" size={20} color="#e60000" />
                                        <Text style={styles.fechaTexto}>{formatFecha(clase.fecha)}</Text>
                                    </View>
                                    <View style={styles.horaContainer}>
                                        <MaterialIcons name="access-time" size={20} color="#e60000" />
                                        <Text style={styles.horaTexto}>{clase.hora_inicio} - {clase.hora_fin}</Text>
                                    </View>
                                </View>

                                {/* Descripción */}
                                {clase.descripcion && (
                                    <Text style={styles.descripcion}>{clase.descripcion}</Text>
                                )}

                                {/* Alumnos */}
                                <View style={styles.alumnosContainer}>
                                    <View style={styles.alumnosHeader}>
                                        <MaterialIcons name="people" size={18} color="#666" />
                                        <Text style={styles.alumnosTitulo}>
                                            Alumnos ({clase.alumnos.length}/{clase.cupo_maximo})
                                        </Text>
                                    </View>
                                    
                                    {clase.alumnos.length === 0 ? (
                                        <Text style={styles.sinAlumnos}>Sin reservas aún</Text>
                                    ) : (
                                        <View style={styles.alumnosLista}>
                                            {clase.alumnos.map((alumno, index) => (
                                                <View key={alumno.id_usuario} style={styles.alumnoItem}>
                                                    <View style={styles.alumnoAvatar}>
                                                        <Text style={styles.alumnoAvatarTexto}>
                                                            {alumno.pnombre_usuario?.charAt(0)}{alumno.papellido_usuario?.charAt(0)}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.alumnoInfo}>
                                                        <Text style={styles.alumnoNombre}>
                                                            {alumno.pnombre_usuario} {alumno.papellido_usuario}
                                                        </Text>
                                                        <Text style={styles.alumnoEmail}>{alumno.email_usuario}</Text>
                                                        {alumno.telefono_usuario && (
                                                            <Text style={styles.alumnoTelefono}>
                                                                📞 {alumno.telefono_usuario}
                                                            </Text>
                                                        )}
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                <View style={styles.verDetalle}>
                                    <Text style={styles.verDetalleTexto}>Ver detalles</Text>
                                    <MaterialIcons name="chevron-right" size={20} color="#e60000" />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Modal de detalles de clase */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitulo}>Detalles de la Clase</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {claseSeleccionada && (
                            <>
                                <View style={styles.modalInfo}>
                                    <View style={styles.modalInfoRow}>
                                        <MaterialIcons name="date-range" size={20} color="#e60000" />
                                        <Text style={styles.modalInfoText}>
                                            {formatFecha(claseSeleccionada.fecha)}
                                        </Text>
                                    </View>
                                    <View style={styles.modalInfoRow}>
                                        <MaterialIcons name="access-time" size={20} color="#e60000" />
                                        <Text style={styles.modalInfoText}>
                                            {claseSeleccionada.hora_inicio} - {claseSeleccionada.hora_fin}
                                        </Text>
                                    </View>
                                    {claseSeleccionada.descripcion && (
                                        <View style={styles.modalInfoRow}>
                                            <MaterialIcons name="description" size={20} color="#e60000" />
                                            <Text style={styles.modalInfoText}>
                                                {claseSeleccionada.descripcion}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <Text style={styles.modalSubtitulo}>
                                    Lista de Alumnos ({claseSeleccionada.alumnos.length}/{claseSeleccionada.cupo_maximo})
                                </Text>

                                <ScrollView style={styles.modalAlumnosLista}>
                                    {claseSeleccionada.alumnos.length === 0 ? (
                                        <Text style={styles.sinAlumnosModal}>No hay alumnos registrados</Text>
                                    ) : (
                                        claseSeleccionada.alumnos.map((alumno) => (
                                            <View key={alumno.id_usuario} style={styles.modalAlumnoItem}>
                                                <View style={styles.modalAlumnoAvatar}>
                                                    <Text style={styles.modalAlumnoAvatarTexto}>
                                                        {alumno.pnombre_usuario?.charAt(0)}{alumno.papellido_usuario?.charAt(0)}
                                                    </Text>
                                                </View>
                                                <View style={styles.modalAlumnoInfo}>
                                                    <Text style={styles.modalAlumnoNombre}>
                                                        {alumno.pnombre_usuario} {alumno.papellido_usuario}
                                                    </Text>
                                                    <Text style={styles.modalAlumnoEmail}>{alumno.email_usuario}</Text>
                                                    {alumno.telefono_usuario && (
                                                        <Text style={styles.modalAlumnoTelefono}>
                                                            📞 {alumno.telefono_usuario}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                        ))
                                    )}
                                </ScrollView>
                            </>
                        )}

                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalCloseText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    vacio: {
        alignItems: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    textoVacio: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    textoVacioSub: {
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        marginBottom: 12,
    },
    fechaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    fechaTexto: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    horaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    horaTexto: {
        fontSize: 14,
        color: '#666',
    },
    descripcion: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    alumnosContainer: {
        marginTop: 4,
    },
    alumnosHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    alumnosTitulo: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    sinAlumnos: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 16,
    },
    alumnosLista: {
        gap: 12,
    },
    alumnoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    alumnoAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e60000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alumnoAvatarTexto: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    alumnoInfo: {
        flex: 1,
    },
    alumnoNombre: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    alumnoEmail: {
        fontSize: 12,
        color: '#666',
    },
    alumnoTelefono: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    },
    verDetalle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 4,
    },
    verDetalleTexto: {
        fontSize: 12,
        color: '#e60000',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalInfo: {
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
        gap: 8,
    },
    modalInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    modalInfoText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    modalSubtitulo: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    modalAlumnosLista: {
        maxHeight: 300,
    },
    modalAlumnoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalAlumnoAvatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#e60000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalAlumnoAvatarTexto: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalAlumnoInfo: {
        flex: 1,
    },
    modalAlumnoNombre: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
    },
    modalAlumnoEmail: {
        fontSize: 12,
        color: '#666',
    },
    modalAlumnoTelefono: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    },
    sinAlumnosModal: {
        textAlign: 'center',
        paddingVertical: 30,
        color: '#999',
    },
    modalCloseButton: {
        marginTop: 20,
        paddingVertical: 12,
        backgroundColor: '#e60000',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalCloseText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MisAlumnos;