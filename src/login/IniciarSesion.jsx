
import React, { useState,useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform, Alert } from 'react-native';
import HeaderColor from '../componentes/HeaderColor';
import TituloPrincipal from '../componentes/TituloPrincipal';
import BotonRojo from '../componentes/BotonRojo';
import BotonGris from '../componentes/BotonGris';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { loginUsuario } from '../api/conexion';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../auth/AuthContext';

const IniciarSesion = ({route}) => {
    const { setIsAuthenticated } = route.params;
    const { actualizarUsuario } = useContext(AuthContext);
    const insets = useSafeAreaInsets();
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigation = useNavigation();

    const handleLogin = async () => {
    // 1. Validación preventiva
    if (!correo.trim() || !contrasena.trim()) {
        Alert.alert('Error', 'Por favor ingresa correo y contraseña');
        return;
    }

    setCargando(true); // Activar loader
    
    try {
        // Limpiamos los espacios en blanco
        const emailLimpio = correo.trim().toLowerCase();
        
        const credenciales = {
            email_usuario: emailLimpio,
            contrasena_usuario: contrasena // No le hagas trim a la contraseña, podría tener espacios válidos
        };

        console.log("Enviando a Django:", credenciales);

        const respuesta = await loginUsuario(credenciales);
        
        // ... resto de tu lógica de guardado ...
        if (respuesta.token) {
            await AsyncStorage.setItem('userToken', respuesta.token);
            await AsyncStorage.setItem('userId', JSON.stringify(respuesta.user.id_usuario));
            await actualizarUsuario(respuesta.user); 
            setIsAuthenticated(true);
        }

    } catch (error) {
        // LOG CLAVE: Aquí veremos qué dice exactamente Django del error 400
        if (error.response) {
            console.log("Respuesta de error de Django:", error.response.data);
            // Esto te dirá si el error es "Email no encontrado" o "Password incorrecto"
        }
        Alert.alert('Error', 'Credenciales incorrectas.');
    } finally {
        setCargando(false);
    }
};


    const handleRegistro = () => {
        navigation.navigate('CrearCuenta');
    };

    // Ver y ocultar la contraseña

    const [verContrasena ,setVerContrasena] = useState(true);

    const mostrarContrasena = () => {
        setVerContrasena(!verContrasena);
    };

    const handleOlvide = () => {
        // Aquí va la lógica para recuperar contraseña
    };

    return (
        <View style={[
            styles.mainContainer, 
            { paddingTop: insets.top, paddingBottom: insets.bottom }
        ]}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <HeaderColor />
                <View style={styles.container}>
                    <Text style={styles.titulo}>¡Bienvenido a REDBOX!</Text>
                    <Text style={styles.subtitulo}>Por favor, inicia sesión para continuar.</Text>

                    <Text style={styles.label}>Correo electrónico</Text>
                    <View style = {styles.contenedorInput}>
                        <TextInput
                        style={styles.input}
                        placeholder="ejemplo@correo.com"
                        value={correo}
                        onChangeText={setCorreo}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        />
                    </View>
                    
                    
                    <Text style={styles.label}>Contraseña</Text>
                    <View style = {styles.contenedorInput}>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="********"
                            value={contrasena}
                            onChangeText={setContrasena}
                            secureTextEntry={verContrasena}
                            
                        />

                        <TouchableOpacity onPress={mostrarContrasena}>
                            <AntDesign name="eye-invisible" size={24} color="black" style ={styles.icono} />
                        </TouchableOpacity>
                        
                    </View>
                    
                    
                    <TouchableOpacity onPress={handleOlvide}>
                        <Text style={styles.link}>Olvidé mi contraseña</Text>
                    </TouchableOpacity>

                    <BotonRojo titulo="INICIAR SESIÓN" onPress={handleLogin} loading={cargando} disabled={cargando} style={{ marginTop: 16 }} />

                    <View style={styles.separadorRow}>
                        <View style={styles.linea} />
                        <Text style={styles.separadorText}>o</Text>
                        <View style={styles.linea} />
                    </View>

                    <BotonGris titulo="REGÍSTRATE" onPress={handleRegistro} style={{ marginTop: 8 }} />

                    <View style={styles.linksRow}>
                        <TouchableOpacity><Text style={styles.footerLink}>Condiciones de servicio</Text></TouchableOpacity>
                        <Text style={{ color: '#888' }}> | </Text>
                        <TouchableOpacity><Text style={styles.footerLink}>Política de privacidad</Text></TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};


export default IniciarSesion;

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
        paddingBottom: 40, // Espacio extra para que no pegue al borde inferior
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
        position: 'relative', // Para posicionar el icono
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: Platform.OS === 'ios' ? 16 : 12,
        marginBottom: 16,
        fontSize: 16,
        flex: 1,
        borderWidth: 1,
        borderColor: '#eee',
    },
    icono: {
        position: 'absolute',
        right: 15,
        top: -20, 
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

