import React, { useState } from 'react';
// ✅ IMPORTANTE: Todo lo de react-native va en una sola línea
import { StyleSheet, View, Platform, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from 'react-native'; 
import { StatusBar } from 'expo-status-bar';
import HeaderColor from '../componentes/HeaderColor';
import Constants from 'expo-constants';
import DateTimePicker  from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BotonRojo from '../componentes/BotonRojo';
import TituloPrincipal from '../componentes/TituloPrincipal';

const CrearPlanificacion = () => {
     const [showDate, setShowDate] = useState(false);
        const [showTime, setShowTime] = useState(false);
    
        const [formData, setFormData] = useState({
            date: '',
            time: '',
        });
    return (
    <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}> 
            <HeaderColor />

            <View style={styles.content}>
                <Text style={styles.titulo_principal}>Crear Planificación</Text>
                <Text style={styles.titulo_secundario}>Define el contenido del entrenamiento para un día específico.</Text>

                <View style={styles.card}>
                    <Text style={styles.titulo_reservas}>Fecha</Text>
                    
                        <View style={styles.contenedor_fecha}>
                            <TouchableOpacity onPress={() => setShowDate(true)} style={styles.boton_fecha}>
                            <TextInput
                                placeholder='Date'
                                editable={false}
                                value={formData.date ? new Date(formData.date).toLocaleDateString() : ''}
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
                    <Text style={styles.titulo_reservas}>Contenido</Text>

                    <TextInput
                    editable
                    multiline={true}           // Permite múltiples líneas
                    scrollEnabled={false}
                    style={styles.contenedor_fecha}
                    placeholder='Descripción opcional:'
                    />

                    <BotonRojo 
                        titulo="Guardar Planificación" 
                        onPress={() => console.log("Planificación guardada")}
                        style={styles.botonMargen}
                    />
                </View>
            </View>
        </ScrollView>
    </SafeAreaView>
    );
};
export default CrearPlanificacion;

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
    titulo_secundario: {
        fontSize: 18,
        color: '#666',
        marginBottom: 5,
    },
    card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: 10  ,
    elevation: 2, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 10,
},
titulo_reservas: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,
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
        
    },
    botonMargen: {
        marginTop: 20,
        width: '100%', // Ajusta según necesites en esta vista
    }
});