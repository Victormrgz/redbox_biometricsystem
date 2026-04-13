import React from 'react';
// ✅ IMPORTANTE: Todo lo de react-native va en una sola línea
import { StyleSheet, View, Platform, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'; 
import { StatusBar } from 'expo-status-bar';
import HeaderColor from '../componentes/HeaderColor';
import Constants from 'expo-constants';

const MisReservas = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}> 
            <HeaderColor /> {/*Logo de la app*/}
                <View style={styles.content}>
                    <Text style={styles.titulo_principal}>Mis Reservas</Text>
                    <Text style={styles.titulo_secundario}>Consulta tu historial y resumen mensual de clases</Text>
                    <Text style={styles.titulo_reservas}>Creditos usados: <Text style={styles.titulo_secundario}>1</Text> </Text>
                    <Text style={styles.titulo_reservas}>Creditos disponibles: <Text style={styles.titulo_secundario}>23</Text></Text>
                    
                    <Text style={styles.titulo_reservas}>Marzo 2026</Text>
                    
                    <View style={styles.card}>
                                        {/* Grupo 1 */}
                        <View style={styles.headerRow}>
                            <Text style={styles.colTitulo}>Fecha</Text>
                            <Text style={styles.colTitulo}>Hora</Text>
                            <Text style={styles.colTitulo}>Estado</Text>
                            <Text style={styles.colTitulo}>Acciones</Text>
                        </View>
                        <View style={styles.dataRow}>
                            <Text style={styles.colDatos}>13/03/2026</Text>
                            <Text style={styles.colDatos}>10:00</Text>
                            <Text style={styles.colDatos}>Pendiente</Text>
                            <Text style={styles.colDatos}><Text style={styles.aux}>Cancelar</Text></Text>
                        </View>
                </View>

                    <Text style={styles.titulo_reservas}>Noviembre 2025</Text>

                    <View style={styles.card}>
                                        {/* Grupo 2 */}
                        <View style={styles.headerRow}>
                            <Text style={styles.colTitulo}>Fecha</Text>
                            <Text style={styles.colTitulo}>Hora</Text>
                            <Text style={styles.colTitulo}>Estado</Text>
                            <Text style={styles.colTitulo}>Acciones</Text>
                        </View>
                        <View style={styles.dataRow}>
                            <Text style={styles.colDatos}>12/11/2025</Text>
                            <Text style={styles.colDatos}>10:00</Text>
                            <Text style={styles.colDatos}>Pendiente</Text>
                            <Text style={styles.colDatos}>-------</Text>
                        </View>
                    
                        <View style={styles.separator} />
                    
                        {/* Grupo 2 */}
                        <View style={styles.dataRow}>
                            <Text style={styles.colDatos}>13/03/2026</Text>
                            <Text style={styles.colDatos}>10:00</Text>
                            <Text style={styles.colDatos}>Pendiente</Text>
                            <Text style={styles.colDatos}>-------</Text>
                        </View>

                        <View style={styles.separator} />
                                    
                        <View style={styles.dataRow}>
                            <Text style={styles.colDatos}>13/03/2026</Text>
                            <Text style={styles.colDatos}>10:00</Text>
                            <Text style={styles.colDatos}>Pendiente</Text>
                            <Text style={styles.colDatos}>-------</Text>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.dataRow}>
                            <Text style={styles.colDatos}>13/03/2026</Text>
                            <Text style={styles.colDatos}>10:00</Text>
                            <Text style={styles.colDatos}>Pendiente</Text>
                            <Text style={styles.colDatos}>-------</Text>
                        </View>
                    </View>
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
  dataRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  colTitulo: {
    flex: 2.5, // Más espacio para el nombre del ejercicio
    fontWeight: 'bold',
    color: '#000',
    fontSize: 14,
  },
  colDatos: {
    flex: 2.5,
    color: '#444',
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
    aux: {
        color: 'red',
        fontWeight: 'bold',
    },    
    
});

export default MisReservas;