import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import HeaderColor from '../componentes/HeaderColor';
import TituloPrincipal from '../componentes/TituloPrincipal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { redBoxApi } from '../api/conexion';
import { AuthContext } from '../auth/AuthContext';
import useRoles from '../hooks/useRoles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BotonRojo from '../componentes/BotonRojo';

const VerPlanificacion = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { usuario } = useContext(AuthContext);
    const { esAdministrador, esEntrenador } = useRoles();
    
    const [showDate, setShowDate] = useState(false);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
    const [planificacion, setPlanificacion] = useState(null);
    const [cargando, setCargando] = useState(false);

    const formatFecha = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatFechaAPI = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const buscarPlanificacion = async (fecha) => {
        try {
            setCargando(true);
            const token = await AsyncStorage.getItem('userToken');
            const fechaStr = formatFechaAPI(fecha);
            const response = await redBoxApi.get(`/planificacion_diaria/?fecha=${fechaStr}`, {
                headers: { Authorization: `Token ${token}` }
            });
            
            if (response.data && response.data.length > 0) {
                setPlanificacion(response.data[0]);
            } else {
                setPlanificacion(null);
            }
        } catch (error) {
            console.error('Error al buscar planificación:', error);
            setPlanificacion(null);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        buscarPlanificacion(fechaSeleccionada);
    }, [fechaSeleccionada]);

    const handleDateChange = (event, selectedDate) => {
        setShowDate(false);
        if (selectedDate) {
            setFechaSeleccionada(selectedDate);
        }
    };

    const handleEliminar = () => {
        Alert.alert(
            'Eliminar Planificación',
            '¿Estás seguro de que deseas eliminar esta planificación?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setCargando(true);
                            const token = await AsyncStorage.getItem('userToken');
                            await redBoxApi.delete(`/planificacion_diaria/${planificacion.id_planificacion}/`, {
                                headers: { Authorization: `Token ${token}` }
                            });
                            Alert.alert('Éxito', 'Planificación eliminada correctamente');
                            setPlanificacion(null);
                            buscarPlanificacion(fechaSeleccionada);
                        } catch (error) {
                            console.error('Error al eliminar:', error);
                            Alert.alert('Error', 'No se pudo eliminar la planificación');
                        } finally {
                            setCargando(false);
                        }
                    }
                }
            ]
        );
    };

    const handleEditar = () => {
        navigation.navigate('CrearPlanificacion', {
            planificacionExistente: planificacion,
            fechaEditar: fechaSeleccionada
        });
    };

    return (
        <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
            <ScrollView style={styles.container}>
                <HeaderColor />

                <View style={styles.content}>
                    <TituloPrincipal titulo="Ver Planificación" />
                    <Text style={styles.titulo_secundario}>
                        Consulta el entrenamiento planificado para una fecha específica.
                    </Text>

                    <View style={styles.card}>
                        {/* SELECTOR DE FECHA */}
                        <Text style={styles.label}>Fecha</Text>
                        <TouchableOpacity 
                            style={styles.botonFecha} 
                            onPress={() => setShowDate(true)}
                        >
                            <Text style={styles.textoFecha}>
                                {formatFecha(fechaSeleccionada)}
                            </Text>
                            <MaterialIcons name="date-range" size={24} color="#666" />
                        </TouchableOpacity>
                        {showDate && (
                            <DateTimePicker
                                value={fechaSeleccionada}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}

                        {/* CONTENIDO */}
                        {cargando ? (
                            <ActivityIndicator color="#e60000" style={styles.loader} />
                        ) : planificacion ? (
                            <>
                                <View style={styles.separator} />
                                
                                <Text style={styles.label}>Entrenamiento</Text>
                                <Text style={styles.contenido}>
                                    {planificacion.entrenamiento}
                                </Text>
                                
                                {planificacion.observaciones && (
                                    <>
                                        <Text style={styles.label}>Observaciones</Text>
                                        <Text style={styles.observaciones}>
                                            {planificacion.observaciones}
                                        </Text>
                                    </>
                                )}

                                {/* BOTONES DE ACCIÓN (SOLO ADMIN Y ENTRENADOR) */}
                                {(esAdministrador() || esEntrenador()) && (
                                    <View style={styles.botonesAccion}>
                                        <TouchableOpacity 
                                            style={styles.botonEditar}
                                            onPress={handleEditar}
                                        >
                                            <MaterialIcons name="edit" size={20} color="#fff" />
                                            <Text style={styles.botonEditarText}>Editar</Text>
                                        </TouchableOpacity>
                                        {esAdministrador() && (
                                            <TouchableOpacity 
                                                style={styles.botonEliminar}
                                                onPress={handleEliminar}
                                            >
                                                <MaterialIcons name="delete" size={20} color="#fff" />
                                                <Text style={styles.botonEliminarText}>Eliminar</Text>
                                            </TouchableOpacity>

                                            
                                        )}
                                    </View>
                                )}
                            </>
                        ) : (
                            <View style={styles.sinPlanificacion}>
                                <MaterialIcons name="fitness-center" size={48} color="#ccc" />
                                <Text style={styles.textoSinPlanificacion}>
                                    No hay planificación para esta fecha
                                </Text>
                                {(esAdministrador() || esEntrenador()) && (
                            
                                    <BotonRojo titulo="+ Crear Planificación" onPress={() => navigation.navigate('CrearPlanificacion')} style={styles.botonGrid} />
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
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
    titulo_secundario: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        lineHeight: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 8,
    },
    botonFecha: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    textoFecha: {
        fontSize: 16,
        color: '#333',
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 20,
    },
    contenido: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
    },
    observaciones: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        backgroundColor: '#FFF8E7',
        padding: 15,
        borderRadius: 10,
        fontStyle: 'italic',
    },
    loader: {
        marginTop: 40,
    },
    sinPlanificacion: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 16,
    },
    textoSinPlanificacion: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    botonCrear: {
        backgroundColor: '#e60000',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    botonCrearText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    botonesAccion: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    botonEditar: {
        flex: 1,
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    botonEditarText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    botonEliminar: {
        flex: 1,
        backgroundColor: '#e60000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    botonEliminarText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default VerPlanificacion;