import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * CardMisReservas - Componente para mostrar una tabla de reservas.
 * 
 * @param {Array} data - Lista de objetos con fecha, hora, estado y accion.
 */
const CardMisReservas = ({ data = [] }) => {
    return (
        <View style={styles.card}>
            {/* Encabezado de la tabla */}
            <View style={styles.headerRow}>
                <Text style={styles.colTitulo}>Fecha</Text>
                <Text style={styles.colTitulo}>Hora</Text>
                <Text style={styles.colTitulo}>Estado</Text>
                <Text style={styles.colTitulo}>Acciones</Text>
            </View>

            {/* Filas de datos */}
            {data.map((item, index) => (
                <View key={index}>
                    {index > 0 && <View style={styles.separator} />}
                    <View style={styles.dataRow}>
                        <Text style={styles.colDatos}>{item.fecha}</Text>
                        <Text style={styles.colDatos}>{item.hora}</Text>
                        <Text style={styles.colDatos}>{item.estado}</Text>
                        <View style={styles.colDatos}>
                            {item.accion === 'Cancelar' ? (
                                <TouchableOpacity onPress={() => console.log("Cancelar reserva", item.fecha)}>
                                    <Text style={styles.btnCancelar}>Cancelar</Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.colDatos}>-------</Text>
                            )}
                        </View>
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
        marginBottom: 10,
    },
    dataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
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
        fontSize: 12,
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 5,
    },
    btnCancelar: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 12,
    },
});

export default CardMisReservas;