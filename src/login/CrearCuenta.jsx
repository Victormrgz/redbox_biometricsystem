import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Platform, SafeAreaView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import HeaderColor from '../componentes/HeaderColor';
import BotonRojo from '../componentes/BotonRojo';
import TituloPrincipal from '../componentes/TituloPrincipal';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { registrarUsuario } from '../api/conexion';

const opcionesGenero = [
    { value: '', label: 'Selecciona género' },
    { value: 'M', label: 'Hombre' },
    { value: 'F', label: 'Mujer' },
    { value: 'O', label: 'Otro' },
];

const CrearCuenta = ({ route }) => {
    const { setIsAuthenticated } = route.params;

    const [form, setForm] = useState({
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        cedula: '',
        correo: '',
        contrasena: '',
        contrasena2: '',
        telefono: '',
        nacimiento: '',
        genero: '',
        invitacion: '',
    });
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setForm({ ...form, nacimiento: selectedDate });
        }
    };

    const navigation = useNavigation();
    const [cargando, setCargando] = useState(false);

    const formatFecha = (date) => {
        if (!date || !(date instanceof Date)) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleSubmit = async () => {
        if (form.contrasena !== form.contrasena2) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        if (!form.primerNombre || !form.primerApellido || !form.correo || !form.contrasena || !form.nacimiento || !form.cedula) {
            Alert.alert('Error', 'Por favor completa todos los campos obligatorios (Nombre, Apellido, Cédula, Correo, Contraseña y Nacimiento)');
            return;
        }

        const fechaFormateada = formatFecha(form.nacimiento);
        if (!fechaFormateada) {
            Alert.alert('Error', 'La fecha de nacimiento no es válida');
            return;
        }

        setCargando(true);
        try {
            const datosParaEnviar = {
                pnombre_usuario: form.primerNombre.trim(),
                snombre_usuario: form.segundoNombre?.trim() || '',
                papellido_usuario: form.primerApellido.trim(),
                sapellido_usuario: form.segundoApellido?.trim() || '',
                cedula_usuario: form.cedula.trim(),
                telefono_usuario: form.telefono.trim(),
                fecha_nacimiento_usuario: fechaFormateada,
                genero_usuario: form.genero,
                email_usuario: form.correo.trim().toLowerCase(),
                contrasena_usuario: form.contrasena,
            };

            await registrarUsuario(datosParaEnviar);

            Alert.alert('Éxito', 'Cuenta creada correctamente', [
                { text: 'OK', onPress: () => setIsAuthenticated(true) } // ← aquí el cambio
            ]);
        } catch (error) {
            if (error.response) {
                console.log("DETALLE DEL ERROR:", error.response.data);
                Alert.alert('Error de validación', JSON.stringify(error.response.data));
            } else {
                console.error('Error de red:', error.message);
            }
        } finally {
            setCargando(false);
        }
    };

    const handleLogin = () => {
        navigation.navigate('IniciarSesion');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView>
                <HeaderColor />
                <View style={styles.container}>
                    <TituloPrincipal titulo="¡ÚNETE A REDBOX!" />
                    <Text style={styles.subtitulo}>Por favor, completa tus datos para registrarte.</Text>
                    <View style={styles.row}>
                        <View style={styles.contenedorCard}>
                            <Text style={styles.label}>Primer Nombre</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Primer Nombre"
                                value={form.primerNombre}
                                onChangeText={text => handleChange('primerNombre', text)}
                            />
                        </View>
                        <View style={styles.contenedorCard}>
                            <Text style={styles.label}>Segundo Nombre</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Segundo Nombre"
                                value={form.segundoNombre}
                                onChangeText={text => handleChange('segundoNombre', text)}
                            />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.contenedorCard}>
                            <Text style={styles.label}>Primer Apellido</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Primer Apellido"
                                value={form.primerApellido}
                                onChangeText={text => handleChange('primerApellido', text)}
                            />
                        </View>
                        <View style={styles.contenedorCard}>
                            <Text style={styles.label}>Segundo Apellido</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Segundo Apellido"
                                value={form.segundoApellido}
                                onChangeText={text => handleChange('segundoApellido', text)}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.contenedorCard}>
                            <Text style={styles.label}>Cédula</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Cédula"
                                value={form.cedula}
                                onChangeText={text => handleChange('cedula', text)}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Correo electrónico</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Correo electrónico"
                        value={form.correo}
                        onChangeText={text => handleChange('correo', text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <View style={styles.row}>
                        <View style={styles.contenedorCard}>
                            <Text style={styles.label}>Contraseña</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Contraseña"
                                value={form.contrasena}
                                onChangeText={text => handleChange('contrasena', text)}
                                secureTextEntry
                            />
                        </View>
                        <View style={styles.contenedorCard}>
                            <Text style={styles.label}>Confirmar contraseña</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Confirmar contraseña"
                                value={form.contrasena2}
                                onChangeText={text => handleChange('contrasena2', text)}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.contenedorCard}>
                            <Text style={styles.label}>Teléfono</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Teléfono"
                                value={form.telefono}
                                onChangeText={text => handleChange('telefono', text)}
                                keyboardType="phone-pad"
                            />
                        </View>
                        <View style={styles.contenedorCard}>
                            <Text style={styles.label}>Nacimiento</Text>
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={{ color: form.nacimiento ? '#000' : '#999', fontSize: 16 }}>
                                    {form.nacimiento ? (form.nacimiento instanceof Date ? form.nacimiento.toLocaleDateString('es-ES') : form.nacimiento) : 'Seleccionar fecha'}
                                </Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={form.nacimiento instanceof Date ? form.nacimiento : new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={handleDateChange}
                                />
                            )}
                        </View>
                    </View>

                    <View style={styles.generoContainer}>
                        <Text style={styles.label}>Género</Text>
                        <View style={styles.generoRow}>
                            {opcionesGenero.slice(1).map((op) => (
                                <TouchableOpacity
                                    key={op.value}
                                    style={[
                                        styles.generoBtn,
                                        form.genero === op.value && styles.generoBtnActivo,
                                    ]}
                                    onPress={() => handleChange('genero', op.value)}
                                >
                                    <Text style={form.genero === op.value ? styles.generoTxtActivo : styles.generoTxt}>{op.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Código de invitación"
                        value={form.invitacion}
                        onChangeText={text => handleChange('invitacion', text)}
                    />
                    <BotonRojo titulo="CREAR CUENTA" onPress={handleSubmit} loading={cargando} disabled={cargando} />
                    <View style={{ alignItems: 'center', marginTop: 16 }}>
                        <Text>¿Ya tienes cuenta? <TouchableOpacity onPress={handleLogin}><Text style={styles.footerLink}>Iniciar Sesion</Text></TouchableOpacity></Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CrearCuenta;

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
    contenedorCard: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        gap: 8,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: Platform.OS === 'ios' ? 14 : 10,
        marginBottom: 8,
        fontSize: 16,
        height: 48,
        justifyContent: 'center',
    },
    generoContainer: {
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    generoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        height: 55,
    },
    generoBtn: {
        flex: 1,
        padding: 10,
        marginHorizontal: 4,
        borderRadius: 8,
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
        height: 40,
    },
    generoBtnActivo: {
        backgroundColor: '#b71c1c',
    },
    generoTxt: {
        color: '#222',
        fontWeight: 'bold',
    },
    generoTxtActivo: {
        color: '#fff',
        fontWeight: 'bold',
    },
    footerLink: {
        color: '#b71c1c',
        textDecorationLine: 'underline',
        fontSize: 13,
        marginBottom: -3,
    },
});