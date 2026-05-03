import React, { useContext, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import HeaderColor from '../componentes/HeaderColor';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BotonRojo from '../componentes/BotonRojo';
import BotonGris from '../componentes/BotonGris';
import { useNavigation } from '@react-navigation/native';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import TituloTerciario from '../componentes/TituloTerciario';
import { crearClases, getUsuariosEnClase } from '../api/conexion';
import { AuthContext } from '../auth/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Clases = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { usuario, actualizarUsuario } = useContext(AuthContext);
    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [usuariosEnClase, setUsuariosEnClase] = useState([]);
    const [cargandoUsuarios, setCargandoUsuarios] = useState(false);

    const [formData, setFormData] = useState({
        date: new Date(),
        time: new Date(),
    });

    const formatearFechaParaDjango = (fecha) => {
        const anio = fecha.getFullYear();
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dia = fecha.getDate().toString().padStart(2, '0');
        return `${anio}-${mes}-${dia}`;
    };

    const formatoHora = (fecha) => fecha.toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', hour12: false
    });

    // Máximo 5 días desde hoy
    const fechaMaxima = new Date();
    fechaMaxima.setDate(fechaMaxima.getDate() + 5);

    const onChangeDate = (event, selectedDate) => {
        setShowDate(false);
        if (!selectedDate) return;
        const fechaLocal = new Date(selectedDate);
        fechaLocal.setHours(12, 0, 0, 0);
        setFormData({ ...formData, date: fechaLocal });
        // Recargar usuarios si ya hay hora seleccionada
        cargarUsuariosEnClase(fechaLocal, formData.time);
    };

    const onChangeTime = (event, selectedTime) => {
        setShowTime(false);
        if (!selectedTime) return;

        const ahora = new Date();
        if (formData.date.toDateString() === ahora.toDateString()) {
            if (selectedTime.getTime() < ahora.getTime()) {
                Alert.alert("Hora inválida", "No puedes seleccionar una hora que ya pasó.");
                return;
            }
        }

        // Validar rango 6am - 7pm
        const hora = selectedTime.getHours();
        if (hora < 6 || hora >= 19) {
            Alert.alert("Horario no permitido", "Las clases son de 6:00 AM a 7:00 PM.");
            return;
        }

        setFormData({ ...formData, time: selectedTime });
        cargarUsuariosEnClase(formData.date, selectedTime);
    };

    const cargarUsuariosEnClase = async (fecha, hora) => {
        try {
            setCargandoUsuarios(true);
            const fechaStr = formatearFechaParaDjango(fecha);
            const horaStr = formatoHora(hora);
            const clases = await getUsuariosEnClase(fechaStr, horaStr);
            setUsuariosEnClase(clases);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        } finally {
            setCargandoUsuarios(false);
        }
    };

    const handleReservar = async () => {
        const horaSeleccionada = formData.time.getHours();
        if (horaSeleccionada < 6 || horaSeleccionada >= 19) {
            Alert.alert("Horario no permitido", "Las clases son de 6:00 AM a 7:00 PM.");
            return;
        }

        // Validar máximo 5 días
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaElegida = new Date(formData.date);
        fechaElegida.setHours(0, 0, 0, 0);
        const diffDias = (fechaElegida - hoy) / (1000 * 60 * 60 * 24);
        if (diffDias > 5) {
            Alert.alert("Fecha no permitida", "Solo puedes reservar hasta 5 días después de hoy.");
            return;
        }

        if (usuario && usuario.creditos_usuario <= 0) {
            Alert.alert("Sin créditos", "No tienes créditos disponibles para reservar.");
            return;
        }

        setCargando(true);
        try {
            if (!usuario?.id_usuario) {
                Alert.alert("Error", "No se encontró la sesión del usuario.");
                return;
            }

            const horaInicio = new Date(formData.time);
            const horaFin = new Date(horaInicio.getTime() + 60 * 60 * 1000);

            const datosParaEnviar = {
                id_usuario: usuario.id_usuario,
                fecha_clase: formatearFechaParaDjango(formData.date),
                hora_inicio_clase: formatoHora(horaInicio),
                hora_fin_clase: formatoHora(horaFin),
                cupo_maximo_clase: 20,
                descripcion_clase: "Entrenamiento de CrossFit"
            };

            await crearClases(datosParaEnviar);
            await actualizarUsuario();

            // Recargar lista de usuarios
            await cargarUsuariosEnClase(formData.date, formData.time);

            Alert.alert("¡Éxito!", "Clase reservada correctamente. Se descontó 1 crédito.");
        } catch (error) {
            const mensajeError = error.response?.data?.error || "No se pudo crear la clase.";
            Alert.alert("Atención", mensajeError);
        } finally {
            setCargando(false);
        }
    };

    const handleCancelar = async () => {
        // Verificar que el usuario tiene una clase en esa fecha y hora
        const miClase = usuariosEnClase.find(c => c.id_usuario === usuario?.id_usuario);
        if (!miClase) {
            Alert.alert("Sin reserva", "No tienes una clase reservada en este horario.");
            return;
        }

        // Validar cancelación 30 min antes
        const ahora = new Date();
        const [horas, minutos] = miClase.hora_inicio_clase.split(':').map(Number);
        const fechaClase = new Date(formData.date);
        fechaClase.setHours(horas, minutos, 0, 0);
        const limite = new Date(fechaClase.getTime() - 30 * 60 * 1000);

        if (ahora > limite) {
            Alert.alert("No se puede cancelar", "Solo puedes cancelar hasta 30 minutos antes de la clase.");
            return;
        }

        Alert.alert(
            "Cancelar clase",
            "¿Seguro que quieres cancelar? Se te devolverá 1 crédito.",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Sí, cancelar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await redBoxApi.post(`/clases/${miClase.id_clase}/cancelar/`);
                            await actualizarUsuario();
                            await cargarUsuariosEnClase(formData.date, formData.time);
                            Alert.alert("Éxito", "Clase cancelada y crédito devuelto.");
                        } catch (error) {
                            Alert.alert("Error", "No se pudo cancelar la clase.");
                        }
                    }
                }
            ]
        );
    };

    const miClase = usuariosEnClase.find(c => c.id_usuario === usuario?.id_usuario);

    return (
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
            <ScrollView style={styles.container}>
                <HeaderColor />
                <View style={styles.content}>
                    <TituloPrincipal titulo="Clases" />

                    <TituloTerciario titulo="Fecha:" />
                    <View style={styles.contenedor_fecha}>
                        <TouchableOpacity onPress={() => setShowDate(true)} style={styles.boton_fecha}>
                            <TextInput
                                placeholder='Seleccionar Fecha'
                                editable={false}
                                value={formData.date.toLocaleDateString('es-ES')}
                                style={{ color: '#000' }}
                            />
                            <MaterialIcons name="date-range" size={24} color="black" />
                        </TouchableOpacity>
                        {showDate && (
                            <DateTimePicker
                                value={formData.date}
                                mode="date"
                                display='default'
                                minimumDate={new Date()}
                                maximumDate={fechaMaxima}
                                onChange={onChangeDate}
                            />
                        )}
                    </View>

                    <TituloTerciario titulo="Hora:" />
                    <View style={styles.contenedor_fecha}>
                        <TouchableOpacity onPress={() => setShowTime(true)} style={styles.boton_fecha}>
                            <TextInput
                                placeholder='Seleccionar Hora'
                                editable={false}
                                value={formData.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                style={{ color: '#000' }}
                            />
                            <MaterialIcons name="access-time" size={24} color="black" />
                        </TouchableOpacity>
                        {showTime && (
                            <DateTimePicker
                                value={formData.time}
                                mode="time"
                                display='default'
                                onChange={onChangeTime}
                            />
                        )}
                    </View>

                    {/* BOTONES */}
                    {miClase ? (
                        <BotonGris
                            titulo="Cancelar Clase"
                            onPress={handleCancelar}
                            style={styles.botonMargen}
                        />
                    ) : (
                        <BotonRojo
                            titulo="Reservar Clase"
                            onPress={handleReservar}
                            loading={cargando}
                            style={styles.botonMargen}
                        />
                    )}

                    {/* USUARIOS EN ESTA CLASE */}
                    <TituloTerciario titulo="Usuarios en esta clase:" />
                    {cargandoUsuarios ? (
                        <ActivityIndicator color="#FF4D4D" style={{ marginTop: 10 }} />
                    ) : usuariosEnClase.length > 0 ? (
                        <View style={styles.listaUsuarios}>
                            {usuariosEnClase.map((clase, index) => (
                                <View key={clase.id_clase} style={styles.itemUsuario}>
                                    <MaterialIcons name="person" size={18} color="#FF4D4D" />
                                    <Text style={styles.textoUsuario}>{clase.nombre_usuario}</Text>
                                </View>
                            ))}
                            <Text style={styles.totalUsuarios}>{usuariosEnClase.length} / 20 cupos ocupados</Text>
                        </View>
                    ) : (
                        <Text style={styles.textoVacio}>Nadie reservado aún en este horario.</Text>
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
    contenedor_fecha: {
        backgroundColor: '#F1F1F1',
        borderRadius: 10,
    },
    boton_fecha: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 10,
        paddingHorizontal: 10,
        borderWidth: 1,
        gap: 5,
        width: '100%',
        borderColor: '#000',
    },
    botonMargen: {
        marginTop: 20,
    },
    itemUsuario: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        gap: 8,
    },
    textoUsuario: { fontSize: 14, color: '#333' },
    totalUsuarios: {
        marginTop: 8,
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
    },
    textoVacio: { 
    color: '#999', 
    fontSize: 13, 
    marginTop: 8 
    },
    
});

export default Clases;