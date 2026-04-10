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
    
});

export default MisReservas;