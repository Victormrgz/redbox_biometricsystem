import React, { useState } from 'react';
import { TouchableOpacity, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { descargarPDFHistorial } from '../api/conexion';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BotonDescargarPDF = ({ idPago, titulo = "Descargar PDF" }) => {
    const [cargando, setCargando] = useState(false);

    const descargarPDF = async () => {
        try {
            setCargando(true);
            const token = await AsyncStorage.getItem('userToken');
            
            const pdfData = await descargarPDFPago(idPago, token);
            
            // Guardar archivo temporal
            const fileUri = FileSystem.documentDirectory + `pago_${idPago}.pdf`;
            await FileSystem.writeAsStringAsync(fileUri, pdfData, {
                encoding: FileSystem.EncodingType.Base64,
            });
            
            // Compartir/guardar archivo
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert('Descarga completa', 'El PDF se ha guardado en tu dispositivo');
            }
            
        } catch (error) {
            console.error('Error descargando PDF:', error);
            Alert.alert('Error', 'No se pudo descargar el PDF');
        } finally {
            setCargando(false);
        }
    };

    return (
        <TouchableOpacity 
            style={styles.boton} 
            onPress={descargarPDF} 
            disabled={cargando}
        >
            {cargando ? (
                <ActivityIndicator color="#fff" size="small" />
            ) : (
                <Text style={styles.texto}>{titulo}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    boton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    texto: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default BotonDescargarPDF;