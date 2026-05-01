import React, { useEffect, useState } from 'react';
// ✅ IMPORTANTE: Todo lo de react-native va en una sola línea
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from 'react-native'; 
import HeaderColor from '../componentes/HeaderColor';
import Constants from 'expo-constants';
import DateTimePicker  from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BotonRojo from '../componentes/BotonRojo';
import BotonGris from '../componentes/BotonGris';
import { useNavigation } from '@react-navigation/native';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import TituloTerciario from '../componentes/TituloTerciario';
import { crearClases } from '../api/conexion';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const Clases = () => {
    const navigation = useNavigation();
    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);
    const [cargando, setCargando] = useState(false);

    const [formData, setFormData] = useState({
        date: new Date(),
        time: new Date(),
    });

    // Función para manejar la selección de fecha
    const onChangeDate = (event, selectedDate) => {
        setShowDate(false);
        if (selectedDate) {
            setFormData({ ...formData, date: selectedDate });
        }
    };

    // Función para manejar la selección de hora
    const onChangeTime = (event, selectedTime) => {
        setShowTime(false);
        if (selectedTime) {
            const ahora = new Date();
            
            // Validación: Si la fecha seleccionada es HOY, la hora no puede ser menor a la actual
            if (formData.date.toDateString() === ahora.toDateString()) {
                if (selectedTime.getTime() < ahora.getTime()) {
                    Alert.alert("Hora inválida", "No puedes seleccionar una hora que ya pasó.");
                    return;
                }
            }
            setFormData({ ...formData, time: selectedTime });
        }
    };

    const handleReservar = async () => {
    // 1. Validaciones previas de la UI
    if (!formData.date || !formData.time) {
        Alert.alert("Atención", "Por favor, selecciona una fecha y una hora.");
        return;
    }

    setCargando(true); // Activar indicador de carga si tienes el estado

    try {
        // 2. Obtener el ID del usuario desde el almacenamiento local
        const userId = await AsyncStorage.getItem('userId');

        if (!userId) {
            Alert.alert("Error de sesión", "No se encontró el ID del usuario. Intenta iniciar sesión de nuevo.");
            navigation.navigate('Login'); 
            return;
        }

        // 3. Preparar los datos según tu modelo de Django
        // Nota: Calculamos una hora de fin (ej. 1 hora después) para cumplir con el modelo
        const horaInicio = formData.time;
        const horaFin = new Date(horaInicio.getTime() + 60 * 60 * 1000); // +1 hora

        const datosParaEnviar = {
            id_usuario: parseInt(userId), 
            // Usamos split('T')[0] si tu backend cambió a DateField, 
            // o toISOString() si se mantuvo como DateTimeField
            fecha_clase: formData.date.toISOString().split('T')[0], 
            
            hora_inicio_clase: horaInicio.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false 
            }),
            
            hora_fin_clase: horaFin.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false 
            }),
            
            cupo_maximo_clase: 20,
            descripcion_clase: "Entrenamiento de CrossFit" // O un campo de texto si lo tienes en el front
        };

        // 4. Llamada a la API
        const respuesta = await crearClases(datosParaEnviar);
        
        console.log("Respuesta exitosa:", respuesta);
        Alert.alert("¡Reserva Exitosa!", "Tu clase ha sido agendada correctamente.");
        
        // Opcional: Limpiar el formulario o navegar a otra pantalla
        // navigation.goBack();

    } catch (error) {
        // Manejo detallado de errores del servidor
        if (error.response) {
            console.log("Detalles del error (Django):", error.response.data);
            Alert.alert("Error en el servidor", JSON.stringify(error.response.data));
        } else {
            console.log("Error de conexión:", error.message);
            Alert.alert("Error", "No se pudo conectar con el servidor. Verifica tu red.");
        }
    } finally {
        setCargando(false); // Desactivar indicador de carga
    }
};

    return (
        <SafeAreaView style={styles.safeArea}>
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
                                minimumDate={new Date()} // ✅ BLOQUEA FECHAS PASADAS
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

                    <BotonRojo 
                        titulo="Reservar Clase" 
                        onPress={handleReservar} 
                        loading={cargando}
                        style={styles.botonMargen} 
                    />

                    <BotonGris titulo="Ver Reservas" onPress={() => console.log('Ver Reservas')} style={styles.botonMargen} />

                    <TituloTerciario titulo="Planificación del día:" />
                    <TituloSecundario titulo="10:00 - 11:00: Yoga" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff', // O el color de fondo de tu app
        // En Android, SafeAreaView a veces necesita un padding manual
        paddingTop: Constants.statusBarHeight,
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
    }
    
});

export default Clases;