import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import HeaderColor from '../componentes/HeaderColor';
import BotonRojo from '../componentes/BotonRojo';
import TituloPrincipal from '../componentes/TituloPrincipal';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { registrarUsuario } from '../api/conexion';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Picker } from '@react-native-picker/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const opcionesGenero = [
    { value: '', label: 'Selecciona género' },
    { value: 'M', label: 'Hombre' },
    { value: 'F', label: 'Mujer' },
    { value: 'Otro', label: 'Otro' },
];

const CrearCuenta = ({ route }) => {
    const insets = useSafeAreaInsets();
    const { setIsAuthenticated } = route.params;

    const phoneInputRef = useRef(null);

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
        codigoTelefono: '↓', 
        nacimiento: '',
        genero: '',
        invitacion: '',
    });
    const [errors, setErrors] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleChange = (name, value) => {
        setForm({ ...form, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: null });
    };

    // validar la fecha de nacimiento
    const validateNacimiento = (date) => {
        if (!date) {
            return 'La fecha es obligatoria.';
        }
        const hoy = new Date();
        const fechaMinima = new Date(hoy.getFullYear() - 15, hoy.getMonth(), hoy.getDate());
        if (date > fechaMinima) {
            return 'Debes tener al menos 15 años.';
        }
        return null; // No hay error
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const error = validateNacimiento(selectedDate);
            setErrors(prevErrors => ({ ...prevErrors, nacimiento: error }));
            setForm(prevForm => ({ ...prevForm, nacimiento: selectedDate }));
        }
        // Si el usuario cancela el DatePicker (selectedDate es undefined), el error se mantiene o se limpia si ya no aplica.
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

        // Validaciones de texto (Nombres, Apellidos, Cédula, Correo, Password 
        if (!form.primerNombre.trim()) { newErrors.primerNombre = 'El primer nombre es obligatorio.'; isValid = false; }
        if (!form.primerApellido.trim()) { newErrors.primerApellido = 'El primer apellido es obligatorio.'; isValid = false; }
        
        if (!form.cedula.trim()) {
            newErrors.cedula = 'La cédula es obligatoria.';
            isValid = false;
        } else if (!/^\d{1,8}$/.test(form.cedula.trim())) { 
            newErrors.cedula = 'La cédula debe tener máximo 8 dígitos.';
            isValid = false;
        }

        if (!form.correo.trim()) { newErrors.correo = 'El correo es obligatorio.'; isValid = false; }
        
        if (!form.contrasena) { 
            newErrors.contrasena = 'La contraseña es obligatoria.'; 
            isValid = false; 
        }

        if (form.contrasena !== form.contrasena2) {
            newErrors.contrasena2 = 'Las contraseñas no coinciden.';
            isValid = false;
        }

        // Ejecutar validación de teléfono
        const numeroLimpio = form.telefono.trim();
        if (!numeroLimpio) {
            newErrors.telefono = 'El número es obligatorio.';
            isValid = false;
        } else if (!/^\d{7}$/.test(numeroLimpio)) {
            newErrors.telefono = 'El número debe tener 7 dígitos.';
            isValid = false;
        }

        const nacimientoError = validateNacimiento(form.nacimiento);
        if (nacimientoError) {
            newErrors.nacimiento = nacimientoError;
            isValid = false;
        }
        if (!form.genero) { newErrors.genero = 'Selecciona un género.'; isValid = false; }

        return { newErrors, isValid };
    };

    const [ojoAbierto, setOjoAbierto] = useState(false);
    const presionarOjo = () => { setOjoAbierto(!ojoAbierto); };
    const [verConfirmar, setVerConfirmar] = useState(false);

    const handleSubmit = async () => {
        const { newErrors, isValid } = validateForm();
        setErrors(newErrors);

        // ✅ Validar que se haya ingresado un código de invitación
        if (!form.invitacion.trim()) {
            Alert.alert('Error', 'El código de invitación es obligatorio.');
            return;
        }

        if (!isValid) {
            Alert.alert('Error de validación', 'Por favor completa todos los campos correctamente.');
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
                telefono_usuario: `${form.codigoTelefono}${form.telefono.trim()}`,
                fecha_nacimiento_usuario: fechaFormateada,
                genero_usuario: form.genero,
                email_usuario: form.correo.trim().toLowerCase(),
                contrasena_usuario: form.contrasena,
                codigo_invitacion: form.invitacion.trim().toUpperCase(), // ✅ Agregar código
            };
            
            const response = await registrarUsuario(datosParaEnviar);
            const { token, user_id } = response;

            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userId', JSON.stringify(user_id));

            Alert.alert('Éxito', 'Cuenta creada correctamente', [
                { text: 'OK', onPress: () => setIsAuthenticated(true) } 
            ]);
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Error al conectar con el servidor';
            Alert.alert('Error', typeof errorMsg === 'string' ? errorMsg : 'Datos inválidos');
        } finally {
            setCargando(false);
        }
    };

    const handleLogin = () => {
        navigation.navigate('IniciarSesion');
    };

    return (
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
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
                            <View style = {styles.contenedorInput}>
                                <TextInput
                                    style={[styles.input, errors.contrasena && styles.inputError]}
                                    placeholder="Contraseña"
                                    value={form.contrasena}
                                    onChangeText={text => handleChange('contrasena', text)}
                                    secureTextEntry={!ojoAbierto}
                                />
                                
                                <TouchableOpacity onPress={presionarOjo}>
                                    <AntDesign 
                                        // El icono cambia según el estado
                                        name= "eye-invisible"
                                        size={24} 
                                        color={errors.contrasena ? "red" : "black"} 
                                        style={styles.icono} 
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.contrasena && <Text style={styles.errorText}>{errors.contrasena}</Text>}
                        </View>
                        <View style={styles.contenedorCard}>
                        <Text style={styles.label}>Confirmar contraseña</Text>
                        
                        <View style={styles.contenedorInput}>
                            <TextInput
                                style={[styles.input, errors.contrasena2 && styles.inputError]}
                                placeholder="Contraseña"
                                value={form.contrasena2}
                                onChangeText={text => handleChange('contrasena2', text)}
                                secureTextEntry={!verConfirmar} 
                            />
                            
                            <TouchableOpacity onPress={() => setVerConfirmar(!verConfirmar)}>
                                <AntDesign 
                                    name= "eye-invisible"
                                    size={24} 
                                    color={errors.contrasena2 ? "red" : "black"} 
                                    style={styles.icono} 
                                />
                            </TouchableOpacity>
                        </View>

                    {errors.contrasena2 && <Text style={styles.errorText}>{errors.contrasena2}</Text>}
                    </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.contenedorCard}>
                        <Text style={styles.label}>Teléfono</Text>
                        
                        <View style={styles.filaTelefono}>
                            
                            <View style={[styles.contenedorPicker, errors.telefono && styles.inputErrorBorder]}>
                                <Text style={styles.textoCodigo}>{form.codigoTelefono}</Text>
                                <Picker
                                    mode="dropdown"
                                    selectedValue={form.codigoTelefono}
                                    onValueChange={(itemValue) => {
                                        handleChange('codigoTelefono', itemValue);
                                        phoneInputRef.current?.focus();
                                    }}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="0414" value="0414" />
                                    <Picker.Item label="0424" value="0424" />
                                    <Picker.Item label="0412" value="0412" />
                                    <Picker.Item label="0416" value="0416" />
                                    <Picker.Item label="0426" value="0426" />
                                </Picker>
                            </View>

                            
                            <TextInput
                                ref={phoneInputRef}
                                style={[styles.inputTelefono, errors.telefono && styles.inputErrorBorder]}
                                placeholder="1234567"
                                keyboardType="numeric"
                                maxLength={7}
                                value={form.telefono}
                                onChangeText={(text) => {
                                    // Solo permite números
                                    const cleaned = text.replace(/[^0-9]/g, '');
                                    handleChange('telefono', cleaned); // Usar handleChange para limpiar el error
                                }}
                            />
                        </View>
                        
                        {/* Mensaje de error debajo de ambos */}
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
        </View>
    );
};

export default CrearCuenta;

const styles = StyleSheet.create({
    
    safeArea: {
        flex: 1,
        backgroundColor: '#fff'
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
    contenedorInput: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icono: {
        flex: 1,
        marginLeft: -30,
        paddingTop: 10
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: Platform.OS === 'ios' ? 14 : 10,
        marginBottom: 8,
        fontSize: 16,
        height: 48,
        justifyContent: 'center',
        width: '100%',
    },
    filaTelefono: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contenedorPicker: {
        width: '35%',
        height: 50,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    textoCodigo: {
        fontSize: 16,
        color: '#000',
    },
    picker: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0, // El picker es invisible pero funcional al tacto
        backgroundColor: 'transparent',
    },
    inputTelefono: {
        width: '62%',
        height: 50,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#000',
    },
    inputErrorBorder: {
        borderWidth: 1,
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
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