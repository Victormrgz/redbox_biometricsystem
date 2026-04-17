import React from 'react';
import { Text, StyleSheet } from 'react-native';

/**
 * BotonBlanco - Un botón reutilizable con estilo blanco y bordes.
 * 
 * @param {string} Titulo - El texto que mostrará el botón.
 * @param {object} style - Estilos adicionales para el contenedor (opcional).
 */
const TituloTerciario = ({ titulo, style }) => {
    return (
        <Text style={styles.titulo_terciario}>{titulo}</Text>
    );
};

const styles = StyleSheet.create({
    titulo_terciario: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,
    },
});

export default TituloTerciario;    