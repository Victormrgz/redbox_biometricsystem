import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * CardRecordsPersonales - Muestra una tabla de récords personales.
 * 
 * @param {Array} data - Lista de objetos con movimiento, peso y fecha.
 */
const CardRecordsPersonales = ({ data = [] }) => {
    return (
        <View style={styles.card}>
            {/* Encabezado */}
            <View style={styles.headerRow}>
                <Text style={styles.colTitulo}>Movimiento</Text>
                <Text style={styles.colTitulo}>Peso</Text>
                <Text style={styles.colTitulo}>Fecha</Text>
            </View>

            {/* Filas de datos */}
            {data.map((item, index) => (
                <View key={index}>
                    {index > 0 && <View style={styles.separator} />}
                    <View style={styles.dataRow}>
                        <Text style={styles.colDatos}>{item.movimiento}</Text>
                        <Text style={styles.colDatos}>{item.peso}</Text>
                        <Text style={styles.colDatos}>{item.fecha}</Text>
                    </View>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    headerRow: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    dataRow: {
        flexDirection: 'row',
        paddingVertical: 8,
    },
    colTitulo: {
        flex: 1,
        fontWeight: 'bold',
        color: '#000',
        fontSize: 14,
    },
    colDatos: {
        flex: 1,
        color: '#444',
        fontSize: 14,
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
    },
});

export default CardRecordsPersonales;