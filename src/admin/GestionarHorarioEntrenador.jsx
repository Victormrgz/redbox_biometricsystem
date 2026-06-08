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
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import HeaderColor from '../componentes/HeaderColor';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import BotonRojo from '../componentes/BotonRojo';
import BotonGris from '../componentes/BotonGris';
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
    const [refrescando, setRefrescando] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
    const [horasSeleccionadas, setHorasSeleccionadas] = useState([]);
    const [cargandoHorarios, setCargandoHorarios] = useState(false);
    const [fechaFiltro, setFechaFiltro] = useState(null);
    const [showFiltroDatePicker, setShowFiltroDatePicker] = useState(false);
    const [asignando, setAsignando] = useState(false);

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

    const obtenerFechasLimite = () => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaMinima = new Date(hoy);
        fechaMinima.setDate(hoy.getDate() + 1);
        const fechaMaxima = new Date(hoy);
        fechaMaxima.setDate(hoy.getDate() + 5);
        return { fechaMinima, fechaMaxima };
    };

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
                console.log("Cargando horarios para fecha UTC:", fechaStr);
                url += `?fecha=${fechaStr}`;
            }
            const response = await redBoxApi.get(url, {
                headers: { Authorization: `Token ${token}` }
            });
            console.log("Horarios recibidos:", response.data);
            setHorarios(response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setCargandoHorarios(false);
        }
    };

    const seleccionarEntrenador = async (entrenador) => {
        setEntrenadorSeleccionado(entrenador);
        setFechaFiltro(null);
        await cargarHorarios(entrenador.id_usuario);
    };

    const onRefresh = async () => {
        setRefrescando(true);
        await cargarEntrenadores();
        if (entrenadorSeleccionado) {
            await cargarHorarios(entrenadorSeleccionado.id_usuario, fechaFiltro);
        }
        setRefrescando(false);
    };

    const formatFecha = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'UTC'
        });
    };

    const formatFechaAPI = (date) => {
        if (!date) return '';
        // Usar UTC para evitar problemas de zona horaria
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const crearFechaUTC = (year, month, day) => {
        return new Date(Date.UTC(year, month, day));
    };

    const formatHoraAMPM = (hora) => {
        if (!hora) return '';
        const [horas, minutos] = hora.split(':');
        const horaNum = parseInt(horas);
        const ampm = horaNum >= 12 ? 'PM' : 'AM';
        const hora12 = horaNum % 12 || 12;
        return `${hora12}:${minutos} ${ampm}`;
    };

    const abrirModalAsignar = () => {
        const { fechaMinima } = obtenerFechasLimite();
        setFechaSeleccionada(fechaMinima);
        setHorasSeleccionadas([]);
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
            setAsignando(true);
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
            await cargarHorarios(entrenadorSeleccionado.id_usuario, fechaFiltro);
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', error.response?.data?.error || 'No se pudo asignar el horario');
        } finally {
            setAsignando(false);
        }
    };

    const eliminarHorario = async (idHorario) => {
        Alert.alert(
            'Eliminar Horario',
            '¿Estás seguro de que deseas eliminar este horario?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sí, eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('userToken');
                            await redBoxApi.delete(`/eliminar_horario/${idHorario}/`, {
                                headers: { Authorization: `Token ${token}` }
                            });
                            Alert.alert('Éxito', 'Horario eliminado correctamente');
                            await cargarHorarios(entrenadorSeleccionado.id_usuario, fechaFiltro);
                        } catch (error) {
                            console.error('Error:', error);
                            Alert.alert('Error', 'No se pudo eliminar el horario');
                        }
                    }
                }
            ]
        );
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFechaSeleccionada(selectedDate);
        }
    };

    const handleFiltroDateChange = (event, selectedDate) => {
        setShowFiltroDatePicker(false);
        if (selectedDate) {
            // Crear una nueva fecha fija a las 12:00 UTC para evitar desfases
            const fechaFija = new Date(Date.UTC(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate()
            ));
            setFechaFiltro(fechaFija);
        }
    };

    const aplicarFiltroFecha = async () => {
        if (entrenadorSeleccionado && fechaFiltro) {
            // Enviar la fecha en formato UTC YYYY-MM-DD
            const fechaStr = formatFechaAPI(fechaFiltro);
            console.log("Filtrando por fecha UTC:", fechaStr);
            await cargarHorarios(entrenadorSeleccionado.id_usuario, fechaFiltro);
        }
    };

    const limpiarFiltro = async () => {
        setFechaFiltro(null);
        if (entrenadorSeleccionado) {
            await cargarHorarios(entrenadorSeleccionado.id_usuario);
        }
    };

    const { fechaMinima, fechaMaxima } = obtenerFechasLimite();

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
                    <TituloPrincipal titulo="Gestionar Horarios" />
                    <TituloSecundario titulo="Asigna y consulta los horarios de trabajo de los entrenadores." />

                    {/* Lista de entrenadores */}
                    <Text style={styles.sectionTitle}>Entrenadores</Text>
                    {entrenadores.length === 0 ? (
                        <Text style={styles.textoVacio}>No hay entrenadores registrados</Text>
                    ) : (
                        entrenadores.map((ent) => (
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
                        ))
                    )}

                    {/* Horarios del entrenador seleccionado */}
                    {entrenadorSeleccionado && (
                        <View style={styles.horariosContainer}>
                            <View style={styles.horariosHeader}>
                                <BotonRojo 
                                    titulo="Agregar Horario"
                                    onPress={abrirModalAsignar}
                                    style={styles.botonAgregar}
                                />
                            </View>

                            {/* Filtro por fecha */}
                            <View style={styles.filtroContainer}>
                                <TouchableOpacity 
                                    style={styles.botonFiltro}
                                    onPress={() => setShowFiltroDatePicker(true)}
                                >
                                    <MaterialIcons name="filter-alt" size={20} color="#666" />
                                    <Text style={styles.filtroTexto}>
                                        {fechaFiltro ? formatFecha(fechaFiltro) : 'Filtrar por fecha'}
                                    </Text>
                                </TouchableOpacity>
                                {fechaFiltro && (
                                    <TouchableOpacity style={styles.botonLimpiarFiltro} onPress={limpiarFiltro}>
                                        <MaterialIcons name="close" size={18} color="#e60000" />
                                        <Text style={styles.limpiarTexto}>Limpiar</Text>
                                    </TouchableOpacity>
                                )}
                                <BotonGris 
                                    titulo="Buscar"
                                    onPress={aplicarFiltroFecha}
                                    style={styles.botonAplicar}
                                />
                            </View>

                            {showFiltroDatePicker && (
                                <DateTimePicker
                                    value={fechaFiltro || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={handleFiltroDateChange}
                                />
                            )}

                            {cargandoHorarios ? (
                                <ActivityIndicator color="#e60000" style={styles.loader} />
                            ) : horarios.length === 0 ? (
                                <View style={styles.sinHorarios}>
                                    <MaterialIcons name="schedule" size={48} color="#ccc" />
                                    <Text style={styles.sinHorariosText}>
                                        No hay horarios asignados{fechaFiltro ? ' para esta fecha' : ''}
                                    </Text>
                                </View>
                            ) : (
                                horarios.map((horario) => (
                                    <View key={horario.id_horario} style={styles.horarioCard}>
                                        <View style={styles.horarioInfo}>
                                            <View style={styles.horarioFecha}>
                                                <MaterialIcons name="date-range" size={18} color="#e60000" />
                                                <Text style={styles.horarioFechaText}>
                                                    {formatFecha(new Date(horario.fecha))}
                                                </Text>
                                            </View>
                                            <View style={styles.horarioHora}>
                                                <MaterialIcons name="access-time" size={18} color="#e60000" />
                                                <Text style={styles.horarioHoraText}>
                                                    {formatHoraAMPM(horario.hora_inicio)} - {formatHoraAMPM(horario.hora_fin)}
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
                        {showDatePicker && (
                            <DateTimePicker
                                value={fechaSeleccionada}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                                minimumDate={fechaMinima}
                                maximumDate={fechaMaxima}
                            />
                        )}

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
                                        {horasSeleccionadas.includes(hora.value) ? (
                                            <MaterialIcons name="check-box" size={22} color="#e60000" />
                                        ) : (
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
                                        {horasSeleccionadas.includes(hora.value) ? (
                                            <MaterialIcons name="check-box" size={22} color="#e60000" />
                                        ) : (
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
                            <BotonGris 
                                titulo="Cancelar"
                                onPress={() => setModalVisible(false)}
                                style={styles.modalBoton}
                            />
                            <BotonRojo 
                                titulo="Asignar"
                                onPress={asignarHorarios}
                                loading={asignando}
                                style={styles.modalBoton}
                            />
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
    textoVacio: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
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
        marginBottom: 40,
    },
    horariosHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    botonAgregar: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    filtroContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    botonFiltro: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        gap: 8,
    },
    filtroTexto: {
        fontSize: 14,
        color: '#666',
    },
    botonLimpiarFiltro: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF0F0',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 4,
    },
    limpiarTexto: {
        fontSize: 12,
        color: '#e60000',
    },
    botonAplicar: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    loader: {
        marginTop: 20,
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
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    horarioInfo: {
        flex: 1,
        gap: 6,
    },
    horarioFecha: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    horarioFechaText: {
        fontSize: 14,
        color: '#333',
    },
    horarioHora: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    horarioHoraText: {
        fontSize: 14,
        color: '#666',
    },
    botonEliminar: {
        padding: 8,
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
        marginBottom: 16,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3CD',
        borderWidth: 1,
        borderColor: '#FFEeba',
        borderRadius: 8,
        padding: 8,
        marginBottom: 16,
        gap: 6,
    },
    infoBannerText: {
        flex: 1,
        fontSize: 11,
        color: '#856404',
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
    modalBoton: {
        flex: 1,
    },
});

export default GestionarHorariosEntrenador;