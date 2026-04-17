import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from 'react-native'; 
import HeaderColor from '../componentes/HeaderColor';
import Constants from 'expo-constants';
import DateTimePicker  from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import TituloTerciario from '../componentes/TituloTerciario';
import BotonRojo from '../componentes/BotonRojo';
import CardRecordsPersonales from '../componentes/CardRecordsPersonales';


const MisResultados = () => {
    const [showDate, setShowDate] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
    });

    // Datos de ejemplo para los records
    const misRecords = [
        { movimiento: 'Snatch', peso: '155,0lb', fecha: '06/10/2025' },
        { movimiento: 'Power Snatch', peso: '150,0lb', fecha: '18/09/2025' },
        { movimiento: 'Clean & Jerk', peso: '195,0lb', fecha: '05/10/2025' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}> 
            <HeaderColor />

            <View style={styles.content}>
                <TituloPrincipal titulo="Mis Resultados" />
                <TituloSecundario titulo="Registra tus levantamientos y consulta tus records personales." />

                <View style={styles.contenedor_grid}>
                    <View style={styles.grid_item}>
                        <TituloTerciario titulo="Movimiento:" />
                        <TouchableOpacity style={styles.dropdownBusca} onPress={() => {/* Lógica para abrir lista */}}>
                            <Text style={styles.textValue}>----------</Text>
                            <MaterialIcons name="keyboard-arrow-down" size={24} color="gray" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.grid_item}>
                        <TituloTerciario titulo="Fecha:" />
                        <View style={styles.contenedor_fecha}>
                        <TouchableOpacity onPress={() => setShowDate(true)} style={styles.boton_fecha} > 
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
                    </View>
                    <View style={styles.grid_item}>
                        <TituloTerciario titulo="Rondas:" />
                        <TextInput
                            style={styles.input}
                            editable={false}              // <--- Evita que el usuario escriba
                            selectTextOnFocus={false}     // Evita que se resalte el texto
                        />
                    </View>
                    <View style={styles.grid_item}>
                        <TituloTerciario titulo="Repeticiones:" />
                        <TextInput
                            style={styles.input}
                            editable={false}              // <--- Evita que el usuario escriba
                            selectTextOnFocus={false}     // Evita que se resalte el texto
                        />
                    </View>
                    <View style={styles.grid_item}>
                        <TituloTerciario titulo="Peso:" />
                        <TextInput
                            style={styles.input}
                            editable={false}              // <--- Evita que el usuario escriba
                            selectTextOnFocus={false}     // Evita que se resalte el texto
                        />
                    </View>
                    <View style={styles.grid_item}>
                        <TituloTerciario titulo="Unidad:" />
                        <TouchableOpacity style={styles.dropdownBusca} onPress={() => {/* Lógica para abrir lista */}}>
                            <Text style={styles.textValue}>----------</Text>
                            <MaterialIcons name="keyboard-arrow-down" size={24} color="gray" />
                        </TouchableOpacity>
                    </View>
                </View>

                <BotonRojo 
                        titulo="Guardar Resultados" 
                        onPress={() => console.log('Guardar Resultados')}
                        style={styles.botonMargen}
                />

                 <TituloTerciario titulo="Tus records personales:" />
                 <CardRecordsPersonales data={misRecords} />
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
    titulo_reservas: { // Se mantiene por si se usa en otros textos internos
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
    },
    contenedor_grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    grid_item: {
        width: '48%',
        padding: 10,    
    },
    
    dropdownBusca: {
    flexDirection: 'row',       // Alinea texto y flecha
    alignItems: 'center',       // Centra verticalmente
    justifyContent: 'space-between', // Empuja la flecha a la derecha
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 45,
    backgroundColor: '#fff',
    },
    input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,           // Bordes redondeados como en la imagen
    paddingHorizontal: 10,
    backgroundColor: '#fff',
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
        marginBottom: 20,
        width: '100%',
    }
});

export default MisResultados;