import React from 'react';
import { Text, StyleSheet } from 'react-native';

/**
 * TituloSecundario - Un componente de texto reutilizable para subtítulos.
 * 
 * @param {string} titulo - El texto que se mostrará.
 * @param {object} style - Estilos adicionales (opcional).
 */
const TituloSecundario = ({ titulo, style }) => {
    return (
        <Text style={styles.titulo_secundario}>{titulo}</Text>
    );
};

const styles = StyleSheet.create({
    titulo_secundario: {
        fontSize: 18,
        color: '#666',
        marginBottom: 5,
    },
});

export default TituloSecundario;