import React from 'react';
import { useState, useContext, useCallback, useRef, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Platform, 
    Alert, 
    ActivityIndicator 
} from 'react-native';
import HeaderColor from '../componentes/HeaderColor';
import TituloPrincipal from '../componentes/TituloPrincipal';
import BotonRojo from '../componentes/BotonRojo';
import BotonGris from '../componentes/BotonGris';
import { useNavigation } from '@react-navigation/native';
import { loginUsuario } from '../api/conexion';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../auth/AuthContext';

const IniciarSesion = ({ route }) => {
    const { setIsAuthenticated } = route.params;
    const { actualizarUsuario } = useContext(AuthContext);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    // ✅ Estados
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [cargando, setCargando] = useState(false);
    const [verContrasena, setVerContrasena] = useState(true);
    const [errorCorreo, setErrorCorreo] = useState('');
    const [errorContrasena, setErrorContrasena] = useState('');

    // ✅ Refs para inputs
    const correoRef = useRef(null);
    const contrasenaRef = useRef(null);

    // ✅ Validación en tiempo real (con useCallback)
    const validarCorreo = useCallback((text) => {
        setCorreo(text);
        if (text && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
            setErrorCorreo('Correo electrónico inválido');
        } else {
            setErrorCorreo('');
        }
    }, []);

    const validarContrasena = useCallback((text) => {
        setContrasena(text);
        if (text && text.length < 6) {
            setErrorContrasena('La contraseña debe tener al menos 6 caracteres');
        } else {
            setErrorContrasena('');
        }
    }, []);

    // ✅ Función de login optimizada
    const handleLogin = async () => {
        // ✅ Validación rápida
        const emailLimpio = correo.trim().toLowerCase();
        const passLimpia = contrasena.trim();

        if (!emailLimpio) {
            Alert.alert('Error', 'Ingresa tu correo electrónico');
            correoRef.current?.focus();
            return;
        }
        if (!passLimpia) {
            Alert.alert('Error', 'Ingresa tu contraseña');
            contrasenaRef.current?.focus();
            return;
        }
        if (errorCorreo || errorContrasena) {
            Alert.alert('Error', 'Corrige los campos marcados');
            return;
        }

        // ✅ Activar loading
        setCargando(true);

        try {
            const credenciales = {
                email_usuario: emailLimpio,
                contrasena_usuario: passLimpia
            };

            console.log("📤 Enviando a Django:", { email: emailLimpio, password: '***' });

            const respuesta = await loginUsuario(credenciales);
            
            if (respuesta.token) {
                // ✅ Guardar en paralelo (más rápido)
                await Promise.all([
                    AsyncStorage.setItem('userToken', respuesta.token),
                    AsyncStorage.setItem('userId', JSON.stringify(respuesta.user?.id_usuario || respuesta.user_id))
                ]);

                // ✅ Actualizar contexto
                if (actualizarUsuario) {
                    await actualizarUsuario(respuesta.user || { 
                        id_usuario: respuesta.user_id,
                        email: emailLimpio 
                    });
                }

                // ✅ Navegar (el setIsAuthenticated activa el cambio de pantalla)
                setIsAuthenticated(true);
            }

        } catch (error) {
            console.log("❌ Error en login:", error);
            
            let mensaje = 'Credenciales incorrectas';
            if (error.response?.data?.error) {
                mensaje = error.response.data.error;
            } else if (error.response?.data?.detail) {
                mensaje = error.response.data.detail;
            }
            
            Alert.alert('Error', mensaje);
        } finally {
            setCargando(false);
        }
    };

    // ✅ Navegaciones (memoizadas)
    const handleRegistro = useCallback(() => {
        navigation.navigate('CrearCuenta');
    }, [navigation]);

    const handleOlvide = useCallback(() => {
        navigation.navigate('RecuperarContrasena');
    }, [navigation]);

    const mostrarContrasena = useCallback(() => {
        setVerContrasena(prev => !prev);
    }, []);

    // ✅ Cargar último email guardado (opcional)
    useEffect(() => {
        const cargarEmail = async () => {
            try {
                const savedEmail = await AsyncStorage.getItem('lastEmail');
                if (savedEmail) setCorreo(savedEmail);
            } catch (error) {
                // Ignorar error
            }
        };
        cargarEmail();
    }, []);

    // ✅ Guardar email al hacer login exitoso
    const guardarEmail = useCallback(async (email) => {
        try {
            await AsyncStorage.setItem('lastEmail', email);
        } catch (error) {
            // Ignorar error
        }
    }, []);

    

    // ✅ Modificar handleLogin para guardar email
    const handleLoginConGuardado = useCallback(async () => {
        const emailLimpio = correo.trim().toLowerCase();
        // ... validaciones ...
        
        try {
            // ... login ...
            if (respuesta.token) {
                await guardarEmail(emailLimpio);
                // ... resto ...
            }
        } catch (error) {
            // ... manejo de error ...
        }
    }, [correo, contrasena, guardarEmail]);

    // ✅ Si está cargando, mostrar pantalla de loading
    if (cargando) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF3B30" />
                <Text style={styles.loadingText}>Iniciando sesión...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
            <ScrollView 
                contentContainerStyle={{ flexGrow: 1 }} 
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <HeaderColor />
                <View style={styles.container}>
                    <Text style={styles.titulo}>¡Bienvenido a REDBOX!</Text>
                    <Text style={styles.subtitulo}>Por favor, inicia sesión para continuar.</Text>

                    {/* Correo */}
                    <Text style={styles.label}>Correo electrónico</Text>
                    <View style={[styles.contenedorInput, errorCorreo ? styles.inputError : null]}>
                        <TextInput
                            ref={correoRef}
                            style={styles.input}
                            placeholder="ejemplo@correo.com"
                            value={correo}
                            onChangeText={validarCorreo}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            placeholderTextColor="#999"
                            returnKeyType="next"
                            onSubmitEditing={() => contrasenaRef.current?.focus()}
                        />
                    </View>
                    {errorCorreo ? <Text style={styles.errorText}>{errorCorreo}</Text> : null}

                    {/* Contraseña */}
                    <Text style={styles.label}>Contraseña</Text>
                    <View style={[styles.contenedorInput, errorContrasena ? styles.inputError : null]}>
                        <TextInput
                            ref={contrasenaRef}
                            style={styles.input}
                            placeholder="********"
                            value={contrasena}
                            onChangeText={validarContrasena}
                            secureTextEntry={verContrasena}
                            placeholderTextColor="#999"
                            returnKeyType="go"
                            onSubmitEditing={handleLogin}
                        />
                        <TouchableOpacity 
                            onPress={mostrarContrasena}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={styles.iconoContainer}
                        >
                            <AntDesign 
                                name={verContrasena ? "eye-invisible" : "eye"} 
                                size={22} 
                                color="#666" 
                            />
                        </TouchableOpacity>
                    </View>
                    {errorContrasena ? <Text style={styles.errorText}>{errorContrasena}</Text> : null}

                    <TouchableOpacity onPress={handleOlvide}>
                        <Text style={styles.link}>Olvidé mi contraseña</Text>
                    </TouchableOpacity>

                    <BotonRojo 
                        titulo="INICIAR SESIÓN" 
                        onPress={handleLogin} 
                        loading={cargando} 
                        disabled={cargando} 
                        style={{ marginTop: 16 }} 
                    />

                    <View style={styles.separadorRow}>
                        <View style={styles.linea} />
                        <Text style={styles.separadorText}>o</Text>
                        <View style={styles.linea} />
                    </View>

                    <BotonGris 
                        titulo="REGÍSTRATE" 
                        onPress={handleRegistro} 
                        style={{ marginTop: 8 }} 
                    />

                    <View style={styles.linksRow}>
                        <TouchableOpacity>
                            <Text style={styles.footerLink}>Condiciones de servicio</Text>
                        </TouchableOpacity>
                        <Text style={{ color: '#888' }}> | </Text>
                        <TouchableOpacity>
                            <Text style={styles.footerLink}>Política de privacidad</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        maxWidth: 420,
        alignSelf: 'center',
        paddingHorizontal: 20,
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    titulo: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#000',
    },
    subtitulo: {
        textAlign: 'center',
        marginBottom: 30,
        color: '#666',
        fontSize: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
        color: '#333',
    },
    contenedorInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingHorizontal: 14,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: '#eee',
    },
    inputError: {
        borderColor: '#FF3B30',
        borderWidth: 1,
    },
    input: {
        flex: 1,
        paddingVertical: Platform.OS === 'ios' ? 16 : 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: 'transparent',
    },
    iconoContainer: {
        padding: 8,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginBottom: 12,
        marginLeft: 4,
    },
    link: {
        color: '#b71c1c',
        fontWeight: '600',
        alignSelf: 'center',
        fontSize: 14,
        marginVertical: 10,
    },
    separadorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 25,
    },
    linea: {
        flex: 1,
        height: 1,
        backgroundColor: '#eee',
    },
    separadorText: {
        marginHorizontal: 15,
        color: '#bbb',
        fontWeight: '600',
    },
    linksRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
        gap: 5,
    },
    footerLink: {
        color: '#888',
        textDecorationLine: 'underline',
        fontSize: 12,
    },
});

export default IniciarSesion;