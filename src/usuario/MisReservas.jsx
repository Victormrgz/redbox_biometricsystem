import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from 'react-native'; 
import HeaderColor from '../componentes/HeaderColor';
import Constants from 'expo-constants';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import TituloTerciario from '../componentes/TituloTerciario';
import CardMisReservas from '../componentes/CardMisReservas';

const MisReservas = () => {
    // Datos de ejemplo para las tablas
    const reservasMarzo = [
        { fecha: '13/03/2026', hora: '10:00', estado: 'Pendiente', accion: 'Cancelar' }
    ];

    const reservasNoviembre = [
        { fecha: '12/11/2025', hora: '10:00', estado: 'Pendiente', accion: '' },
        { fecha: '13/03/2026', hora: '10:00', estado: 'Pendiente', accion: '' },
        { fecha: '13/03/2026', hora: '10:00', estado: 'Pendiente', accion: '' },
        { fecha: '13/03/2026', hora: '10:00', estado: 'Pendiente', accion: '' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}> 
            <HeaderColor />
            <View style={styles.content}>
                <TituloPrincipal titulo="Mis Reservas" />
                <TituloSecundario titulo="Consulta tu historial y resumen mensual de clases." />
                
                <Text style={styles.titulo_creditos}>Creditos usados: <Text style={styles.texto_valor}>1</Text></Text>
                <Text style={styles.titulo_creditos}>Creditos disponibles: <Text style={styles.texto_valor}>23</Text></Text>
                
                <TituloTerciario titulo="Marzo 2026" />
                <CardMisReservas data={reservasMarzo} />

                <TituloTerciario titulo="Noviembre 2025" />
                <CardMisReservas data={reservasNoviembre} />
            </View>
        </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff', // O el color de fondo de tu app
        paddingTop: Constants.statusBarHeight,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff', 
    },
    content: {
        flex: 1,
        padding: 20,
    },
    titulo_creditos: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
    },
    texto_valor: {
        fontSize: 18,
        color: '#666',
    }
});
export default MisReservas;