import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderColor from '../componentes/HeaderColor';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import BotonRojo from '../componentes/BotonRojo';
import BotonGris from '../componentes/BotonGris';
import { redBoxApi } from '../api/conexion';
import { AuthContext } from '../auth/AuthContext';
import useRoles from '../hooks/useRoles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const Invitaciones = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { usuario } = useContext(AuthContext);
    const { esAdministrador } = useRoles();
    
    const [invitaciones, setInvitaciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [refrescando, setRefrescando] = useState(false);
    const [generando, setGenerando] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [codigoGenerado, setCodigoGenerado] = useState('');
    const [copiado, setCopiado] = useState(false);

    useEffect(() => {
        if (!esAdministrador()) {
            Alert.alert('Acceso Denegado', 'No tienes permisos para ver esta pantalla.');
            navigation.goBack();
        }
        cargarInvitaciones();
    }, []);

    const cargarInvitaciones = async () => {
        try {
            setCargando(true);
            const token = await AsyncStorage.getItem('userToken');
            const response = await redBoxApi.get('/listar_invitaciones/', {
                headers: { Authorization: `Token ${token}` }
            });
            setInvitaciones(response.data);
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'No se pudieron cargar las invitaciones');
        } finally {
            setCargando(false);
        }
    };

    const onRefresh = async () => {
        setRefrescando(true);
        await cargarInvitaciones();
        setRefrescando(false);
    };

    const generarInvitacion = async () => {
        try {
            setGenerando(true);
            const token = await AsyncStorage.getItem('userToken');
            const response = await redBoxApi.post('/generar_invitacion/', {}, {
                headers: { Authorization: `Token ${token}` }
            });
            
            setCodigoGenerado(response.data.codigo);
            setModalVisible(true);
            await cargarInvitaciones();
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', error.response?.data?.error || 'No se pudo generar el código');
        } finally {
            setGenerando(false);
        }
    };

    const copiarCodigo = () => {
        // Simulación de copia
        setCopiado(true);
        setTimeout(() => setCopiado(false), 3000);
        Alert.alert('Código copiado', `Código: ${codigoGenerado}\n\nEnvía este código por WhatsApp al usuario.`);
    };

    const formatFecha = (fechaStr) => {
        if (!fechaStr) return '';
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEstadoBadge = (invitacion) => {
        if (invitacion.usado) {
            return { text: 'Usado', color: '#999', bg: '#f0f0f0' };
        } else if (invitacion.es_valido) {
            return { text: 'Válido', color: '#34C759', bg: '#E8F5E9' };
        } else {
            return { text: 'Expirado', color: '#FF3B30', bg: '#FFEBEE' };
        }
    };

    if (cargando) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF3B30" />
            </View>
        );
    }

    return (
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
            <ScrollView 
                style={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={['#FF3B30']} />
                }
            >
                <HeaderColor />
                <View style={styles.content}>
                    <TituloPrincipal titulo="Invitaciones" />
                    <TituloSecundario titulo="Genera códigos de invitación para nuevos usuarios." />

                    <BotonRojo 
                        titulo="Generar Código de Invitación"
                        onPress={generarInvitacion}
                        loading={generando}
                        style={styles.botonGenerar}
                    />

                    <Text style={styles.subtituloLista}>Historial de códigos generados</Text>

                    {invitaciones.length === 0 ? (
                        <View style={styles.vacio}>
                            <MaterialIcons name="email" size={48} color="#ccc" />
                            <Text style={styles.textoVacio}>No hay códigos de invitación generados</Text>
                        </View>
                    ) : (
                        invitaciones.map((inv) => {
                            const estado = getEstadoBadge(inv);
                            return (
                                <View key={inv.id_invitacion} style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.codigo}>{inv.codigo}</Text>
                                        <View style={[styles.badge, { backgroundColor: estado.bg }]}>
                                            <Text style={[styles.badgeText, { color: estado.color }]}>
                                                {estado.text}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.cardBody}>
                                        <Text style={styles.cardInfo}>
                                            <MaterialIcons name="person" size={14} color="#666" /> 
                                            Creado por: {inv.creado_por || 'Admin'}
                                        </Text>
                                        <Text style={styles.cardInfo}>
                                            <MaterialIcons name="access-time" size={14} color="#666" /> 
                                            {formatFecha(inv.creado_en)}
                                        </Text>
                                        {inv.usado_por && (
                                            <Text style={styles.cardInfo}>
                                                <MaterialIcons name="person" size={14} color="#666" /> 
                                                Usado por: {inv.usado_por}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* Modal de código generado */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <MaterialIcons name="check-circle" size={56} color="#34C759" />
                        <Text style={styles.modalTitulo}>¡Código Generado!</Text>
                        <Text style={styles.modalSubtitulo}>Copia este código y envíalo al usuario por WhatsApp</Text>
                        
                        <View style={styles.codigoContainer}>
                            <Text style={styles.codigoGrande}>{codigoGenerado}</Text>
                        </View>

                        <Text style={styles.modalExpiracion}>
                            ⏰ Válido por 30 minutos
                        </Text>

                        <View style={styles.modalBotones}>
                            <BotonGris 
                                titulo="Cerrar"
                                onPress={() => setModalVisible(false)}
                                style={styles.modalBoton}
                            />
                            <BotonRojo 
                                titulo="Copiar Código"
                                onPress={copiarCodigo}
                                style={styles.modalBoton}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            <StatusBar style="auto" />
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
    botonGenerar: {
        marginTop: 16,
        marginBottom: 24,
    },
    subtituloLista: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    vacio: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    textoVacio: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    codigo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    cardBody: {
        gap: 4,
    },
    cardInfo: {
        fontSize: 12,
        color: '#666',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        width: '85%',
        alignItems: 'center',
    },
    modalTitulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 12,
    },
    modalSubtitulo: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    codigoContainer: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 10,
        marginVertical: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    codigoGrande: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FF3B30',
        
        letterSpacing: 4,
    },
    modalExpiracion: {
        fontSize: 13,
        color: '#666',
        marginBottom: 20,
    },
    modalBotones: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalBoton: {
        flex: 1,
    },
});

export default Invitaciones;