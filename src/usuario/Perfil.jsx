import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import BotonRojo from '../componentes/BotonRojo';
import BotonGris from '../componentes/BotonGris';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import HeaderColor from '../componentes/HeaderColor';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { editarMiPerfil, getUsuarioById } from '../api/conexion';
import { AuthContext } from '../auth/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

const EditarPerfil = ({ navigation, route }) => {
    const setIsAuthenticated = route.params?.setIsAuthenticated;
    const { actualizarUsuario } = useContext(AuthContext);
    
    const phoneInputRef = useRef(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const insets = useSafeAreaInsets();
    
    const [formData, setFormData] = useState({
        pnombre_usuario: '',
        snombre_usuario: '',
        papellido_usuario: '',
        sapellido_usuario: '',
        telefono_usuario: '',
        codigoTelefono: '0412',
        fecha_nacimiento_usuario: '',
        genero_usuario: '',
        cedula_usuario: '',
        peso: '',
        altura: '',
        nueva_contrasena: '',
        confirmar_contrasena: ''
    });

    const [datosOriginales, setDatosOriginales] = useState({});

    // Función para separar el teléfono completo en código + número
    const separarTelefono = (telefonoCompleto) => {
        if (!telefonoCompleto) return { codigo: '0412', numero: '' };
        
        const codigos = ['0412', '0414', '0416', '0424', '0426'];
        for (let codigo of codigos) {
            if (telefonoCompleto.startsWith(codigo)) {
                return {
                    codigo: codigo,
                    numero: telefonoCompleto.substring(codigo.length)
                };
            }
        }
        return { codigo: '0412', numero: telefonoCompleto };
    };

    // Función para formatear fecha a YYYY-MM-DD
    const formatFecha = (date) => {
        if (!date || !(date instanceof Date)) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Función para convertir string a Date
    const stringToDate = (fechaString) => {
        if (!fechaString) return null;
        const [year, month, day] = fechaString.split('-');
        return new Date(year, month - 1, day);
    };

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
            
            // Separar el teléfono en código y número
            const { codigo, numero } = separarTelefono(usuarioData.telefono_usuario || '');
            
            setFormData({
                pnombre_usuario: usuarioData.pnombre_usuario || '',
                snombre_usuario: usuarioData.snombre_usuario || '',
                papellido_usuario: usuarioData.papellido_usuario || '',
                sapellido_usuario: usuarioData.sapellido_usuario || '',
                telefono_usuario: numero,
                codigoTelefono: codigo,
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
                telefono_usuario: numero,
                codigoTelefono: codigo,
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

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const fechaFormateada = formatFecha(selectedDate);
            handleInputChange('fecha_nacimiento_usuario', fechaFormateada);
        }
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
                if (formData.fecha_nacimiento_usuario) datosEnviar.fecha_nacimiento_usuario = formData.fecha_nacimiento_usuario;
                if (formData.genero_usuario) datosEnviar.genero_usuario = formData.genero_usuario;
                if (formData.cedula_usuario) datosEnviar.cedula_usuario = formData.cedula_usuario;
                
                // Combinar código + número de teléfono
                if (formData.telefono_usuario && formData.telefono_usuario.length === 7) {
                    const telefonoCompleto = formData.codigoTelefono + formData.telefono_usuario;
                    datosEnviar.telefono_usuario = telefonoCompleto;
                } else if (formData.telefono_usuario) {
                    Alert.alert('Error', 'El teléfono debe tener 7 dígitos');
                    setGuardando(false);
                    return;
                }
                
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
            await actualizarUsuario();
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

    const handleCerrarSesion = async () => { 
        if (!setIsAuthenticated) {
            console.error("ERROR: setIsAuthenticated es undefined en EditarPerfil");
            await AsyncStorage.clear();
            return;
        }

        try {
            await AsyncStorage.clear(); 
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
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
            <ScrollView 
                style={styles.container}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
            >
                <HeaderColor />
                <View style={styles.header}>
                    <TituloPrincipal titulo="Editar Perfil"/>
                    <TituloSecundario titulo="Actualiza tu información personal para mejorar tu experiencia."/>
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

                    {/* Teléfono con Picker y Input separados */}
                    <View style={styles.campoContainer}>
                        <Text style={styles.label}>Teléfono</Text>
                        <View style={styles.filaTelefono}>
                            <View style={[styles.contenedorPicker, !modoEdicion && styles.contenedorPickerBloqueado]}>
                                <Text style={styles.textoCodigo}>{formData.codigoTelefono}</Text>
                                <Picker
                                    mode="dropdown"
                                    selectedValue={formData.codigoTelefono}
                                    onValueChange={(itemValue) => {
                                        handleInputChange('codigoTelefono', itemValue);
                                        phoneInputRef.current?.focus();
                                    }}
                                    style={styles.picker}
                                    enabled={modoEdicion}
                                >
                                    <Picker.Item label="0412" value="0412" />
                                    <Picker.Item label="0414" value="0414" />
                                    <Picker.Item label="0416" value="0416" />
                                    <Picker.Item label="0424" value="0424" />
                                    <Picker.Item label="0426" value="0426" />
                                </Picker>
                            </View>

                            <TextInput
                                ref={phoneInputRef}
                                style={[styles.inputTelefono, !modoEdicion && styles.inputBloqueado]}
                                placeholder="1234567"
                                keyboardType="numeric"
                                maxLength={7}
                                value={formData.telefono_usuario}
                                onChangeText={(text) => {
                                    const cleaned = text.replace(/[^0-9]/g, '');
                                    handleInputChange('telefono_usuario', cleaned);
                                }}
                                editable={modoEdicion}
                            />
                        </View>
                    </View>

                    {/* Fecha de nacimiento con DateTimePicker */}
                    <View style={styles.campoContainer}>
                        <Text style={styles.label}>Fecha de nacimiento</Text>
                        <TouchableOpacity
                            style={[styles.input, !modoEdicion && styles.inputBloqueado]}
                            onPress={() => modoEdicion && setShowDatePicker(true)}
                            disabled={!modoEdicion}
                        >
                            <Text style={{ color: formData.fecha_nacimiento_usuario ? '#000' : '#999', fontSize: 16 }}>
                                {formData.fecha_nacimiento_usuario || 'Seleccionar fecha'}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && modoEdicion && (
                            <DateTimePicker
                                value={stringToDate(formData.fecha_nacimiento_usuario) || new Date()}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}
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
                            <BotonRojo titulo="Editar Perfil" onPress={habilitarEdicion} style={styles.botonGrid} />
                        ) : (
                            <>
                                <BotonGris titulo="Cancelar" onPress={cancelarEdicion} style={styles.botonGrid} disabled={guardando} />
                                <BotonRojo titulo="Guardar Cambios" onPress={handleGuardar} style={styles.botonGrid} disabled={guardando} />
                            </>
                        )}
                    </View>

                    {/* Botón de Cerrar Sesión */}
                    <BotonGris titulo="Cerrar Sesión" onPress={handleCerrarSesion} style={styles.botonGrid} />
                </View>
            </ScrollView>
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
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
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
        paddingVertical: 12,
        fontSize: 16,
        color: '#000',
    },
    inputBloqueado: {
        backgroundColor: '#f9f9f9',
        color: '#666',
        borderColor: '#eee',
    },
    // Estilos para el teléfono
    filaTelefono: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contenedorPicker: {
        width: '35%',
        height: 50,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    contenedorPickerBloqueado: {
        backgroundColor: '#f9f9f9',
        borderColor: '#eee',
    },
    textoCodigo: {
        fontSize: 16,
        color: '#000',
    },
    picker: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0,
        backgroundColor: 'transparent',
    },
    inputTelefono: {
        width: '62%',
        height: 50,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#000',
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
        paddingVertical: 12,
        alignItems: 'center',
    },
    generoBotonActivo: {
        backgroundColor: '#e60000',
        borderColor: '#e60000',
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
    botonGrid: {
        flex: 1,
    },
});

export default EditarPerfil;