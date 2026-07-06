import React, { useState, useContext, useCallback, useEffect, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderColor from '../componentes/HeaderColor';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import BotonRojo from '../componentes/BotonRojo';
import BotonGris from '../componentes/BotonGris';
import BotonBlanco from '../componentes/BotonBlanco';
import CardPantallaInicio from '../componentes/CardPantallaInicio';
import { redBoxApi } from '../api/conexion';
import { AuthContext } from '../auth/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useRoles from '../hooks/useRoles';

function Inicio() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { usuario, actualizarUsuario, cargandoAuth } = useContext(AuthContext);
    const { esAdministrador, esEntrenador, esUsuario, rol } = useRoles();
    
    // ✅ Estados
    const [reservas, setReservas] = useState([]);
    const [cargandoReservas, setCargandoReservas] = useState(true);
    const [cargaInicial, setCargaInicial] = useState(true);
    const [reservasCargadas, setReservasCargadas] = useState(false);
    const [imc, setImc] = useState(null);
    const [clasificacionIMC, setClasificacionIMC] = useState('');
    const [colorIMC, setColorIMC] = useState('');

    // ✅ Función para calcular el IMC
    const calcularIMC = useCallback((peso, altura) => {
        if (!peso || !altura || altura <= 0 || peso <= 0) {
            setImc(null);
            setClasificacionIMC('No disponible');
            setColorIMC('#999');
            return;
        }
        
        const alturaEnMetros = altura / 100;
        const imcCalculado = peso / (alturaEnMetros * alturaEnMetros);
        const imcRedondeado = imcCalculado.toFixed(2);
        setImc(imcRedondeado);
        
        let clasificacion = '';
        let color = '';
        
        if (imcCalculado < 18.5) {
            clasificacion = 'Bajo peso';
            color = '#FFA500';
        } else if (imcCalculado >= 18.5 && imcCalculado < 25) {
            clasificacion = 'Normal';
            color = '#2D733C';
        } else if (imcCalculado >= 25 && imcCalculado < 30) {
            clasificacion = 'Sobrepeso';
            color = '#FFA500';
        } else if (imcCalculado >= 30 && imcCalculado < 35) {
            clasificacion = 'Obesidad I';
            color = '#FF6B6B';
        } else if (imcCalculado >= 35 && imcCalculado < 40) {
            clasificacion = 'Obesidad II';
            color = '#FF3B30';
        } else if (imcCalculado >= 40) {
            clasificacion = 'Obesidad III (Mórbida)';
            color = '#CC0000';
        }
        
        setClasificacionIMC(clasificacion);
        setColorIMC(color);
    }, []);

    // ✅ Función para obtener reservas (con caché)
    const obtenerReservas = useCallback(async (forzar = false) => {
        if (!forzar && reservasCargadas) {
            console.log('🔄 Reservas ya cargadas, omitiendo...');
            return;
        }
        
        try {
            setCargandoReservas(true);
            const id = await AsyncStorage.getItem('userId');
            if (id) {
                const respuesta = await redBoxApi.get(`/clases/?id_usuario=${JSON.parse(id)}`);
                setReservas(respuesta.data);
                setReservasCargadas(true);
            }
        } catch (error) {
            console.error("Error cargando reservas:", error);
        } finally {
            setCargandoReservas(false);
        }
    }, [reservasCargadas]);

    // ✅ Cargar datos SOLO UNA VEZ al montar
    useEffect(() => {
        const cargarDatosIniciales = async () => {
            if (usuario) {
                await obtenerReservas(true);
                calcularIMC(usuario.peso, usuario.altura);
            }
            setCargaInicial(false);
        };
        cargarDatosIniciales();
    }, []); // ← Dependencias vacías = solo una vez

    // ✅ Calcular IMC cuando cambia el usuario
    useEffect(() => {
        if (usuario && usuario.peso && usuario.altura) {
            calcularIMC(parseFloat(usuario.peso), parseFloat(usuario.altura));
        }
    }, [usuario?.peso, usuario?.altura]);

    // ✅ Solo refrescar cuando la pantalla recibe foco (si es necesario)
    useFocusEffect(
        useCallback(() => {
            // Solo refrescar si ya pasó la carga inicial
            if (!cargaInicial && usuario) {
                // ✅ Recargar reservas solo si hay cambios
                obtenerReservas();
            }
        }, [cargaInicial, usuario, obtenerReservas])
    );

    // ✅ Cancelar reserva
    const handleCancelar = useCallback((idClase) => {
        Alert.alert(
            "Cancelar Reserva",
            "¿Estás seguro de que quieres cancelar esta clase? Se te devolverá el crédito.",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Sí, cancelar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await redBoxApi.post(`/clases/${idClase}/cancelar/`);
                            Alert.alert("Éxito", "Clase cancelada correctamente.");
                            actualizarUsuario();
                            // ✅ Forzar recarga de reservas
                            await obtenerReservas(true);
                        } catch (error) {
                            console.error("Error al cancelar:", error);
                            Alert.alert("Error", "No se pudo cancelar la clase.");
                        }
                    }
                }
            ]
        );
    }, [actualizarUsuario, obtenerReservas]);

    // ✅ Memoizar botones por rol
    const botonesAdmin = useMemo(() => (
        <>
            <View style={styles.row}>
                <BotonRojo titulo="Crear Planificación" onPress={() => navigation.navigate('CrearPlanificacion')} style={styles.botonGrid} />
                <BotonRojo titulo="Ver Planificación" onPress={() => navigation.navigate('VerPlanificacion')} style={styles.botonGrid} />
            </View>
            <View style={styles.row}>
                <BotonGris titulo="Editar Perfil" onPress={() => navigation.navigate('Perfil')} style={styles.botonGrid} />
                <BotonGris titulo="Gestionar Roles" onPress={() => navigation.navigate('GestionarRoles')} style={styles.botonGrid} />
            </View>
            <BotonBlanco titulo="Registrar Pago" onPress={() => navigation.navigate('RegistrarPago')} style={styles.botonFull} />
            <BotonBlanco titulo="Historial de pagos" onPress={() => navigation.navigate('HistoricoPagos')} style={styles.botonFull} />
            <BotonBlanco titulo="Suscripciones" onPress={() => navigation.navigate('Suscripciones')} style={styles.botonFull} />
            <BotonBlanco titulo="Horarios Entrenadores" onPress={() => navigation.navigate('GestionarHorarioEntrenador')} style={styles.botonFull} />
            <BotonBlanco titulo="Invitaciones" onPress={() => navigation.navigate('Invitaciones')} style={styles.botonFull} />
        </>
    ), [navigation]);

    const botonesEntrenador = useMemo(() => (
        <>
            <View style={styles.row}>
                <BotonRojo titulo="Crear Planificación" onPress={() => navigation.navigate('CrearPlanificacion')} style={styles.botonGrid} />
                <BotonRojo titulo="Ver Planificación" onPress={() => navigation.navigate('VerPlanificacion')} style={styles.botonGrid} />
            </View>
            <View style={styles.row}>
                <BotonGris titulo="Editar Perfil" onPress={() => navigation.navigate('Perfil')} style={styles.botonGrid} />
                <BotonGris titulo="Gestionar Clases" onPress={() => navigation.navigate('GestionarClases')} style={styles.botonGrid} />
            </View>
            <BotonBlanco titulo="Mis Horarios" onPress={() => navigation.navigate('VerHorarioEntrenador')} style={styles.botonFull} />
            <BotonBlanco titulo="Resultados Alumnos" onPress={() => navigation.navigate('ResultadosAlumnos')} style={styles.botonFull} />
        </>
    ), [navigation]);

    const botonesUsuario = useMemo(() => (
        <>
            <View style={styles.row}>
                <BotonGris titulo="Editar Perfil" onPress={() => navigation.navigate('Perfil')} style={styles.botonGrid} />
                <BotonGris titulo="Ver Planificación" onPress={() => navigation.navigate('VerPlanificacion')} style={styles.botonGrid} />
            </View>
            <BotonBlanco titulo="Historial de pagos" onPress={() => navigation.navigate('HistoricoPagos')} style={styles.botonFull} />
            <BotonBlanco titulo="Mi Suscripción" onPress={() => navigation.navigate('Suscripciones')} style={styles.botonFull} />
        </>
    ), [navigation]);

    // ✅ Mostrar loading solo la primera vez
    if (cargandoAuth || cargaInicial) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF3B30" />
            </View>
        );
    }

    const fechaActual = new Date().toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    // ✅ Determinar qué botones mostrar
    let botones = null;
    if (esAdministrador()) botones = botonesAdmin;
    else if (esEntrenador()) botones = botonesEntrenador;
    else if (esUsuario()) botones = botonesUsuario;

    return (
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
            <ScrollView style={styles.container}>
                <HeaderColor />
                <View style={styles.content}>
                    <TituloPrincipal titulo={`Hola ${usuario?.pnombre_usuario || 'Usuario'}`} />
                    <TituloSecundario titulo="Bienvenido al panel de control" />
                    <TituloSecundario titulo={fechaActual} />

                    <View style={styles.IMC}>
                        <Text style={styles.titulo_IMC}>
                            Tu IMC actual: {' '}
                            {imc ? (
                                <>
                                    <Text style={styles.numero}>{imc}</Text>
                                    {' '}
                                    <Text style={[styles.clasificacion, { color: colorIMC }]}>
                                        ({clasificacionIMC})
                                    </Text>
                                </>
                            ) : (
                                <Text style={styles.sinDatos}>Actualiza tu peso y altura en Editar Perfil</Text>
                            )}
                        </Text>
                    </View>

                    <Text style={styles.titulo_reservas}>Tus últimas reservas</Text>

                    <View style={styles.reservas}>
                        {cargandoReservas ? (
                            <ActivityIndicator color="gray" />
                        ) : reservas.length > 0 ? (
                            reservas.slice(0, 3).map((reserva, index) => (
                                <CardPantallaInicio
                                    key={reserva.id_clase || index}
                                    fecha={new Date(reserva.fecha_clase).toLocaleDateString('es-ES')}
                                    hora={reserva.hora_inicio_clase ? reserva.hora_inicio_clase.substring(0, 5) : '--:--'}
                                    onCancelar={() => handleCancelar(reserva.id_clase)}
                                />
                            ))
                        ) : (
                            <Text style={styles.sinReservas}>No tienes reservas activas.</Text>
                        )}
                    </View>

                    {/* BOTONES SEGÚN ROL */}
                    <View style={styles.containerMenu}>
                        {botones}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
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
        color: '#333',
    },
    clasificacion: {
        fontSize: 14,
        fontWeight: '600',
    },
    sinDatos: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
    },
    titulo_reservas: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
    },
    containerMenu: {
        marginTop: 10,
    },
    reservas: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingTop: 10,
    },
    sinReservas: {
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    botonGrid: {
        flex: 0.48,
    },
    botonFull: {
        width: '100%',
        marginBottom: 10,
    },
});

export default Inicio;