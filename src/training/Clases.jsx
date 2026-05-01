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

    // Formatea la fecha usando el tiempo local de Táchira
    const formatearFechaParaDjango = (fecha) => {
        const anio = fecha.getFullYear();
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dia = fecha.getDate().toString().padStart(2, '0');
        return `${anio}-${mes}-${dia}`; // Retorna "2026-05-13" estrictamente
    };

    const onChangeDate = (event, selectedDate) => {
        setShowDate(false);
        if (selectedDate) {
            // Creamos una nueva copia y le fijamos la hora a mitad del día
            const fechaLocal = new Date(selectedDate);
            fechaLocal.setHours(12, 0, 0, 0); 
            
            setFormData({ ...formData, date: fechaLocal });
        }
    };

    const onChangeTime = (event, selectedTime) => {
        setShowTime(false);
        if (selectedTime) {
            const ahora = new Date();
            // Validación de hora si es hoy
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
        if (!formData.date || !formData.time) {
            Alert.alert("Atención", "Por favor, selecciona una fecha y una hora.");
            return;
        }

        setCargando(true);

        try {
            const userId = await AsyncStorage.getItem('userId');

            if (!userId) {
                Alert.alert("Error de sesión", "No se encontró el ID del usuario.");
                navigation.navigate('Login'); 
                return;
            }

            const horaInicio = formData.time;
            const horaFin = new Date(horaInicio.getTime() + 60 * 60 * 1000); 

            const datosParaEnviar = {
                id_usuario: parseInt(userId), 
                
                fecha_clase: formatearFechaParaDjango(formData.date), 
                
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
                descripcion_clase: "Entrenamiento de CrossFit"
            };

            const respuesta = await crearClases(datosParaEnviar);
            
            Alert.alert("¡Reserva Exitosa!", "Tu clase ha sido agendada correctamente.", [
                { 
                    text: "OK", 
                    onPress: () => navigation.goBack() // Regresa al Inicio para ver el cambio
                }
            ]);

        } catch (error) {
            if (error.response) {
                Alert.alert("Error en el servidor", JSON.stringify(error.response.data));
            } else {
                Alert.alert("Error", "No se pudo conectar con el servidor.");
            }
        } finally {
            setCargando(false);
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
                                minimumDate={new Date()} 
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