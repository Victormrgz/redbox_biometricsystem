import React, { useState, useContext, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native'; 
import HeaderColor from '../componentes/HeaderColor';
import { useNavigation, useFocusEffect} from '@react-navigation/native';
import BotonRojo from '../componentes/BotonRojo';
import BotonGris from '../componentes/BotonGris';
import BotonBlanco from '../componentes/BotonBlanco';
import CardPantallaInicio from '../componentes/CardPantallaInicio';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { redBoxApi } from '../api/conexion';
import { AuthContext } from '../auth/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useRoles from '../hooks/useRoles';

function Inicio() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { usuario, actualizarUsuario, cargandoAuth } = useContext(AuthContext);
    const { esAdministrador, esEntrenador, esUsuario, rol } = useRoles();
    const [reservas, setReservas] = useState([]);
    const [cargandoReservas, setCargandoReservas] = useState(true);
    const [imc, setImc] = useState(null);
    const [clasificacionIMC, setClasificacionIMC] = useState('');
    const [colorIMC, setColorIMC] = useState('');

    // Función para calcular el IMC
    const calcularIMC = (peso, altura) => {
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
    };

    useEffect(() => {
        if (usuario && usuario.peso && usuario.altura) {
            calcularIMC(parseFloat(usuario.peso), parseFloat(usuario.altura));
        }
    }, [usuario]);

    const obtenerReservas = async () => {
        setCargandoReservas(true);
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

    const handleCancelar = (idClase) => {
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
                            obtenerReservas();
                        } catch (error) {
                            console.error("Error al cancelar:", error);
                            Alert.alert("Error", "No se pudo cancelar la clase.");
                        }
                    }
                }
            ]
        );
    };

    useFocusEffect(
        useCallback(() => {
            const verificarYRefrescar = async () => {
                if (!usuario) {
                    await actualizarUsuario();
                }
                obtenerReservas();
            };
            verificarYRefrescar();
        }, [usuario])
    );

    const fechaActual = new Date().toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    // Mostrar rol del usuario 
    console.log('Rol del usuario:', rol);

    return (
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
            <ScrollView style={styles.container}>
                <HeaderColor />
                <View style={styles.content}>
                    {cargandoAuth ? (
                        <ActivityIndicator color="red" size="small" />
                    ) : (
                        <>
                            <TituloPrincipal titulo={`Hola ${usuario?.pnombre_usuario || 'Usuario'}`} />
                        </>
                    )}

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
                            reservas.map((reserva, index) => (
                                <CardPantallaInicio 
                                    key={index}
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
                        
                        {/* BOTONES PARA ADMINISTRADOR */}
                        {esAdministrador() && (
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
                        )}

                        {/* BOTONES PARA ENTRENADOR */}
                        {esEntrenador() && (
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
                        )}

                        {/* BOTONES PARA USUARIO NORMAL */}
                        {esUsuario() && (
                            <>
                                <View style={styles.row}>
                                    <BotonGris titulo="Editar Perfil" onPress={() => navigation.navigate('Perfil')} style={styles.botonGrid} />
                                    <BotonGris titulo="Ver Planificación" onPress={() => navigation.navigate('VerPlanificacion')} style={styles.botonGrid} />
                                </View>
                                <BotonBlanco titulo="Historial de pagos" onPress={() => navigation.navigate('HistoricoPagos')} style={styles.botonFull} />
                                <BotonBlanco titulo="Mi Suscripción" onPress={() => navigation.navigate('Suscripciones')} style={styles.botonFull} />
                            </>
                        )}
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
    rolBadge: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 15,
        fontSize: 12,
        textAlign: 'center',
        alignSelf: 'flex-start',
        marginTop: 5,
        color: '#666',
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