import React from 'react';
import { StyleSheet, View, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import HeaderColor from '../componentes/HeaderColor';

const Inicio = () => {
    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            
            <HeaderColor />
            

            {/* Aquí puedes poner el resto de tu contenido */}
            <View style={styles.content}>
                {/* Contenido principal aquí */}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        // Esto empuja el contenido debajo de la barra de estado en Android
        paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default Inicio;