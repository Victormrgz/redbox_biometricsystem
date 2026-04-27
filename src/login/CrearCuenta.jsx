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
    const [errors, setErrors] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleChange = (name, value) => {
        setForm({ ...form, [name]: value });
        // Limpiar el error del campo cuando el usuario empieza a escribir
        if (errors[name]) setErrors({ ...errors, [name]: null });
    };

    // Cuando el usuario cambia un campo, limpiamos el error asociado a ese campo
    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setForm({ ...form, nacimiento: selectedDate });
            if (errors.nacimiento) setErrors({ ...errors, nacimiento: null });
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

    const validateForm = () => {
        let newErrors = {};
        let isValid = true;

        // Primer Nombre
        if (!form.primerNombre.trim()) {
            newErrors.primerNombre = 'El primer nombre es obligatorio.';
            isValid = false;
        } else if (form.primerNombre.trim().length < 2) {
            newErrors.primerNombre = 'El primer nombre debe tener al menos 2 caracteres.';
            isValid = false;
        }

        // Primer Apellido
        if (!form.primerApellido.trim()) {
            newErrors.primerApellido = 'El primer apellido es obligatorio.';
            isValid = false;
        } else if (form.primerApellido.trim().length < 2) {
            newErrors.primerApellido = 'El primer apellido debe tener al menos 2 caracteres.';
            isValid = false;
        }

        // Cédula
        if (!form.cedula.trim()) {
            newErrors.cedula = 'La cédula es obligatoria.';
            isValid = false;
        } else if (!/^\d{10}$/.test(form.cedula.trim())) {
            newErrors.cedula = 'La cédula debe tener 10 dígitos numéricos.';
            isValid = false;
        }

        // Correo electrónico
        if (!form.correo.trim()) {
            newErrors.correo = 'El correo electrónico es obligatorio.';
            isValid = false;
        } else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(form.correo.trim())) {
            newErrors.correo = 'El formato del correo electrónico no es válido.';
            isValid = false;
        }

        // Contraseña
        if (!form.contrasena) {
            newErrors.contrasena = 'La contraseña es obligatoria.';
            isValid = false;
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/.test(form.contrasena)) {
            newErrors.contrasena = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.';
            isValid = false;
        }

        // Confirmar Contraseña
        if (!form.contrasena2) {
            newErrors.contrasena2 = 'Debes confirmar la contraseña.';
            isValid = false;
        } else if (form.contrasena !== form.contrasena2) {
            newErrors.contrasena2 = 'Las contraseñas no coinciden.';
            isValid = false;
        }

        // Teléfono
        if (!form.telefono.trim()) {
            newErrors.telefono = 'El teléfono es obligatorio.';
            isValid = false;
        } else if (!/^\d{11}$/.test(form.telefono.trim())) {
            newErrors.telefono = 'El teléfono debe tener 11 dígitos numéricos.';
            isValid = false;
        }

        // Fecha de Nacimiento
        if (!form.nacimiento) {
            newErrors.nacimiento = 'La fecha de nacimiento es obligatoria.';
            isValid = false;
        } else {
            const fechaFormateada = formatFecha(form.nacimiento);
            if (!fechaFormateada) {
                newErrors.nacimiento = 'La fecha de nacimiento no es válida.';
                isValid = false;
            }
        }

        // Género
        if (!form.genero) {
            newErrors.genero = 'Debes seleccionar un género.';
            isValid = false;
        }

        return { newErrors, isValid };
    };

    const handleSubmit = async () => {
        const { newErrors, isValid } = validateForm();
        setErrors(newErrors);

        if (!isValid) {
            Alert.alert('Error de validación', 'Por favor completa todos los campos.');
            return;
        }
        const fechaFormateada = formatFecha(form.nacimiento);
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
                { text: 'OK', onPress: () => setIsAuthenticated(true) } 
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
                                style={[styles.input, errors.primerNombre && styles.inputError]}
                                placeholder="Primer Nombre"
                                value={form.primerNombre}
                                onChangeText={text => handleChange('primerNombre', text)}
                            />
                            {errors.primerNombre && <Text style={styles.errorText}>{errors.primerNombre}</Text>}
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
                                style={[styles.input, errors.primerApellido && styles.inputError]}
                                placeholder="Primer Apellido"
                                value={form.primerApellido}
                                onChangeText={text => handleChange('primerApellido', text)}
                            />
                            {errors.primerApellido && <Text style={styles.errorText}>{errors.primerApellido}</Text>}
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
                                style={[styles.input, errors.cedula && styles.inputError]}
                                placeholder="Cédula"
                                value={form.cedula}
                                onChangeText={text => handleChange('cedula', text)}
                                keyboardType="numeric"
                                maxLength={10}
                            />
                            {errors.cedula && <Text style={styles.errorText}>{errors.cedula}</Text>}
                        </View>
                    </View>

                    <Text style={styles.label}>Correo electrónico</Text>
                    <TextInput
                        style={[styles.input, errors.correo && styles.inputError]}
                        placeholder="Correo electrónico"
                        value={form.correo}
                        onChangeText={text => handleChange('correo', text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    {errors.correo && <Text style={styles.errorText}>{errors.correo}</Text>}

                    <View style={styles.row}>
                        <View style={styles.contenedorCard}>
                            <Text style={styles.label}>Contraseña</Text>
                            <TextInput
                                style={[styles.input, errors.contrasena && styles.inputError]}
                                placeholder="Contraseña"
                                value={form.contrasena}
                                onChangeText={text => handleChange('contrasena', text)}
                                secureTextEntry
                            />
                            {errors.contrasena && <Text style={styles.errorText}>{errors.contrasena}</Text>}
                        </View>
                        <View style={styles.contenedorCard}>
                            <Text style={styles.label}>Confirmar contraseña</Text>
                            <TextInput
                                style={[styles.input, errors.contrasena2 && styles.inputError]}
                                placeholder="Contraseña"
                                value={form.contrasena2}
                                onChangeText={text => handleChange('contrasena2', text)}
                                secureTextEntry
                            />
                            {errors.contrasena2 && <Text style={styles.errorText}>{errors.contrasena2}</Text>}
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.contenedorCard}>
                            <Text style={styles.label}>Teléfono</Text>
                            <TextInput
                                style={[styles.input, errors.telefono && styles.inputError]}
                                placeholder="Teléfono"
                                value={form.telefono}
                                onChangeText={text => handleChange('telefono', text)}
                                keyboardType="phone-pad"
                                maxLength={11}
                            />
                            {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}
                        </View>
                        <View style={styles.contenedorCard}>
                            <Text style={styles.label}>Fecha de Nacimiento</Text>
                            <TouchableOpacity
                                style={[styles.input, errors.nacimiento && styles.inputError]}
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
                            {errors.nacimiento && <Text style={styles.errorText}>{errors.nacimiento}</Text>}
                        </View>
                    </View>

                    <View style={styles.generoContainer}>
                        <Text style={styles.label}>Género</Text>
                        <View style={[
                            styles.generoRow,
                            errors.genero && styles.inputError,
                            errors.genero && { borderRadius: 8, padding: 2 }
                        ]}>
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
                        {errors.genero && <Text style={styles.errorText}>{errors.genero}</Text>}
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
    inputError: {
        borderColor: '#e60000', // Rojo para el borde del input con error
        borderWidth: 1,
    },
    errorText: {
        color: '#e60000', // Rojo para el texto del error
        fontSize: 12,
        marginBottom: 4,
        fontWeight: 'bold',
    },
});