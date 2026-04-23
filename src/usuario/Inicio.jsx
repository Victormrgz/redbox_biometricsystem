import React, { useState, useEffect } from 'react';
// ✅ IMPORTANTE: Todo lo de react-native va en una sola línea
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from 'react-native'; 
import HeaderColor from '../componentes/HeaderColor';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import BotonRojo from '../componentes/BotonRojo';
import BotonGris from '../componentes/BotonGris';
import BotonBlanco from '../componentes/BotonBlanco';
import CardPantallaInicio from '../componentes/CardPantallaInicio';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import { getUsuario } from '../api/conexion';

function Inicio() {
    const navigation = useNavigation();

    const [usuarios, setUsuarios] = useState([]);

    const loadUsuario = async () => {
        try {
            const response = await getUsuario();
            setUsuarios(response.data);
        } catch (error) {
            console.error('Error cargando usuario:', error);
        }
    };

    useEffect(() => {
        loadUsuario();
    }, []);


    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <HeaderColor />{/* Vista Inicio */}
                <View style={styles.content}>
                    <TituloPrincipal titulo="Hola" />
                    {Array.isArray(usuarios) && usuarios.map((usuarioItem) => (
                        <Text key={usuarioItem.id_usuario} style={{ fontSize: 24, fontWeight: 'bold' }}>
                            {usuarioItem.nombre_usuario}
                        </Text>
                    ))}
                    <TituloSecundario titulo="Bienvenido al panel de control" />
                    <TituloSecundario titulo="07/04/2026" />

                    <View style={styles.IMC}>
                        <Text style={styles.titulo_IMC}>Tu IMC actual: <Text style={styles.numero}>20.23</Text> <Text style={styles.normal}>(Normal)</Text> </Text>
                    </View>

                    <Text style={styles.titulo_reservas}>Tus últimas reservas</Text>

                    <View style={styles.reservas}>
                        <CardPantallaInicio fecha="07/11/2025" hora="06:00" />
                        <CardPantallaInicio fecha="08/11/2025" hora="18:00" />
                        <CardPantallaInicio fecha="09/11/2025" hora="12:00" />
                        <CardPantallaInicio fecha="09/11/2025" hora="12:00" />
                        <CardPantallaInicio fecha="09/11/2025" hora="12:00" />
                        <CardPantallaInicio fecha="09/11/2025" hora="12:00" />
                        <CardPantallaInicio fecha="09/11/2025" hora="12:00" />
                        <CardPantallaInicio fecha="09/11/2025" hora="12:00" />
                        <CardPantallaInicio fecha="09/11/2025" hora="12:00" />
                    </View>

                    <View style={styles.containerMenu}>
                        <View style={styles.row}>
                            <BotonRojo
                                titulo="Crear Planificación"
                                onPress={() => navigation.navigate('CrearPlanificacion')}
                                style={styles.botonGrid} />
                            <BotonRojo
                                titulo="Ver Planificación"
                                onPress={() => navigation.navigate('VerPlanificacion')}
                                style={styles.botonGrid} />
                        </View>

                        <View style={styles.row}>{/* Fila 2: Perfil y Roles */}
                            <BotonGris
                                titulo="Editar Perfil"
                                onPress={() => navigation.navigate('Perfil')}
                                style={styles.botonGrid} />
                            <BotonGris
                                titulo="Gestionar Roles"
                                onPress={() => navigation.navigate('GestionarRoles')}
                                style={styles.botonGrid} />
                        </View>

                        <BotonBlanco
                            titulo="Registrar Pago"
                            onPress={() => console.log("Registrar Pago")}
                            style={styles.botonFull} />

                        <BotonBlanco
                            titulo="Historial de pagos"
                            onPress={() => console.log("Historial de Pagos")}
                            style={styles.botonFull} />

                        <BotonBlanco
                            titulo="Suscripciones"
                            onPress={() => console.log("Suscripciones")}
                            style={styles.botonFull} />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff', // O el color de fondo de tu app
        // En Android, SafeAreaView a veces necesita un padding manual
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
    IMC: {
        marginVertical: 20,
        padding: 15,
        backgroundColor: '#D2EBD6',
        borderRadius: 10,
    },
    titulo_IMC: {
        fontSize: 16,
    },
    numero: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    normal: {
        fontSize: 16,
        color: '#2D733C',
    },
    titulo_reservas: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
    },
    containerMenu: {
        marginTop: -60, // Ajustado para eliminar el espacio con las cards
    },
    reservas: {
        flexDirection: 'row',       // Alinea en fila
        flexWrap: 'wrap',          // Permite que los elementos bajen a la siguiente línea
        justifyContent: 'flex-start', // Alinea al inicio
        paddingTop: 10,
    },  
    
    titulo_cancelar: {  
        fontSize: 10,             
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#FF4D4D',
    },
    row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    },
    botonGrid: {
        flex: 0.48, // Ocupa casi el 50% de la fila para permitir el espacio entre botones
    },
    botonFull: {
        width: '100%',
        marginBottom: 10,
    }
});

export default Inicio;