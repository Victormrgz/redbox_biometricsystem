import React, { useState, useContext, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import HeaderColor from '../componentes/HeaderColor';
import BotonRojo from '../componentes/BotonRojo';
import TituloPrincipal from '../componentes/TituloPrincipal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { redBoxApi } from '../api/conexion';
import { AuthContext } from '../auth/AuthContext';
import useRoles from '../hooks/useRoles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CrearPlanificacion = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { usuario } = useContext(AuthContext);
    const { esAdministrador, esEntrenador } = useRoles();
    const [showDate, setShowDate] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [editando, setEditando] = useState(false);
    const [planificacionExistente, setPlanificacionExistente] = useState(null);
    
    const [formData, setFormData] = useState({
        fecha: null,
        entrenamiento: '',
        observaciones: ''
    });

    // Verificar permisos
    useEffect(() => {
        if (!esAdministrador() && !esEntrenador()) {
            Alert.alert('Acceso Denegado', 'No tienes permisos para crear planificaciones.');
            navigation.goBack();
        }
    }, []);

    // Obtener fecha mínima (mañana) y fecha máxima (dentro de 5 días)
    const obtenerFechasLimite = () => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const fechaMinima = new Date(hoy);
        fechaMinima.setDate(hoy.getDate()); // A partir de mañana
        
        const fechaMaxima = new Date(hoy);
        fechaMaxima.setDate(hoy.getDate() + 5); // Hasta 5 días después
        
        return { fechaMinima, fechaMaxima };
    };

    // Validar si la fecha está dentro del rango permitido
    const validarRangoFecha = (fecha) => {
        const { fechaMinima, fechaMaxima } = obtenerFechasLimite();
        
        if (fecha < fechaMinima) {
            Alert.alert(
                'Fecha no válida',
                `No se pueden crear planificaciones para fechas pasadas o el día de hoy.\nLa fecha mínima es: ${fechaMinima.toLocaleDateString('es-ES')}`
            );
            return false;
        }
        
        if (fecha > fechaMaxima) {
            Alert.alert(
                'Fecha no válida',
                `Solo se pueden crear planificaciones con máximo 5 días de anticipación.\nLa fecha máxima es: ${fechaMaxima.toLocaleDateString('es-ES')}`
            );
            return false;
        }
        
        return true;
    };

    // Formatear fecha para mostrar
    const formatFecha = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Formatear fecha para API (YYYY-MM-DD)
    const formatFechaAPI = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Buscar planificación existente
    const buscarPlanificacionPorFecha = async (fechaSeleccionada) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const fechaStr = formatFechaAPI(fechaSeleccionada);
            const response = await redBoxApi.get(`/planificacion_diaria/?fecha=${fechaStr}`, {
                headers: { Authorization: `Token ${token}` }
            });
            
            if (response.data && response.data.length > 0) {
                setPlanificacionExistente(response.data[0]);
                setEditando(true);
                setFormData({
                    fecha: fechaSeleccionada,
                    entrenamiento: response.data[0].entrenamiento || '',
                    observaciones: response.data[0].observaciones || ''
                });
                Alert.alert(
                    'Planificación existente',
                    'Ya existe una planificación para esta fecha. Puedes editarla.',
                    [{ text: 'OK' }]
                );
            } else {
                setPlanificacionExistente(null);
                setEditando(false);
                setFormData({
                    fecha: fechaSeleccionada,
                    entrenamiento: '',
                    observaciones: ''
                });
            }
        } catch (error) {
            console.error('Error al buscar planificación:', error);
        }
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDate(false);
        if (selectedDate) {
            // Validar rango de fecha ANTES de hacer cualquier otra cosa
            if (validarRangoFecha(selectedDate)) {
                buscarPlanificacionPorFecha(selectedDate);
            }
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validarFormulario = () => {
        if (!formData.fecha) {
            Alert.alert('Error', 'Selecciona una fecha');
            return false;
        }
        
        // Validar nuevamente la fecha antes de guardar (por seguridad)
        if (!validarRangoFecha(formData.fecha)) {
            return false;
        }
        
        if (!formData.entrenamiento.trim()) {
            Alert.alert('Error', 'El contenido del entrenamiento es obligatorio');
            return false;
        }
        
        return true;
    };

    const guardarPlanificacion = async () => {
        if (!validarFormulario()) return;

        try {
            setCargando(true);
            const token = await AsyncStorage.getItem('userToken');
            const fechaStr = formatFechaAPI(formData.fecha);
            
            const datosEnviar = {
                fecha: fechaStr,
                entrenamiento: formData.entrenamiento.trim(),
                observaciones: formData.observaciones.trim() || ''
            };

            if (editando && planificacionExistente) {
                await redBoxApi.put(
                    `/planificacion_diaria/${planificacionExistente.id_planificacion}/`,
                    datosEnviar,
                    { headers: { Authorization: `Token ${token}` } }
                );
                Alert.alert('Éxito', 'Planificación actualizada correctamente');
            } else {
                await redBoxApi.post('/planificacion_diaria/', datosEnviar, {
                    headers: { Authorization: `Token ${token}` }
                });
                Alert.alert('Éxito', 'Planificación guardada correctamente');
            }
            
            // Limpiar formulario
            setFormData({
                fecha: null,
                entrenamiento: '',
                observaciones: ''
            });
            setPlanificacionExistente(null);
            setEditando(false);
            
        } catch (error) {
            console.error('Error al guardar:', error);
            if (error.response?.status === 400 && error.response?.data?.fecha) {
                Alert.alert('Error', 'Ya existe una planificación para esta fecha');
            } else {
                Alert.alert('Error', error.response?.data?.error || 'No se pudo guardar la planificación');
            }
        } finally {
            setCargando(false);
        }
    };

    const { fechaMinima, fechaMaxima } = obtenerFechasLimite();

    return (
        <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
            <ScrollView style={styles.container}>
                <HeaderColor />

                <View style={styles.content}>
                    <TituloPrincipal titulo="Crear Planificación" />
                    <Text style={styles.titulo_secundario}>
                        Define el contenido del entrenamiento para un día específico.
                    </Text>

                    <View style={styles.card}>
                        {/* FECHA */}
                        <Text style={styles.label}>Fecha</Text>
                        <TouchableOpacity 
                            style={styles.botonFecha} 
                            onPress={() => setShowDate(true)}
                        >
                            <Text style={formData.fecha ? styles.textoFecha : styles.textoFechaPlaceholder}>
                                {formData.fecha ? formatFecha(formData.fecha) : 'Seleccionar fecha'}
                            </Text>
                            <MaterialIcons name="date-range" size={24} color="#666" />
                        </TouchableOpacity>

                        {showDate && (
                            <DateTimePicker
                                value={formData.fecha || new Date()}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                                minimumDate={fechaMinima}
                                maximumDate={fechaMaxima}
                            />
                        )}

                        {/* CONTENIDO DEL ENTRENAMIENTO */}
                        <Text style={styles.label}>Contenido del entrenamiento</Text>
                        <TextInput
                            style={styles.textArea}
                            multiline={true}
                            numberOfLines={6}
                            placeholder="Ejercicios:&#10;- Sentadillas: 4x12&#10;- Press banca: 4x10&#10;- Peso muerto: 3x8&#10;&#10;Repeticiones y series detalladas..."
                            placeholderTextColor="#999"
                            value={formData.entrenamiento}
                            onChangeText={(text) => handleInputChange('entrenamiento', text)}
                            textAlignVertical="top"
                        />

                        {/* OBSERVACIONES (opcional) */}
                        <Text style={styles.label}>Observaciones (opcional)</Text>
                        <TextInput
                            style={styles.textAreaObservaciones}
                            multiline={true}
                            numberOfLines={3}
                            placeholder="Notas adicionales, materiales necesarios, recomendaciones..."
                            placeholderTextColor="#999"
                            value={formData.observaciones}
                            onChangeText={(text) => handleInputChange('observaciones', text)}
                            textAlignVertical="top"
                        />

                        {/* INDICADOR DE MODO EDICIÓN */}
                        {editando && (
                            <View style={styles.editandoBadge}>
                                <MaterialIcons name="edit" size={16} color="#fff" />
                                <Text style={styles.editandoTexto}>Editando planificación existente</Text>
                            </View>
                        )}

                        {/* BOTÓN GUARDAR */}
                        <BotonRojo 
                            titulo={editando ? "Actualizar Planificación" : "Guardar Planificación"}
                            onPress={guardarPlanificacion}
                            style={styles.botonMargen}
                            loading={cargando}
                            disabled={cargando}
                        />
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
        marginBottom: 16,
        lineHeight: 20,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3CD',
        borderWidth: 1,
        borderColor: '#FFEeba',
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
        gap: 8,
    },
    infoBannerText: {
        flex: 1,
        fontSize: 12,
        color: '#856404',
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
        marginTop: 16,
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
    textoFechaPlaceholder: {
        fontSize: 16,
        color: '#999',
    },
    fechaHint: {
        fontSize: 12,
        color: '#666',
        marginTop: 6,
        marginLeft: 4,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
        minHeight: 150,
    },
    textAreaObservaciones: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
        minHeight: 80,
    },
    editandoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFA500',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginTop: 20,
        gap: 8,
    },
    editandoTexto: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    botonMargen: {
        marginTop: 24,
        width: '100%',
        marginBottom: 20,
    },
});

export default CrearPlanificacion;