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
    RefreshControl,
    Modal,
    TextInput
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import HeaderColor from '../componentes/HeaderColor';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { redBoxApi } from '../api/conexion';
import { AuthContext } from '../auth/AuthContext';
import useRoles from '../hooks/useRoles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ResultadosAlumnos = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { usuario } = useContext(AuthContext);
    const { esEntrenador } = useRoles();
    
    const [alumnos, setAlumnos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [refrescando, setRefrescando] = useState(false);
    
    // Modal de resultados
    const [modalVisible, setModalVisible] = useState(false);
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
    const [resultados, setResultados] = useState([]);
    const [cargandoResultados, setCargandoResultados] = useState(false);
    const [movimientos, setMovimientos] = useState([]);
    const [filtroMovimiento, setFiltroMovimiento] = useState('');
    const [showFiltroMovimiento, setShowFiltroMovimiento] = useState(false);

    useEffect(() => {
        if (!esEntrenador()) {
            Alert.alert('Acceso Denegado', 'No tienes permisos para ver esta pantalla.');
            navigation.goBack();
        }
        cargarAlumnos();
    }, []);

    const cargarAlumnos = async () => {
        try {
            setCargando(true);
            const token = await AsyncStorage.getItem('userToken');
            const userId = await AsyncStorage.getItem('userId');
            const idEntrenador = JSON.parse(userId);
            
            // Obtener alumnos que han reservado clases con este entrenador
            const response = await redBoxApi.get(`/mis_clases_con_alumnos/`, {
                headers: { Authorization: `Token ${token}` }
            });
            
            // Extraer alumnos únicos de las clases
            const alumnosUnicos = [];
            const alumnosIds = new Set();
            
            response.data.forEach(clase => {
                clase.alumnos.forEach(alumno => {
                    if (!alumnosIds.has(alumno.id_usuario)) {
                        alumnosIds.add(alumno.id_usuario);
                        alumnosUnicos.push({
                            id_usuario: alumno.id_usuario,
                            pnombre_usuario: alumno.pnombre_usuario,
                            papellido_usuario: alumno.papellido_usuario,
                            email_usuario: alumno.email_usuario,
                            telefono_usuario: alumno.telefono_usuario
                        });
                    }
                });
            });
            
            setAlumnos(alumnosUnicos);
        } catch (error) {
            console.error('Error cargando alumnos:', error);
            Alert.alert('Error', 'No se pudieron cargar los alumnos');
        } finally {
            setCargando(false);
        }
    };

    const cargarMovimientos = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await redBoxApi.get('/movimientos/', {
                headers: { Authorization: `Token ${token}` }
            });
            setMovimientos(response.data);
        } catch (error) {
            console.error('Error cargando movimientos:', error);
        }
    };

    const cargarResultadosAlumno = async (alumno) => {
        try {
            setCargandoResultados(true);
            const token = await AsyncStorage.getItem('userToken');
            
            let url = `/resultados/?id_usuario=${alumno.id_usuario}`;
            if (filtroMovimiento) {
                url += `&id_movimiento=${filtroMovimiento}`;
            }
            
            const response = await redBoxApi.get(url, {
                headers: { Authorization: `Token ${token}` }
            });
            
            setResultados(response.data);
            setAlumnoSeleccionado(alumno);
            setModalVisible(true);
        } catch (error) {
            console.error('Error cargando resultados:', error);
            Alert.alert('Error', 'No se pudieron cargar los resultados del alumno');
        } finally {
            setCargandoResultados(false);
        }
    };

    const onRefresh = async () => {
        setRefrescando(true);
        await cargarAlumnos();
        setRefrescando(false);
    };

    const formatFecha = (fechaStr) => {
        if (!fechaStr) return '';
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatPeso = (peso, unidad) => {
        if (!peso) return '-';
        return `${peso} ${unidad || 'kg'}`;
    };

    const getNombreMovimiento = (idMovimiento) => {
        const movimiento = movimientos.find(m => m.id_movimiento === idMovimiento);
        return movimiento ? movimiento.nombre_movimiento : 'Desconocido';
    };

    const abrirModalFiltro = async () => {
        await cargarMovimientos();
        setShowFiltroMovimiento(true);
    };

    const aplicarFiltro = (idMovimiento) => {
        setFiltroMovimiento(idMovimiento);
        setShowFiltroMovimiento(false);
        if (alumnoSeleccionado) {
            cargarResultadosAlumno(alumnoSeleccionado);
        }
    };

    const limpiarFiltro = () => {
        setFiltroMovimiento('');
        if (alumnoSeleccionado) {
            cargarResultadosAlumno(alumnoSeleccionado);
        }
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
                    <TituloPrincipal titulo="Resultados de Alumnos" />
                    <TituloSecundario titulo="Consulta los levantamientos y récords de tus alumnos." />

                    {alumnos.length === 0 ? (
                        <View style={styles.sinAlumnos}>
                            <MaterialIcons name="people-outline" size={64} color="#ccc" />
                            <Text style={styles.sinAlumnosText}>
                                No tienes alumnos aún
                            </Text>
                            <Text style={styles.sinAlumnosSubText}>
                                Cuando los alumnos reserven tus clases, aparecerán aquí.
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.alumnosLista}>
                            {alumnos.map((alumno) => (
                                <TouchableOpacity
                                    key={alumno.id_usuario}
                                    style={styles.alumnoCard}
                                    onPress={() => cargarResultadosAlumno(alumno)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.alumnoAvatar}>
                                        <Text style={styles.alumnoAvatarTexto}>
                                            {alumno.pnombre_usuario?.charAt(0)}{alumno.papellido_usuario?.charAt(0)}
                                        </Text>
                                    </View>
                                    <View style={styles.alumnoInfo}>
                                        <Text style={styles.alumnoNombre}>
                                            {alumno.pnombre_usuario} {alumno.papellido_usuario}
                                        </Text>
                                    </View>
                                    <MaterialIcons name="chevron-right" size={24} color="#ccc" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Modal de resultados del alumno */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitulo}>
                                Resultados de {alumnoSeleccionado?.pnombre_usuario} {alumnoSeleccionado?.papellido_usuario}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Filtro por movimiento */}
                        <View style={styles.filtroResultados}>
                            <TouchableOpacity 
                                style={styles.botonFiltroResultados}
                                onPress={abrirModalFiltro}
                            >
                                <MaterialIcons name="filter-alt" size={18} color="#666" />
                                <Text style={styles.filtroResultadosTexto}>
                                    {filtroMovimiento 
                                        ? `Filtrando: ${getNombreMovimiento(filtroMovimiento)}`
                                        : 'Filtrar por movimiento'}
                                </Text>
                            </TouchableOpacity>
                            {filtroMovimiento && (
                                <TouchableOpacity style={styles.botonLimpiarFiltroResultados} onPress={limpiarFiltro}>
                                    <MaterialIcons name="close" size={16} color="#e60000" />
                                    <Text style={styles.limpiarFiltroTexto}>Limpiar</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {cargandoResultados ? (
                            <ActivityIndicator color="#e60000" style={styles.modalLoader} />
                        ) : resultados.length === 0 ? (
                            <View style={styles.sinResultados}>
                                <MaterialIcons name="fitness-center" size={48} color="#ccc" />
                                <Text style={styles.sinResultadosText}>
                                    {filtroMovimiento 
                                        ? 'No hay resultados para este movimiento'
                                        : 'Este alumno aún no tiene resultados registrados'}
                                </Text>
                            </View>
                        ) : (
                            <ScrollView style={styles.resultadosLista}>
                                {resultados.map((resultado) => (
                                    <View key={resultado.id_resultado} style={styles.resultadoCard}>
                                        <View style={styles.resultadoHeader}>
                                            <Text style={styles.resultadoMovimiento}>
                                                {getNombreMovimiento(resultado.id_movimiento)}
                                            </Text>
                                            <Text style={styles.resultadoFecha}>
                                                {formatFecha(resultado.fecha_evaluacion)}
                                            </Text>
                                        </View>
                                        <View style={styles.resultadoStats}>
                                            <View style={styles.statRow}>
                                                <View style={styles.statItem}>
                                                    <MaterialIcons name="fitness-center" size={18} color="#FF3B30" />
                                                    <Text style={styles.statLabel}>Peso:</Text>
                                                    <Text style={styles.statValue}>
                                                        {formatPeso(resultado.peso, resultado.unidad)}
                                                    </Text>
                                                </View>
                                                <View style={styles.statItem}>
                                                    <MaterialIcons name="repeat" size={18} color="#FF3B30" />
                                                    <Text style={styles.statLabel}>Reps:</Text>
                                                    <Text style={styles.statValue}>{resultado.repeticiones}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.statRow}>
                                                <View style={styles.statItem}>
                                                    <MaterialIcons name="autorenew" size={18} color="#FF3B30" />
                                                    <Text style={styles.statLabel}>Rondas:</Text>
                                                    <Text style={styles.statValue}>{resultado.rondas}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        {resultado.comentarios_resultado && (
                                            <Text style={styles.resultadoComentarios}>
                                                💬 {resultado.comentarios_resultado}
                                            </Text>
                                        )}
                                    </View>
                                ))}
                            </ScrollView>
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

            {/* Modal de filtro de movimientos */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showFiltroMovimiento}
                onRequestClose={() => setShowFiltroMovimiento(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitulo}>Seleccionar Movimiento</Text>
                        <Text style={styles.modalSubtitulo}>
                            Filtra los resultados por tipo de movimiento
                        </Text>
                        
                        <ScrollView style={styles.movimientosLista}>
                            <TouchableOpacity
                                style={styles.movimientoOpcion}
                                onPress={() => aplicarFiltro('')}
                            >
                                <Text style={styles.movimientoOpcionText}>Todos los movimientos</Text>
                            </TouchableOpacity>
                            {movimientos.map((movimiento) => (
                                <TouchableOpacity
                                    key={movimiento.id_movimiento}
                                    style={styles.movimientoOpcion}
                                    onPress={() => aplicarFiltro(movimiento.id_movimiento)}
                                >
                                    <Text style={styles.movimientoOpcionText}>{movimiento.nombre_movimiento}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowFiltroMovimiento(false)}
                        >
                            <Text style={styles.modalCloseText}>Cancelar</Text>
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
    sinAlumnos: {
        alignItems: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    sinAlumnosText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    sinAlumnosSubText: {
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
    },
    alumnosLista: {
        marginTop: 16,
        marginBottom: 40,
    },
    alumnoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    alumnoAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e60000',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    alumnoAvatarTexto: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    alumnoInfo: {
        flex: 1,
    },
    alumnoNombre: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    alumnoEmail: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    alumnoTelefono: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
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
        marginBottom: 16,
    },
    modalTitulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    filtroResultados: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    botonFiltroResultados: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    filtroResultadosTexto: {
        fontSize: 12,
        color: '#666',
    },
    botonLimpiarFiltroResultados: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF0F0',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    limpiarFiltroTexto: {
        fontSize: 11,
        color: '#e60000',
    },
    modalLoader: {
        marginTop: 40,
    },
    sinResultados: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    sinResultadosText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    resultadosLista: {
        maxHeight: 500,
    },
    resultadoCard: {
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    resultadoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    resultadoMovimiento: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#e60000',
    },
    resultadoFecha: {
        fontSize: 11,
        color: '#999',
    },
    resultadoStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    statValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    resultadoComentarios: {
        fontSize: 11,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    modalCloseButton: {
        marginTop: 16,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#e60000',
        alignItems: 'center',
    },
    modalCloseText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    movimientosLista: {
        maxHeight: 400,
    },
    movimientoOpcion: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    movimientoOpcionText: {
        fontSize: 14,
        color: '#333',
    },
});

export default ResultadosAlumnos;