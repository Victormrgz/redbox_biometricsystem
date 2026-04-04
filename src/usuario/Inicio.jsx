import React from 'react';
import { StyleSheet, View, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
// Asegúrate de que la ruta sea correcta según tu estructura
import LogoColor from '../../assets/logocolor.svg'; 

const Inicio = () => {
    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            
            {/* Contenedor del Logo alineado arriba a la izquierda */}
            <View style={styles.header}>
                <LogoColor width={150} height={30} />
            </View>

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
    header: {
        width: '100%',
        flexDirection: 'row', // Para alinear a la izquierda
        justifyContent: 'flex-start', 
        paddingLeft: 15,    // Aquí estaba tu error (ahora es paddingLeft)
        paddingVertical: 10,
        backgroundColor: '#262626', 
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default Inicio;