import React, { useState } from 'react';
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



const Clases = () => {
    const navigation = useNavigation();
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
                <TituloPrincipal titulo="Clases" />
                <TituloTerciario titulo="Fecha:" />

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

                <TituloTerciario titulo="Hora:" />

                <View style={styles.contenedor_fecha}>
                    <TouchableOpacity onPress={() => setShowTime(true)} style={styles.boton_fecha}> 
                        <TextInput
                            placeholder='Hora'
                            editable={false}
                            value={formData.time ? new Date(formData.time).toLocaleTimeString() : ''}
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

                <BotonRojo titulo="Reservar Clase" onPress={() => console.log('Reservar Clase')} style={styles.botonMargen} />

                <BotonGris titulo="Ver Reservas" onPress={() => {console.log('Ver Reservas')}} style={styles.botonMargen} />

                <TituloTerciario titulo="Planificación del dia:" />
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