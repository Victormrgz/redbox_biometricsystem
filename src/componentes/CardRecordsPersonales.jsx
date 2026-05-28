import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CardRecordsPersonales = ({ data }) => {
    return (
        <View style={styles.container}>
            {data.map((record, index) => (
                <View key={index} style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.movimiento}>{record.movimiento}</Text>
                        <Text style={styles.peso}>{record.peso}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.fecha}>📅 {record.fecha}</Text>
                        <Text style={styles.detalles}>🔄 {record.rondas} rondas • 🔁 {record.repeticiones} reps</Text>
                    </View>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
    },
    card: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    movimiento: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    peso: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e60000',
    },
    fecha: {
        fontSize: 12,
        color: '#666',
    },
    detalles: {
        fontSize: 12,
        color: '#666',
    },
});

export default CardRecordsPersonales;