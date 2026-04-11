import React, { useState } from 'react';
// ✅ IMPORTANTE: Todo lo de react-native va en una sola línea
import { StyleSheet, View, Platform, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from 'react-native'; 
import { StatusBar } from 'expo-status-bar';
import HeaderColor from '../componentes/HeaderColor';
import Constants from 'expo-constants';
import DateTimePicker  from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


const Clases = () => {
    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);

    const [formData, setFormData] = useState({
        date: '',
        time: '',
    });
    return (
        <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}> 
            <HeaderColor /> {/*Logo de la app*/}

            <View style={styles.content}>
                <Text style={styles.titulo_principal}>Clases</Text>
                <Text style={styles.titulo_reservas}>Fecha: </Text>

                <View style={styles.contenedor_fecha}>
                    <TouchableOpacity onPress={() => setShowDate(true)} style={styles.boton_fecha} > 
                        <TextInput
                            placeholder='Date'
                            editable={false}
                            value = {formData.date ? new Date(formData.date).toLocaleDateString() : ''}
                        />
                        <MaterialIcons name="date-range" size={24} color="black" />
                    </TouchableOpacity>
                    {showDate && (
                        <DateTimePicker
                        value={new Date()}
                        mode="date" 
                        display='default'
                        onChange={(event, selectedDate) => {
                            setShowDate(false);
                            if (selectedDate) {
                                setFormData({
                                    ...formData,
                                    date: selectedDate.toISOString(),
                                });
                            }
                        }}
                    />
                    )}
                    
                </View>

                <Text style={styles.titulo_reservas}>Hora: </Text>

                <View style={styles.contenedor_fecha}>
                    <TouchableOpacity onPress={() => setShowTime(true)} style={styles.boton_fecha} > 
                        <TextInput
                            placeholder='Hora'
                            editable={false}
                            value = {formData.time ? new Date(formData.time).toLocaleTimeString() : ''}
                        />
                        <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
                    </TouchableOpacity>
                    {showTime && (
                        <DateTimePicker
                        value={new Date()}
                        mode="time" 
                        display='default'
                        onChange={(event, selectedDate) => {
                            setShowTime(false);
                            if (selectedDate) {
                                setFormData({
                                    ...formData,
                                    time: selectedDate.toISOString(),
                                });
                            }
                        }}
                    />
                    )}
                    
                </View>

                <TouchableOpacity style={[styles.button, styles.btnRed]}>
                    <Text style={styles.textWhite}>Reservar Clase</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.btnGray]}>
                    <Text style={styles.textWhite}>Ver Reservas</Text>
                </TouchableOpacity>

                <Text style={styles.titulo_reservas}>Planificación del día: </Text>
                <Text style={styles.titulo_secundario}>Aun no existe planificación para este dia.</Text>

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
    titulo_principal: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    titulo_reservas: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,
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
    button: {
        backgroundColor: '#DDDDDD',
        padding: 10
    },
    button: {
    flex: 0.48, // Para que queden dos por fila con un pequeño espacio
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra suave
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    marginTop: 20
    },
    btnRed: {
    backgroundColor: '#e60000', // Rojo vibrante
    },
    textWhite: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  btnGray: {
    backgroundColor: '#555e65', // Gris oscuro azulado
  },
  titulo_secundario: {
        fontSize: 18,
        color: '#666',
        marginBottom: 5,
    },
    
});

export default Clases;