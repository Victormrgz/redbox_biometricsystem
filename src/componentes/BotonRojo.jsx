import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

/**
 * BotonRojo - Un botón reutilizable con el estilo corporativo rojo.
 * 
 * @param {string} titulo - El texto que mostrará el botón.
 * @param {function} onPress - La función que se ejecutará al presionar.
 * @param {object} style - Estilos adicionales para el contenedor (opcional).
 */
const BotonRojo = ({ titulo, onPress, style }) => {
    return (
        <TouchableOpacity 
            style={[styles.button, styles.btnRed, style]} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={styles.textWhite}>{titulo}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
    },
    btnRed: {
        backgroundColor: '#e60000',
    },
    textWhite: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 14,
    },
});

export default BotonRojo;