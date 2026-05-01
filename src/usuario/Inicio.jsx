import React, { useState, useEffect, useCallback } from 'react';
// ✅ IMPORTANTE: Todo lo de react-native va en una sola línea
import { StyleSheet, View, Text, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native'; 
import HeaderColor from '../componentes/HeaderColor';
import Constants from 'expo-constants';
import { useNavigation, useFocusEffect} from '@react-navigation/native';
import BotonRojo from '../componentes/BotonRojo';
import BotonGris from '../componentes/BotonGris';
import BotonBlanco from '../componentes/BotonBlanco';
import CardPantallaInicio from '../componentes/CardPantallaInicio';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUsuarioById, redBoxApi } from '../api/conexion';


function Inicio() {
    const navigation = useNavigation();
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [reservas, setReservas] = useState([]);
    const [cargandoUsuario, setCargandoUsuario] = useState(true);
    const [cargandoReservas, setCargandoReservas] = useState(true);

    // 1. Función para cargar el usuario (esta puede quedarse igual o en useFocusEffect)
    const obtenerUsuario = async () => {
        try {
            const id = await AsyncStorage.getItem('userId');
            if (id) {
                const datos = await getUsuarioById(JSON.parse(id));
                setNombreUsuario(datos.pnombre_usuario);
            }
        } catch (error) {
            console.error("Error cargando perfil:", error);
        } finally {
            setCargandoUsuario(false);
        }
    };

    // 2. Función para cargar las reservas
    const obtenerReservas = async () => {
        setCargandoReservas(true); // Mostrar carga mientras se actualiza
        try {
            const id = await AsyncStorage.getItem('userId');
            if (id) {
                const respuesta = await redBoxApi.get(`/clases/?id_usuario=${JSON.parse(id)}`);
                setReservas(respuesta.data);
            }
        } catch (error) {
            console.error("Error cargando reservas:", error);
        } finally {
            setCargandoReservas(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            obtenerUsuario();
            obtenerReservas();
        }, [])
    );

    const fechaActual = new Date().toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <HeaderColor />
                <View style={styles.content}>
                    {cargandoUsuario ? (
                        <ActivityIndicator color="red" size="small" />
                    ) : (
                        <TituloPrincipal titulo={`Hola ${nombreUsuario}`} />
                    )}

                    <TituloSecundario titulo="Bienvenido al panel de control" />
                    <TituloSecundario titulo={fechaActual} />

                    <View style={styles.IMC}>
                        <Text style={styles.titulo_IMC}>
                            Tu IMC actual: <Text style={styles.numero}>20.23</Text> <Text style={styles.normal}>(Normal)</Text>
                        </Text>
                    </View>

                    <Text style={styles.titulo_reservas}>Tus últimas reservas</Text>

                    <View style={styles.reservas}>
                        {cargandoReservas ? (
                            <ActivityIndicator color="gray" />
                        ) : reservas.length > 0 ? (
                            reservas.map((reserva, index) => (
                                <CardPantallaInicio 
                                    key={index}
                                    fecha={new Date(reserva.fecha_clase).toLocaleDateString('es-ES')} 
                                    hora={reserva.hora_inicio_clase ? reserva.hora_inicio_clase.substring(0, 5) : '--:--'} 
                                />
                            ))
                        ) : (
                            <Text style={styles.sinReservas}>No tienes reservas activas.</Text>
                        )}
                    </View>

                    <View style={styles.containerMenu}>
                        <View style={styles.row}>
                            <BotonRojo titulo="Crear Planificación" onPress={() => navigation.navigate('Clases')} style={styles.botonGrid} />
                            <BotonRojo titulo="Ver Planificación" onPress={() => navigation.navigate('VerPlanificacion')} style={styles.botonGrid} />
                        </View>
                        <View style={styles.row}>
                            <BotonGris titulo="Editar Perfil" onPress={() => navigation.navigate('Perfil')} style={styles.botonGrid} />
                            <BotonGris titulo="Gestionar Roles" onPress={() => navigation.navigate('GestionarRoles')} style={styles.botonGrid} />
                        </View>
                        <BotonBlanco titulo="Registrar Pago" onPress={() => console.log("Pago")} style={styles.botonFull} />
                        <BotonBlanco titulo="Historial de pagos" onPress={() => console.log("Historial")} style={styles.botonFull} />
                        <BotonBlanco titulo="Suscripciones" onPress={() => console.log("Suscripciones")} style={styles.botonFull} />
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
    sinReservas: {
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