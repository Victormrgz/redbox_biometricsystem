import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal
} from 'react-native';
import HeaderColor from '../componentes/HeaderColor';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { redBoxApi } from '../api/conexion';
import { AuthContext } from '../auth/AuthContext';
import Icon from '@expo/vector-icons/MaterialIcons';

const GestionarRoles = () => {
    const insets = useSafeAreaInsets();
    const { usuario } = useContext(AuthContext);
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [rolSeleccionado, setRolSeleccionado] = useState('');
    const [cargandoCambio, setCargandoCambio] = useState(false);

    const rolesDisponibles = ['Administrador', 'Entrenador', 'Usuario'];

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            setCargando(true);
            const token = await AsyncStorage.getItem('userToken');
            
            const response = await redBoxApi.get('/usuarios_con_roles/', {
                headers: { Authorization: `Token ${token}` }
            });
            
            setUsuarios(response.data);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            if (error.response?.status === 403) {
                Alert.alert('Error', 'No tienes permisos de administrador');
            } else {
                Alert.alert('Error', 'No se pudieron cargar los usuarios');
            }
        } finally {
            setCargando(false);
        }
    };

    const abrirModalRoles = (usuario) => {
        setUsuarioSeleccionado(usuario);
        setRolSeleccionado(usuario.rol);
        setModalVisible(true);
    };

    const guardarCambioRol = async () => {
        if (!usuarioSeleccionado || !rolSeleccionado) return;
        
        try {
            setCargandoCambio(true);
            const token = await AsyncStorage.getItem('userToken');
            
            await redBoxApi.put(
                `/asignar_rol/${usuarioSeleccionado.id_usuario}/`,
                { rol: rolSeleccionado },
                { headers: { Authorization: `Token ${token}` } }
            );
            
            Alert.alert('Éxito', `Rol actualizado a ${rolSeleccionado}`);
            setModalVisible(false);
            cargarUsuarios(); 
        } catch (error) {
            console.error('Error al asignar rol:', error);
            Alert.alert('Error', error.response?.data?.error || 'No se pudo asignar el rol');
        } finally {
            setCargandoCambio(false);
        }
    };

    const getColorRol = (rol) => {
        switch(rol) {
            case 'Administrador':
                return '#e60000';
            case 'Entrenador':
                return '#34C759';
            default:
                return '#007AFF';
        }
    };

    const getIconoRol = (rol) => {
        switch(rol) {
            case 'Administrador':
                return 'admin-panel-settings';
            case 'Entrenador':
                return 'fitness-center';
            default:
                return 'person';
        }
    };

    if (cargando) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#e60000" />
            </View>
        );
    }

    return (
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
            <ScrollView style={styles.container}>
                <HeaderColor />
                
                <View style={styles.content}>
                    <TituloPrincipal titulo="Gestionar Roles" />
                    <TituloSecundario titulo="Asigna roles a los usuarios del sistema." />

                    <View style={styles.listaContainer}>
                        {usuarios.map((item) => (
                            <View key={item.id_usuario} style={styles.cardUsuario}>
                                <View style={styles.usuarioInfo}>
                                    <View style={[styles.iconoContainer, { backgroundColor: `${getColorRol(item.rol)}20` }]}>
                                        <Icon name={getIconoRol(item.rol)} size={28} color={getColorRol(item.rol)} />
                                    </View>
                                    <View style={styles.textosContainer}>
                                        <Text style={styles.nombreUsuario}>
                                            {item.pnombre_usuario} {item.papellido_usuario}
                                        </Text>
                                        <Text style={styles.emailUsuario}>{item.email_usuario}</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.rolContainer}>
                                    <View style={[styles.badgeRol, { backgroundColor: getColorRol(item.rol) }]}>
                                        <Text style={styles.textoRol}>{item.rol}</Text>
                                    </View>
                                    
                                    <TouchableOpacity 
                                        style={styles.editarRolButton}
                                        onPress={() => abrirModalRoles(item)}
                                    >
                                        <Icon name="edit" size={18} color="#e60000" />
                                        <Text style={styles.editarRolText}>Cambiar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Modal para seleccionar rol */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitulo}>Cambiar Rol</Text>
                        <Text style={styles.modalSubtitulo}>
                            Usuario: {usuarioSeleccionado?.pnombre_usuario} {usuarioSeleccionado?.papellido_usuario}
                        </Text>
                        
                        <View style={styles.opcionesRoles}>
                            {rolesDisponibles.map((rol) => (
                                <TouchableOpacity
                                    key={rol}
                                    style={[
                                        styles.opcionRol,
                                        rolSeleccionado === rol && styles.opcionRolSeleccionada
                                    ]}
                                    onPress={() => setRolSeleccionado(rol)}
                                >
                                    <View style={[styles.circuloRol, { backgroundColor: getColorRol(rol) }]} />
                                    <Text style={[
                                        styles.textoOpcionRol,
                                        rolSeleccionado === rol && styles.textoOpcionRolSeleccionado
                                    ]}>
                                        {rol}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        <View style={styles.modalBotones}>
                            <TouchableOpacity 
                                style={styles.modalBotonCancelar}
                                onPress={() => setModalVisible(false)}
                                disabled={cargandoCambio}
                            >
                                <Text style={styles.modalBotonCancelarText}>Cancelar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.modalBotonGuardar}
                                onPress={guardarCambioRol}
                                disabled={cargandoCambio}
                            >
                                {cargandoCambio ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.modalBotonGuardarText}>Guardar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    listaContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
    cardUsuario: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    usuarioInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconoContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textosContainer: {
        flex: 1,
    },
    nombreUsuario: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    emailUsuario: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    rolContainer: {
        alignItems: 'flex-end',
    },
    badgeRol: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 15,
        marginBottom: 8,
    },
    textoRol: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    editarRolButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    editarRolText: {
        color: '#e60000',
        fontSize: 12,
        fontWeight: '500',
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
        maxWidth: 350,
    },
    modalTitulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalSubtitulo: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    opcionesRoles: {
        marginBottom: 24,
    },
    opcionRol: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 10,
        backgroundColor: '#f8f8f8',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    opcionRolSeleccionada: {
        backgroundColor: '#FFF0F0',
        borderColor: '#e60000',
    },
    circuloRol: {
        width: 18,
        height: 18,
        borderRadius: 9,
        marginRight: 14,
    },
    textoOpcionRol: {
        fontSize: 16,
        color: '#555',
    },
    textoOpcionRolSeleccionado: {
        fontWeight: 'bold',
        color: '#e60000',
    },
    modalBotones: {
        flexDirection: 'row',
        gap: 12,
    },
    modalBotonCancelar: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
    },
    modalBotonCancelarText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
    },
    modalBotonGuardar: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#e60000',
        alignItems: 'center',
    },
    modalBotonGuardarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default GestionarRoles;