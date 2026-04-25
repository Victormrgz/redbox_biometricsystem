
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import HeaderColor from '../componentes/HeaderColor';
import TituloPrincipal from '../componentes/TituloPrincipal';
import BotonRojo from '../componentes/BotonRojo';
import BotonGris from '../componentes/BotonGris';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';

const IniciarSesion = () => {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const navigation = useNavigation();

    const handleLogin = () => {
        // Aquí va la lógica de autenticación
        // navigation.navigate('Inicio');
    };

    const handleRegistro = () => {
        navigation.navigate('CrearCuenta');
    };

    const handleOlvide = () => {
        // Aquí va la lógica para recuperar contraseña
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <HeaderColor />
                <View style={styles.container}>
                    <Text style={styles.titulo}>¡Bienvenido a REDBOX!</Text>
                    <Text style={styles.subtitulo}>Por favor, inicia sesión para continuar.</Text>

                    <Text style={styles.label}>Correo electrónico</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="ejemplo@correo.com"
                        value={correo}
                        onChangeText={setCorreo}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Contraseña</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="********"
                        value={contrasena}
                        onChangeText={setContrasena}
                        secureTextEntry
                    />

                    <TouchableOpacity onPress={handleOlvide}>
                        <Text style={styles.link}>Olvidé mi contraseña</Text>
                    </TouchableOpacity>

                    <BotonRojo titulo="INICIAR SESIÓN" onPress={handleLogin} style={{ marginTop: 16 }} />

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
        </SafeAreaView>
    );
};

export default IniciarSesion;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Constants.statusBarHeight,
    },
    container: {
        maxWidth: 420,
        alignSelf: 'center',
        padding: 16,
        width: '100%',
        flex: 1,
        justifyContent: 'center',
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingBottom: 15,
        textAlign: 'center',
    },
    subtitulo: {
        textAlign: 'center',
        marginBottom: 24,
        color: '#222',
        fontSize: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: Platform.OS === 'ios' ? 14 : 10,
        marginBottom: 12,
        fontSize: 16,
    },
    link: {
        color: '#b71c1c',
        textDecorationLine: 'underline',
        alignSelf: 'center',
        fontSize: 14,
    },
    separadorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 18,
    },
    linea: {
        flex: 1,
        height: 1,
        backgroundColor: '#ccc',
    },
    separadorText: {
        marginHorizontal: 8,
        color: '#888',
        fontSize: 14,
    },
    linksRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
        gap: 4,
    },
    footerLink: {
        color: '#b71c1c',
        textDecorationLine: 'underline',
        fontSize: 13,
    },
});