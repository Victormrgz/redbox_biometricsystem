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
    RefreshControl
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

const VerHorarioEntrenador = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { usuario } = useContext(AuthContext);
    const { esEntrenador } = useRoles();
    
    const [horarios, setHorarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [refrescando, setRefrescando] = useState(false);
    const [fechaFiltro, setFechaFiltro] = useState(null);
    const [showFiltroDatePicker, setShowFiltroDatePicker] = useState(false);
    const [cargandoHorarios, setCargandoHorarios] = useState(false);

    useEffect(() => {
        if (!esEntrenador()) {
            Alert.alert('Acceso Denegado', 'No tienes permisos para ver esta pantalla.');
            navigation.goBack();
        }
        cargarHorarios();
    }, []);

    const cargarHorarios = async (fecha = null) => {
        try {
            setCargandoHorarios(true);
            const token = await AsyncStorage.getItem('userToken');
            const userId = await AsyncStorage.getItem('userId');
            const idEntrenador = JSON.parse(userId);
            
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
            console.error('Error cargando horarios:', error);
            Alert.alert('Error', 'No se pudieron cargar tus horarios');
        } finally {
            setCargando(false);
            setCargandoHorarios(false);
        }
    };

    const onRefresh = async () => {
        setRefrescando(true);
        await cargarHorarios(fechaFiltro);
        setRefrescando(false);
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

    const formatHoraAMPM = (hora) => {
        if (!hora) return '';
        const [horas, minutos] = hora.split(':');
        const horaNum = parseInt(horas);
        const ampm = horaNum >= 12 ? 'PM' : 'AM';
        const hora12 = horaNum % 12 || 12;
        return `${hora12}:${minutos} ${ampm}`;
    };

    const handleFiltroDateChange = (event, selectedDate) => {
        setShowFiltroDatePicker(false);
        if (selectedDate) {
            setFechaFiltro(selectedDate);
        }
    };

    const aplicarFiltroFecha = async () => {
        if (fechaFiltro) {
            setCargando(true);
            await cargarHorarios(fechaFiltro);
        }
    };

    const limpiarFiltro = async () => {
        setFechaFiltro(null);
        setCargando(true);
        await cargarHorarios();
    };

    // Agrupar horarios por fecha
    const horariosAgrupados = () => {
        const grupos = {};
        horarios.forEach(horario => {
            const fechaKey = horario.fecha;
            if (!grupos[fechaKey]) {
                grupos[fechaKey] = {
                    fecha: horario.fecha,
                    horarios: []
                };
            }
            grupos[fechaKey].horarios.push(horario);
        });
        // Ordenar por fecha (más reciente primero)
        return Object.values(grupos).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    };

    const agrupados = horariosAgrupados();

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
                    <TituloPrincipal titulo="Mis Horarios" />
                    <TituloSecundario titulo="Consulta los horarios de trabajo que te han sido asignados." />

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
                        <TouchableOpacity style={styles.botonAplicar} onPress={aplicarFiltroFecha}>
                            <MaterialIcons name="search" size={20} color="#fff" />
                            <Text style={styles.aplicarTexto}>Buscar</Text>
                        </TouchableOpacity>
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
                            <MaterialIcons name="schedule" size={64} color="#ccc" />
                            <Text style={styles.sinHorariosText}>
                                {fechaFiltro 
                                    ? 'No tienes horarios asignados para esta fecha'
                                    : 'No tienes horarios asignados aún'}
                            </Text>
                            <Text style={styles.sinHorariosSubText}>
                                Los horarios serán asignados por el administrador.
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.horariosLista}>
                            {agrupados.map((grupo, index) => (
                                <View key={index} style={styles.grupoCard}>
                                    <View style={styles.grupoHeader}>
                                        <MaterialIcons name="date-range" size={22} color="#e60000" />
                                        <Text style={styles.grupoFecha}>
                                            {formatFecha(new Date(grupo.fecha))}
                                        </Text>
                                    </View>
                                    <View style={styles.horariosContainer}>
                                        {grupo.horarios.map((horario) => (
                                            <View key={horario.id_horario} style={styles.horarioCard}>
                                                <View style={styles.horarioInfo}>
                                                    <View style={styles.horarioHora}>
                                                        <MaterialIcons name="access-time" size={20} color="#e60000" />
                                                        <Text style={styles.horarioHoraText}>
                                                            {formatHoraAMPM(horario.hora_inicio)} - {formatHoraAMPM(horario.hora_fin)}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.horarioEstado}>
                                                        <View style={[
                                                            styles.estadoBadge,
                                                            horario.activo ? styles.estadoActivo : styles.estadoInactivo
                                                        ]}>
                                                            <Text style={styles.estadoTexto}>
                                                                {horario.activo ? 'Activo' : 'Inactivo'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    filtroContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        marginTop: 16,
    },
    botonFiltro: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 12,
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
        paddingVertical: 12,
        borderRadius: 8,
        gap: 4,
    },
    limpiarTexto: {
        fontSize: 12,
        color: '#e60000',
    },
    botonAplicar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e60000',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 6,
    },
    aplicarTexto: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    loader: {
        marginTop: 40,
    },
    sinHorarios: {
        alignItems: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    sinHorariosText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    sinHorariosSubText: {
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
    },
    horariosLista: {
        marginTop: 8,
        marginBottom: 40,
    },
    grupoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    grupoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF0F0',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    grupoFecha: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e60000',
    },
    horariosContainer: {
        padding: 12,
    },
    horarioCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    horarioInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    horarioHora: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    horarioHoraText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
    },
    horarioEstado: {
        alignItems: 'flex-end',
    },
    estadoBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    estadoActivo: {
        backgroundColor: '#E8F5E9',
    },
    estadoInactivo: {
        backgroundColor: '#FFEBEE',
    },
    estadoTexto: {
        fontSize: 11,
        fontWeight: '600',
        color: '#333',
    },
});

export default VerHorarioEntrenador;