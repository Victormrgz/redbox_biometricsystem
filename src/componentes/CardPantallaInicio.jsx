import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * BotonBlanco - Un botón reutilizable con estilo blanco y bordes.
 * 
 * @param {string} fecha - El texto que mostrará el botón.
 * @param {function} hora- La función que se ejecutará al presionar.
 * @param {object} style - Estilos adicionales para el contenedor (opcional).
 */
const CardPantallaInicio = ({ fecha, hora, style }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.titulo_cards}>{fecha}</Text>
            <Text style={styles.titulo_cards}>{hora}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        width: '30%', 
        aspectRatio: 1,            
        margin: '1.5%',            
        padding: 5,
        borderRadius: 10,
        justifyContent: 'center',  
        alignItems: 'center',      
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
    },
    titulo_cards: {
        fontSize: 10,             
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default CardPantallaInicio;