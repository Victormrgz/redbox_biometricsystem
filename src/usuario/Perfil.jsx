import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { editarMiPerfil, getUsuarioById } from '../api/conexion';

const EditarPerfil = ({ navigation, route }) => {
    // Obtener setIsAuthenticated de los parámetros (como en tu Perfil original)
    const setIsAuthenticated = route.params?.setIsAuthenticated;
    
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    
    const [formData, setFormData] = useState({
        pnombre_usuario: '',
        snombre_usuario: '',
        papellido_usuario: '',
        sapellido_usuario: '',
        telefono_usuario: '',
        fecha_nacimiento_usuario: '',
        genero_usuario: '',
        cedula_usuario: '',
        peso: '',
        altura: '',
        nueva_contrasena: '',
        confirmar_contrasena: ''
    });

    const [datosOriginales, setDatosOriginales] = useState({});

    useEffect(() => {
        cargarUsuarioLogueado();
    }, []);

    const cargarUsuarioLogueado = async () => {
        try {
            setCargando(true);
            const userId = await AsyncStorage.getItem('userId');
            
            if (!userId) {
                Alert.alert('Error', 'No se encontró usuario logueado');
                navigation.goBack();
                return;
            }
            
            const usuarioData = await getUsuarioById(JSON.parse(userId));
            
            setFormData({
                pnombre_usuario: usuarioData.pnombre_usuario || '',
                snombre_usuario: usuarioData.snombre_usuario || '',
                papellido_usuario: usuarioData.papellido_usuario || '',
                sapellido_usuario: usuarioData.sapellido_usuario || '',
                telefono_usuario: usuarioData.telefono_usuario || '',
                fecha_nacimiento_usuario: usuarioData.fecha_nacimiento_usuario || '',
                genero_usuario: usuarioData.genero_usuario || '',
                cedula_usuario: usuarioData.cedula_usuario || '',
                peso: usuarioData.peso ? usuarioData.peso.toString() : '',
                altura: usuarioData.altura ? usuarioData.altura.toString() : '',
                nueva_contrasena: '',
                confirmar_contrasena: ''
            });
            
            setDatosOriginales({
                pnombre_usuario: usuarioData.pnombre_usuario || '',
                snombre_usuario: usuarioData.snombre_usuario || '',
                papellido_usuario: usuarioData.papellido_usuario || '',
                sapellido_usuario: usuarioData.sapellido_usuario || '',
                telefono_usuario: usuarioData.telefono_usuario || '',
                fecha_nacimiento_usuario: usuarioData.fecha_nacimiento_usuario || '',
                genero_usuario: usuarioData.genero_usuario || '',
                cedula_usuario: usuarioData.cedula_usuario || '',
                peso: usuarioData.peso ? usuarioData.peso.toString() : '',
                altura: usuarioData.altura ? usuarioData.altura.toString() : '',
            });
        } catch (error) {
            console.error('Error al cargar usuario:', error);
            Alert.alert('Error', 'No se pudo cargar los datos del usuario');
        } finally {
            setCargando(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const habilitarEdicion = () => {
        setModoEdicion(true);
        setDatosOriginales({ ...formData });
    };

    const cancelarEdicion = () => {
        setFormData({
            ...datosOriginales,
            nueva_contrasena: '',
            confirmar_contrasena: ''
        });
        setModoEdicion(false);
    };

    const handleGuardar = async () => {
        try {
            setGuardando(true);
            const token = await AsyncStorage.getItem('userToken');
            
            const datosEnviar = {};
            
            if (modoEdicion) {
                if (formData.pnombre_usuario) datosEnviar.pnombre_usuario = formData.pnombre_usuario;
                if (formData.snombre_usuario) datosEnviar.snombre_usuario = formData.snombre_usuario;
                if (formData.papellido_usuario) datosEnviar.papellido_usuario = formData.papellido_usuario;
                if (formData.sapellido_usuario) datosEnviar.sapellido_usuario = formData.sapellido_usuario;
                if (formData.telefono_usuario) datosEnviar.telefono_usuario = formData.telefono_usuario;
                if (formData.fecha_nacimiento_usuario) datosEnviar.fecha_nacimiento_usuario = formData.fecha_nacimiento_usuario;
                if (formData.genero_usuario) datosEnviar.genero_usuario = formData.genero_usuario;
                if (formData.cedula_usuario) datosEnviar.cedula_usuario = formData.cedula_usuario;
                
                if (formData.nueva_contrasena) {
                    if (formData.nueva_contrasena !== formData.confirmar_contrasena) {
                        Alert.alert('Error', 'Las contraseñas no coinciden');
                        setGuardando(false);
                        return;
                    }
                    if (formData.nueva_contrasena.length < 6) {
                        Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
                        setGuardando(false);
                        return;
                    }
                    datosEnviar.nueva_contrasena = formData.nueva_contrasena;
                }
            }
            
            if (formData.peso && formData.peso !== '') {
                datosEnviar.peso = parseFloat(formData.peso);
            }
            if (formData.altura && formData.altura !== '') {
                datosEnviar.altura = parseFloat(formData.altura);
            }
            
            await editarMiPerfil(datosEnviar, token);
            await cargarUsuarioLogueado();
            setModoEdicion(false);
            
            Alert.alert('Éxito', 'Tu perfil ha sido actualizado correctamente');
        } catch (error) {
            console.error('Error al guardar:', error);
            Alert.alert('Error', error.response?.data?.error || 'No se pudo actualizar el perfil');
        } finally {
            setGuardando(false);
        }
    };

    // Función de cerrar sesión - IGUAL que la que tienes en Perfil
    const handleCerrarSesion = async () => { 
        if (!setIsAuthenticated) {
            console.error("ERROR: setIsAuthenticated es undefined en EditarPerfil");
            await AsyncStorage.clear();
            console.log("Storage limpiado, pero debes reiniciar la app manualmente.");
            return;
        }

        try {
            await AsyncStorage.clear(); 
            console.log("Sesión cerrada correctamente");
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
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
        <ScrollView 
            style={styles.container}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.header}>
                <Text style={styles.title}>Editar perfil</Text>
                <Text style={styles.subtitle}>
                    Actualiza tu información personal para mejorar tu experiencia.
                </Text>
            </View>

            <View style={styles.formContainer}>
                {/* Primer nombre y Segundo nombre */}
                <View style={styles.rowContainer}>
                    <View style={[styles.halfField, styles.marginRight]}>
                        <Text style={styles.label}>Primer nombre</Text>
                        <TextInput
                            style={[styles.input, !modoEdicion && styles.inputBloqueado]}
                            value={formData.pnombre_usuario}
                            onChangeText={(text) => handleInputChange('pnombre_usuario', text)}
                            placeholder="Primer nombre"
                            editable={modoEdicion}
                        />
                    </View>
                    <View style={styles.halfField}>
                        <Text style={styles.label}>Segundo nombre</Text>
                        <TextInput
                            style={[styles.input, !modoEdicion && styles.inputBloqueado]}
                            value={formData.snombre_usuario}
                            onChangeText={(text) => handleInputChange('snombre_usuario', text)}
                            placeholder="Segundo nombre"
                            editable={modoEdicion}
                        />
                    </View>
                </View>

                {/* Primer apellido y Segundo apellido */}
                <View style={styles.rowContainer}>
                    <View style={[styles.halfField, styles.marginRight]}>
                        <Text style={styles.label}>Primer apellido</Text>
                        <TextInput
                            style={[styles.input, !modoEdicion && styles.inputBloqueado]}
                            value={formData.papellido_usuario}
                            onChangeText={(text) => handleInputChange('papellido_usuario', text)}
                            placeholder="Primer apellido"
                            editable={modoEdicion}
                        />
                    </View>
                    <View style={styles.halfField}>
                        <Text style={styles.label}>Segundo apellido</Text>
                        <TextInput
                            style={[styles.input, !modoEdicion && styles.inputBloqueado]}
                            value={formData.sapellido_usuario}
                            onChangeText={(text) => handleInputChange('sapellido_usuario', text)}
                            placeholder="Segundo apellido"
                            editable={modoEdicion}
                        />
                    </View>
                </View>

                {/* Teléfono */}
                <View style={styles.campoContainer}>
                    <Text style={styles.label}>Teléfono</Text>
                    <TextInput
                        style={[styles.input, !modoEdicion && styles.inputBloqueado]}
                        value={formData.telefono_usuario}
                        onChangeText={(text) => handleInputChange('telefono_usuario', text)}
                        placeholder="04121208635"
                        keyboardType="phone-pad"
                        editable={modoEdicion}
                    />
                </View>

                {/* Fecha de nacimiento */}
                <View style={styles.campoContainer}>
                    <Text style={styles.label}>Fecha de nacimiento</Text>
                    <TextInput
                        style={[styles.input, !modoEdicion && styles.inputBloqueado]}
                        value={formData.fecha_nacimiento_usuario}
                        onChangeText={(text) => handleInputChange('fecha_nacimiento_usuario', text)}
                        placeholder="06/03/2004"
                        editable={modoEdicion}
                    />
                </View>

                {/* Género */}
                <View style={styles.campoContainer}>
                    <Text style={styles.label}>Género</Text>
                    <View style={styles.generoContainer}>
                        <TouchableOpacity
                            style={[
                                styles.generoBoton,
                                formData.genero_usuario === 'M' && styles.generoBotonActivo,
                                !modoEdicion && styles.generoBotonBloqueado
                            ]}
                            onPress={() => modoEdicion && handleInputChange('genero_usuario', 'M')}
                            disabled={!modoEdicion}
                        >
                            <Text style={[
                                styles.generoTexto,
                                formData.genero_usuario === 'M' && styles.generoTextoActivo
                            ]}>Masculino</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.generoBoton,
                                formData.genero_usuario === 'F' && styles.generoBotonActivo,
                                !modoEdicion && styles.generoBotonBloqueado
                            ]}
                            onPress={() => modoEdicion && handleInputChange('genero_usuario', 'F')}
                            disabled={!modoEdicion}
                        >
                            <Text style={[
                                styles.generoTexto,
                                formData.genero_usuario === 'F' && styles.generoTextoActivo
                            ]}>Femenino</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.generoBoton,
                                formData.genero_usuario === 'Otro' && styles.generoBotonActivo,
                                !modoEdicion && styles.generoBotonBloqueado
                            ]}
                            onPress={() => modoEdicion && handleInputChange('genero_usuario', 'Otro')}
                            disabled={!modoEdicion}
                        >
                            <Text style={[
                                styles.generoTexto,
                                formData.genero_usuario === 'Otro' && styles.generoTextoActivo
                            ]}>Otro</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Cédula */}
                <View style={styles.campoContainer}>
                    <Text style={styles.label}>Cédula</Text>
                    <TextInput
                        style={[styles.input, !modoEdicion && styles.inputBloqueado]}
                        value={formData.cedula_usuario}
                        onChangeText={(text) => handleInputChange('cedula_usuario', text)}
                        placeholder="30890595"
                        keyboardType="numeric"
                        editable={modoEdicion}
                    />
                </View>

                {/* Peso y Altura */}
                <View style={styles.rowContainer}>
                    <View style={[styles.halfField, styles.marginRight]}>
                        <Text style={styles.label}>Peso (kg)</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.peso}
                            onChangeText={(text) => handleInputChange('peso', text)}
                            placeholder="70.0"
                            keyboardType="numeric"
                            editable={true}
                        />
                    </View>
                    <View style={styles.halfField}>
                        <Text style={styles.label}>Altura (cm)</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.altura}
                            onChangeText={(text) => handleInputChange('altura', text)}
                            placeholder="186.0"
                            keyboardType="numeric"
                            editable={true}
                        />
                    </View>
                </View>

                {/* Cambiar contraseña - Solo en modo edición */}
                {modoEdicion && (
                    <>
                        <View style={styles.separator} />
                        <Text style={styles.separatorTitle}>Cambiar contraseña</Text>
                        
                        <View style={styles.campoContainer}>
                            <Text style={styles.label}>Nueva contraseña</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.nueva_contrasena}
                                onChangeText={(text) => handleInputChange('nueva_contrasena', text)}
                                placeholder="********"
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.campoContainer}>
                            <Text style={styles.label}>Confirmar nueva contraseña</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.confirmar_contrasena}
                                onChangeText={(text) => handleInputChange('confirmar_contrasena', text)}
                                placeholder="********"
                                secureTextEntry
                            />
                        </View>
                    </>
                )}

                {/* Botones de acción */}
                <View style={styles.buttonContainer}>
                    {!modoEdicion ? (
                        <TouchableOpacity 
                            style={styles.editarButton} 
                            onPress={habilitarEdicion}
                        >
                            <Text style={styles.buttonText}>Editar perfil</Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <TouchableOpacity 
                                style={styles.cancelarButton} 
                                onPress={cancelarEdicion}
                                disabled={guardando}
                            >
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.guardarButton} 
                                onPress={handleGuardar}
                                disabled={guardando}
                            >
                                {guardando ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Guardar cambios</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Botón de Cerrar Sesión - Mismo estilo que tu BotonRojo */}
                <TouchableOpacity 
                    style={styles.cerrarSesionButton} 
                    onPress={handleCerrarSesion}
                >
                    <Text style={styles.cerrarSesionButtonText}>CERRAR SESIÓN</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
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
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    formContainer: {
        padding: 20,
    },
    rowContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    halfField: {
        flex: 1,
    },
    marginRight: {
        marginRight: 10,
    },
    campoContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#000',
    },
    inputBloqueado: {
        backgroundColor: '#f9f9f9',
        color: '#666',
        borderColor: '#eee',
    },
    generoContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    generoBoton: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    generoBotonActivo: {
        backgroundColor: '#FF3B30',
        borderColor: '#FF3B30',
    },
    generoBotonBloqueado: {
        backgroundColor: '#f9f9f9',
    },
    generoTexto: {
        fontSize: 14,
        color: '#333',
    },
    generoTextoActivo: {
        color: '#fff',
        fontWeight: '600',
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 20,
    },
    separatorTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 30,
        marginBottom: 20,
    },
    editarButton: {
        flex: 1,
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    guardarButton: {
        flex: 1,
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelarButton: {
        flex: 1,
        backgroundColor: '#666',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Botón de cerrar sesión - Mismo estilo que tu BotonRojo
    cerrarSesionButton: {
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40,
    },
    cerrarSesionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditarPerfil;