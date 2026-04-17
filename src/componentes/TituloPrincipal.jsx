import React from 'react';
import { Text, StyleSheet } from 'react-native';

/**
 * BotonBlanco - Un botón reutilizable con estilo blanco y bordes.
 * 
 * @param {string} Titulo - El texto que mostrará el botón.
 * @param {object} style - Estilos adicionales para el contenedor (opcional).
 */
const TituloPrincipal = ({ titulo, style }) => {
    return (
        <Text style={styles.titulo_principal}>{titulo}</Text>
    );
};

const styles = StyleSheet.create({
    titulo_principal: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingBottom: 15,
    }
});

export default TituloPrincipal;    