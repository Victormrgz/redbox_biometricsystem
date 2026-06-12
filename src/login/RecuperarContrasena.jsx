import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { redBoxApi } from '../api/conexion';
import HeaderColor from '../componentes/HeaderColor';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import BotonRojo from '../componentes/BotonRojo';
import BotonGris from '../componentes/BotonGris';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const RecuperarContrasena = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    
    const [step, setStep] = useState(1); // 1: Email, 2: Código, 3: Nueva contraseña
    const [email, setEmail] = useState('');
    const [codigo, setCodigo] = useState('');
    const [nuevaContrasena, setNuevaContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const [cargando, setCargando] = useState(false);
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

    const solicitarCodigo = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Ingresa tu correo electrónico');
            return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Ingresa un correo electrónico válido');
            return;
        }

        setCargando(true);
        try {
            const response = await redBoxApi.post('/solicitar_recuperacion/', { email });
            Alert.alert('Éxito', 'Se ha enviado un código de verificación a tu correo');
            setStep(2);
        } catch (error) {
            const mensaje = error.response?.data?.error || 'Error al enviar el código';
            Alert.alert('Error', mensaje);
        } finally {
            setCargando(false);
        }
    };

    const verificarCodigo = async () => {
        if (!codigo.trim()) {
            Alert.alert('Error', 'Ingresa el código de verificación');
            return;
        }

        if (codigo.length !== 6) {
            Alert.alert('Error', 'El código debe tener 6 dígitos');
            return;
        }

        setCargando(true);
        try {
            const response = await redBoxApi.post('/verificar_codigo/', { email, codigo });
            Alert.alert('Éxito', 'Código verificado correctamente');
            setStep(3);
        } catch (error) {
            const mensaje = error.response?.data?.error || 'Código inválido o expirado';
            Alert.alert('Error', mensaje);
        } finally {
            setCargando(false);
        }
    };

    const restablecerContrasena = async () => {
        if (!nuevaContrasena.trim()) {
            Alert.alert('Error', 'Ingresa tu nueva contraseña');
            return;
        }

        if (nuevaContrasena.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (nuevaContrasena !== confirmarContrasena) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        setCargando(true);
        try {
            const response = await redBoxApi.post('/restablecer_password/', {
                email,
                codigo,
                nueva_password: nuevaContrasena
            });
            Alert.alert(
                'Éxito', 
                'Contraseña actualizada correctamente. Ya puedes iniciar sesión.',
                [{ text: 'OK', onPress: () => navigation.navigate('IniciarSesion') }]
            );
        } catch (error) {
            const mensaje = error.response?.data?.error || 'Error al restablecer la contraseña';
            Alert.alert('Error', mensaje);
        } finally {
            setCargando(false);
        }
    };

    const reenviarCodigo = async () => {
        setCargando(true);
        try {
            await redBoxApi.post('/solicitar_recuperacion/', { email });
            Alert.alert('Éxito', 'Se ha enviado un nuevo código a tu correo');
        } catch (error) {
            Alert.alert('Error', 'No se pudo reenviar el código');
        } finally {
            setCargando(false);
        }
    };

    const volverALogin = () => {
        navigation.navigate('IniciarSesion');
    };

    return (
        <KeyboardAvoidingView 
            style={[styles.safeArea, { paddingTop: insets.top }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.container}>
                <HeaderColor />
                
                <View style={styles.content}>
                    <TituloPrincipal titulo="Recuperar Contraseña" />
                    <TituloSecundario titulo="Te ayudaremos a restablecer tu contraseña" />

                    {/* Paso 1: Email */}
                    {step === 1 && (
                        <View style={styles.card}>
                            <MaterialIcons name="email" size={48} color="#e60000" style={styles.icono} />
                            <Text style={styles.instruccion}>
                                Ingresa tu correo electrónico y te enviaremos un código de verificación
                            </Text>
                            
                            <View style={styles.inputContainer}>
                                <MaterialIcons name="email" size={20} color="#999" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="correo@ejemplo.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <BotonRojo 
                                titulo="Enviar Código"
                                onPress={solicitarCodigo}
                                loading={cargando}
                                style={styles.boton}
                            />
                            
                            <TouchableOpacity onPress={volverALogin} style={styles.linkContainer}>
                                <Text style={styles.linkText}>Volver a Iniciar Sesión</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Paso 2: Código de verificación */}
                    {step === 2 && (
                        <View style={styles.card}>
                            <MaterialIcons name="verified" size={48} color="#e60000" style={styles.icono} />
                            <Text style={styles.instruccion}>
                                Ingresa el código de 6 dígitos que enviamos a tu correo
                            </Text>
                            
                            <View style={styles.codigoContainer}>
                                <TextInput
                                    style={styles.codigoInput}
                                    placeholder="000000"
                                    value={codigo}
                                    onChangeText={setCodigo}
                                    keyboardType="numeric"
                                    maxLength={6}
                                    textAlign="center"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <BotonRojo 
                                titulo="Verificar Código"
                                onPress={verificarCodigo}
                                loading={cargando}
                                style={styles.boton}
                            />
                            
                            <TouchableOpacity onPress={reenviarCodigo} style={styles.linkContainer}>
                                <Text style={styles.linkText}>Reenviar código</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity onPress={() => setStep(1)} style={styles.linkContainer}>
                                <Text style={styles.linkText}>Cambiar correo electrónico</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Paso 3: Nueva contraseña */}
                    {step === 3 && (
                        <View style={styles.card}>
                            <MaterialIcons name="lock" size={48} color="#e60000" style={styles.icono} />
                            <Text style={styles.instruccion}>
                                Ingresa tu nueva contraseña
                            </Text>
                            
                            <View style={styles.inputContainer}>
                                <MaterialIcons name="lock" size={20} color="#999" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nueva contraseña"
                                    value={nuevaContrasena}
                                    onChangeText={setNuevaContrasena}
                                    secureTextEntry={!mostrarContrasena}
                                    placeholderTextColor="#999"
                                />
                                <TouchableOpacity onPress={() => setMostrarContrasena(!mostrarContrasena)}>
                                    <MaterialIcons 
                                        name={mostrarContrasena ? "visibility" : "visibility-off"} 
                                        size={20} 
                                        color="#999" 
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputContainer}>
                                <MaterialIcons name="lock" size={20} color="#999" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirmar contraseña"
                                    value={confirmarContrasena}
                                    onChangeText={setConfirmarContrasena}
                                    secureTextEntry={!mostrarConfirmar}
                                    placeholderTextColor="#999"
                                />
                                <TouchableOpacity onPress={() => setMostrarConfirmar(!mostrarConfirmar)}>
                                    <MaterialIcons 
                                        name={mostrarConfirmar ? "visibility" : "visibility-off"} 
                                        size={20} 
                                        color="#999" 
                                    />
                                </TouchableOpacity>
                            </View>

                            <BotonRojo 
                                titulo="Restablecer Contraseña"
                                onPress={restablecerContrasena}
                                loading={cargando}
                                style={styles.boton}
                            />
                            
                            <TouchableOpacity onPress={volverALogin} style={styles.linkContainer}>
                                <Text style={styles.linkText}>Volver a Iniciar Sesión</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
            <StatusBar style="auto" />
        </KeyboardAvoidingView>
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
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    icono: {
        alignSelf: 'center',
        marginBottom: 16,
    },
    instruccion: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 16,
        backgroundColor: '#fff',
        gap: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: '#333',
    },
    codigoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    codigoInput: {
        width: '80%',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 14,
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 8,
        textAlign: 'center',
        backgroundColor: '#fff',
        color: '#333',
    },
    boton: {
        marginTop: 8,
        marginBottom: 16,
    },
    linkContainer: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    linkText: {
        color: '#e60000',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default RecuperarContrasena;