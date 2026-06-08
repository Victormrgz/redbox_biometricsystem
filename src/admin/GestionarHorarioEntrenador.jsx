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
    Modal
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

const GestionarHorariosEntrenador = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { esAdministrador } = useRoles();
    const [entrenadores, setEntrenadores] = useState([]);
    const [entrenadorSeleccionado, setEntrenadorSeleccionado] = useState(null);
    const [horarios, setHorarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
    const [horasDisponibles, setHorasDisponibles] = useState([]);
    const [horasSeleccionadas, setHorasSeleccionadas] = useState([]);
    const [cargandoHorarios, setCargandoHorarios] = useState(false);

    // Horarios disponibles
    const horasManiana = [
        { value: '06:00', label: '6:00 AM - 7:00 AM' },
        { value: '07:00', label: '7:00 AM - 8:00 AM' },
        { value: '08:00', label: '8:00 AM - 9:00 AM' },
        { value: '09:00', label: '9:00 AM - 10:00 AM' },
        { value: '10:00', label: '10:00 AM - 11:00 AM' },
    ];
    
    const horasTarde = [
        { value: '15:00', label: '3:00 PM - 4:00 PM' },
        { value: '16:00', label: '4:00 PM - 5:00 PM' },
        { value: '17:00', label: '5:00 PM - 6:00 PM' },
        { value: '18:00', label: '6:00 PM - 7:00 PM' },
        { value: '19:00', label: '7:00 PM - 8:00 PM' },
    ];

    const todasLasHoras = [...horasManiana, ...horasTarde];

    useEffect(() => {
        if (!esAdministrador()) {
            Alert.alert('Acceso Denegado', 'No tienes permisos para ver esta pantalla.');
            navigation.goBack();
        }
        cargarEntrenadores();
    }, []);

    const cargarEntrenadores = async () => {
        try {
            setCargando(true);
            const token = await AsyncStorage.getItem('userToken');
            const response = await redBoxApi.get('/entrenadores/', {
                headers: { Authorization: `Token ${token}` }
            });
            setEntrenadores(response.data);
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'No se pudieron cargar los entrenadores');
        } finally {
            setCargando(false);
        }
    };

    const cargarHorarios = async (idEntrenador, fecha = null) => {
        try {
            setCargandoHorarios(true);
            const token = await AsyncStorage.getItem('userToken');
            let url = `/horarios_entrenador/${idEntrenador}/`;
            if (fecha) {
                const fechaStr = formatFechaAPI(fecha);
                url += `?fecha=${fechaStr}`;
            }
            const response = await redBoxApi.get(url, {
                headers: { Authorization: `Token ${token}` }
            });
            setHorarios(response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setCargandoHorarios(false);
        }
    };

    const seleccionarEntrenador = async (entrenador) => {
        setEntrenadorSeleccionado(entrenador);
        await cargarHorarios(entrenador.id_usuario);
    };

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

    const abrirModalAsignar = () => {
        setFechaSeleccionada(new Date());
        setHorasSeleccionadas([]);
        setHorasDisponibles(todasLasHoras);
        setModalVisible(true);
    };

    const toggleHora = (horaValue) => {
        if (horasSeleccionadas.includes(horaValue)) {
            setHorasSeleccionadas(horasSeleccionadas.filter(h => h !== horaValue));
        } else {
            setHorasSeleccionadas([...horasSeleccionadas, horaValue]);
        }
    };

    const asignarHorarios = async () => {
        if (horasSeleccionadas.length === 0) {
            Alert.alert('Error', 'Selecciona al menos un horario');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('userToken');
            const fechaStr = formatFechaAPI(fechaSeleccionada);
            
            await redBoxApi.post('/asignar_horarios/', {
                id_entrenador: entrenadorSeleccionado.id_usuario,
                fecha: fechaStr,
                horas: horasSeleccionadas
            }, {
                headers: { Authorization: `Token ${token}` }
            });
            
            Alert.alert('Éxito', `Se asignaron ${horasSeleccionadas.length} horarios`);
            setModalVisible(false);
            await cargarHorarios(entrenadorSeleccionado.id_usuario);
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', error.response?.data?.error || 'No se pudo asignar el horario');
        }
    };

    const eliminarHorario = async (idHorario) => {
        Alert.alert(
            'Eliminar Horario',
            '¿Estás seguro de que deseas eliminar este horario?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('userToken');
                            await redBoxApi.delete(`/eliminar_horario/${idHorario}/`, {
                                headers: { Authorization: `Token ${token}` }
                            });
                            Alert.alert('Éxito', 'Horario eliminado correctamente');
                            await cargarHorarios(entrenadorSeleccionado.id_usuario, fechaSeleccionada);
                        } catch (error) {
                            console.error('Error:', error);
                            Alert.alert('Error', 'No se pudo eliminar el horario');
                        }
                    }
                }
            ]
        );
    };

    const filtrarHorariosPorFecha = async (fecha) => {
        if (entrenadorSeleccionado) {
            await cargarHorarios(entrenadorSeleccionado.id_usuario, fecha);
        }
    };

    const handleDateChange = async (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFechaSeleccionada(selectedDate);
            await filtrarHorariosPorFecha(selectedDate);
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
            <ScrollView style={styles.container}>
                <HeaderColor />

                <View style={styles.content}>
                    <TituloPrincipal titulo="Gestionar Horarios" />
                    <TituloSecundario titulo="Asigna horarios de trabajo a los entrenadores por fecha." />

                    {/* Lista de entrenadores */}
                    <Text style={styles.sectionTitle}>Entrenadores</Text>
                    {entrenadores.map((ent) => (
                        <TouchableOpacity
                            key={ent.id_usuario}
                            style={[styles.cardEntrenador, entrenadorSeleccionado?.id_usuario === ent.id_usuario && styles.cardEntrenadorActivo]}
                            onPress={() => seleccionarEntrenador(ent)}
                        >
                            <View style={styles.avatarEntrenador}>
                                <Text style={styles.avatarTexto}>{ent.nombre.charAt(0)}</Text>
                            </View>
                            <View style={styles.infoEntrenador}>
                                <Text style={styles.nombreEntrenador}>{ent.nombre}</Text>
                            </View>
                            {entrenadorSeleccionado?.id_usuario === ent.id_usuario && (
                                <MaterialIcons name="check-circle" size={24} color="#34C759" />
                            )}
                        </TouchableOpacity>
                    ))}

                    {/* Horarios del entrenador seleccionado */}
                    {entrenadorSeleccionado && (
                        <View style={styles.horariosContainer}>
                            <View style={styles.horariosHeader}>
                            
                                <TouchableOpacity style={styles.botonAgregar} onPress={abrirModalAsignar}>
                                    <MaterialIcons name="add" size={24} color="#fff" />
                                    <Text style={styles.botonAgregarText}>Agregar</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Selector de fecha para filtrar */}
                            <View style={styles.filtroFecha}>
                                <Text style={styles.filtroLabel}>Filtrar por fecha:</Text>
                                <TouchableOpacity 
                                    style={styles.botonFecha}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <MaterialIcons name="date-range" size={20} color="#666" />
                                    <Text style={styles.textoFecha}>
                                        {formatFecha(fechaSeleccionada)}
                                    </Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={fechaSeleccionada}
                                        mode="date"
                                        display="default"
                                        onChange={handleDateChange}
                                    />
                                )}
                            </View>

                            {cargandoHorarios ? (
                                <ActivityIndicator color="#e60000" style={styles.loader} />
                            ) : horarios.length === 0 ? (
                                <View style={styles.sinHorarios}>
                                    <MaterialIcons name="schedule" size={48} color="#ccc" />
                                    <Text style={styles.sinHorariosText}>
                                        No hay horarios asignados para esta fecha
                                    </Text>
                                </View>
                            ) : (
                                horarios.map((horario) => (
                                    <View key={horario.id_horario} style={styles.horarioCard}>
                                        <View style={styles.horarioInfo}>
                                            <View style={styles.horarioHora}>
                                                <MaterialIcons name="access-time" size={20} color="#e60000" />
                                                <Text style={styles.horarioHoraText}>
                                                    {horario.hora_inicio} - {horario.hora_fin}
                                                </Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity 
                                            style={styles.botonEliminar}
                                            onPress={() => eliminarHorario(horario.id_horario)}
                                        >
                                            <MaterialIcons name="delete-outline" size={24} color="#e60000" />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Modal para asignar horarios */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitulo}>Asignar Horarios</Text>
                        <Text style={styles.modalSubtitulo}>
                            Entrenador: {entrenadorSeleccionado?.nombre}
                        </Text>

                        {/* Selector de fecha */}
                        <Text style={styles.modalLabel}>Fecha</Text>
                        <TouchableOpacity 
                            style={styles.modalBotonFecha}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <MaterialIcons name="date-range" size={20} color="#666" />
                            <Text style={styles.modalTextoFecha}>
                                {formatFecha(fechaSeleccionada)}
                            </Text>
                        </TouchableOpacity>

                        {/* Horarios disponibles */}
                        <Text style={styles.modalLabel}>Selecciona los horarios</Text>
                        <Text style={styles.modalSubLabel}>Puedes seleccionar múltiples horarios</Text>
                        
                        <ScrollView style={styles.horasLista}>
                            <Text style={styles.turnoTitulo}>Mañana</Text>
                            {horasManiana.map((hora) => (
                                <TouchableOpacity
                                    key={hora.value}
                                    style={[
                                        styles.horaOption,
                                        horasSeleccionadas.includes(hora.value) && styles.horaOptionSeleccionada
                                    ]}
                                    onPress={() => toggleHora(hora.value)}
                                >
                                    <View style={styles.checkbox}>
                                        {horasSeleccionadas.includes(hora.value) && (
                                            <MaterialIcons name="check-box" size={22} color="#e60000" />
                                        )}
                                        {!horasSeleccionadas.includes(hora.value) && (
                                            <MaterialIcons name="check-box-outline-blank" size={22} color="#999" />
                                        )}
                                    </View>
                                    <Text style={styles.horaOptionText}>{hora.label}</Text>
                                </TouchableOpacity>
                            ))}
                            
                            <Text style={styles.turnoTitulo}>Tarde</Text>
                            {horasTarde.map((hora) => (
                                <TouchableOpacity
                                    key={hora.value}
                                    style={[
                                        styles.horaOption,
                                        horasSeleccionadas.includes(hora.value) && styles.horaOptionSeleccionada
                                    ]}
                                    onPress={() => toggleHora(hora.value)}
                                >
                                    <View style={styles.checkbox}>
                                        {horasSeleccionadas.includes(hora.value) && (
                                            <MaterialIcons name="check-box" size={22} color="#e60000" />
                                        )}
                                        {!horasSeleccionadas.includes(hora.value) && (
                                            <MaterialIcons name="check-box-outline-blank" size={22} color="#999" />
                                        )}
                                    </View>
                                    <Text style={styles.horaOptionText}>{hora.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Resumen */}
                        {horasSeleccionadas.length > 0 && (
                            <View style={styles.resumen}>
                                <Text style={styles.resumenText}>
                                    Horarios seleccionados: {horasSeleccionadas.length}
                                </Text>
                            </View>
                        )}

                        <View style={styles.modalBotones}>
                            <TouchableOpacity style={styles.modalCancelar} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalCancelarText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalGuardar} onPress={asignarHorarios}>
                                <Text style={styles.modalGuardarText}>Asignar</Text>
                            </TouchableOpacity>
                        </View>
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 12,
    },
    cardEntrenador: {
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
    cardEntrenadorActivo: {
        borderWidth: 1,
        borderColor: '#34C759',
        backgroundColor: '#F0FFF0',
    },
    avatarEntrenador: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#e60000',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarTexto: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    infoEntrenador: {
        flex: 1,
    },
    nombreEntrenador: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    emailEntrenador: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    horariosContainer: {
        marginTop: 24,
    },
    horariosHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    botonAgregar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e60000',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    botonAgregarText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    filtroFecha: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    filtroLabel: {
        fontSize: 14,
        color: '#666',
    },
    botonFecha: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    textoFecha: {
        fontSize: 14,
        color: '#333',
    },
    sinHorarios: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    sinHorariosText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    horarioCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    horarioInfo: {
        flex: 1,
    },
    horarioHora: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    horarioHoraText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
    },
    botonEliminar: {
        padding: 8,
    },
    loader: {
        marginTop: 20,
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
    modalTitulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalSubtitulo: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 8,
    },
    modalSubLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 12,
    },
    modalBotonFecha: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 16,
    },
    modalTextoFecha: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    horasLista: {
        maxHeight: 300,
        marginBottom: 16,
    },
    turnoTitulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e60000',
        marginTop: 12,
        marginBottom: 8,
    },
    horaOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        gap: 12,
    },
    horaOptionSeleccionada: {
        backgroundColor: '#FFF0F0',
    },
    checkbox: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    horaOptionText: {
        fontSize: 14,
        color: '#333',
    },
    resumen: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
    },
    resumenText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    },
    modalBotones: {
        flexDirection: 'row',
        gap: 12,
    },
    modalCancelar: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
    },
    modalCancelarText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
    },
    modalGuardar: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#e60000',
        alignItems: 'center',
    },
    modalGuardarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default GestionarHorariosEntrenador;