import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * BotonBlanco - Un botón reutilizable con estilo blanco y bordes.
 * 
 * @param {string} fecha - El texto que mostrará el botón.
 * @param {function} hora- La función que se ejecutará al presionar.
 * @param {object} style - Estilos adicionales para el contenedor (opcional).
 */
const CardPantallaInicio = ({ fecha, hora, onCancelar }) => {
    return (
        <View style={styles.card}> 
            <Text style={{ fontWeight: 'bold' }}>{fecha}</Text>
            <Text>{hora}</Text>
            <TouchableOpacity 
                onPress={onCancelar} 
                style={styles.botonCancelarCard}
            >
                <Text style={styles.titulo_cancelar}>CANCELAR</Text>
            </TouchableOpacity>
        </View>
    );
};

// Estilos sugeridos para la card
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
    btnCancelar: {
        marginTop: 5,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 5,
        backgroundColor: '#FFF1F1', // Fondo rosado suave
        borderWidth: 1,
        borderColor: '#FF4D4D',
    },
    titulo_cancelar: {  
        fontSize: 10,             
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#FF4D4D',
    },
});

export default CardPantallaInicio;