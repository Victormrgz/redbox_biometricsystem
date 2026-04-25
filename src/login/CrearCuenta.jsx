
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Platform, SafeAreaView } from 'react-native';
import HeaderColor from '../componentes/HeaderColor';
import BotonRojo from '../componentes/BotonRojo';
import TituloPrincipal from '../componentes/TituloPrincipal';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';

const opcionesGenero = [
    { value: '', label: 'Selecciona género' },
    { value: 'M', label: 'Hombre' },
    { value: 'F', label: 'Mujer' },
    { value: 'O', label: 'Otro' },
];

const CrearCuenta = () => {
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
    codigoInvitacion: '',
    });

    const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
    };

    const navigation = useNavigation();

  const handleSubmit = () => {
    navigation.navigate('Inicio');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView >
      <HeaderColor />
      <View style={styles.container}>
        <TituloPrincipal titulo="¡ÚNETE A REDBOX!" />
        <Text style={styles.subtitulo}>Por favor, completa tus datos para registrarte.</Text>
        <View style={styles.row}>
            <View styles = {styles.contenedorCard}>
                <Text style= {styles.label}>Primer Nombre</Text>
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Primer Nombre"
                    value={form.primerNombre}
                    onChangeText={text => handleChange('primerNombre', text)}
                />
            </View>
            
            <View style = {styles.contenedorCard}>
                <Text style= {styles.label}>Segundo Nombre</Text>
                <TextInput
                    style={[styles.input, { flex: 1, marginLeft: 8 }]}
                    placeholder="Segundo Nombre"
                    value={form.segundoNombre}
                    onChangeText={text => handleChange('segundoNombre', text)}
                />
            </View>
            
        </View>
        <View style={styles.row}>
            <View styles = {styles.contenedorCard}>
                <Text style= {styles.label}>Primer Apellido</Text>
                <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Primer Apellido"
                value={form.primerApellido}
                onChangeText={text => handleChange('primerApellido', text)}
                />
            </View>
            
            <View style = {styles.contenedorCard}>
                <Text style= {styles.label}>Segundo Apellido</Text>
                <TextInput
                    style={[styles.input, { flex: 1, marginLeft: 8 }]}
                    placeholder="Segundo Apellido"
                    value={form.segundoApellido}
                    onChangeText={text => handleChange('segundoApellido', text)}
                />
            </View>
        </View>

        <View style={styles.row}>
            <View style = {styles.contenedorCard}>
                <Text style= {styles.label}>Cédula</Text>
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Cédula / ID"
                    value={form.cedula}
                    onChangeText={text => handleChange('cedula', text)}
                />
            </View>
        </View>

        <Text style= {styles.label}>Correo electrónico</Text>
        <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={form.correo}
            onChangeText={text => handleChange('correo', text)}
            keyboardType="email-address"
            autoCapitalize="none"
        />

        <View style={styles.row}>
        <View style = {styles.contenedorCard}>
            <Text style= {styles.label}>Contraseña</Text>
            <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Contraseña"
                value={form.contrasena}
                onChangeText={text => handleChange('contrasena', text)}
                secureTextEntry
            />
            </View>
            <View style = {styles.contenedorCard}>
                <Text style= {styles.label}>Confirmar contraseña</Text>
                <TextInput
                    style={[styles.input, { flex: 1, marginLeft: 8 }]}
                    placeholder="Confirmar contraseña"
                    value={form.contrasena2}
                    onChangeText={text => handleChange('contrasena2', text)}
                    secureTextEntry
                />
            </View>
        </View>

        <View style={styles.row}>
            <View style = {styles.contenedorCard}>
                <Text style= {styles.label}>Teléfono</Text>
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Teléfono"
                    value={form.telefono}
                    onChangeText={text => handleChange('telefono', text)}
                    keyboardType="phone-pad"
                />
            </View>
          
          <View styles = {styles.contenedorCard}>
            <Text style= {styles.label}>Fecha de nacimiento</Text>
            <TextInput
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
                placeholder="Fecha de nacimiento "
                value={form.nacimiento}
                onChangeText={text => handleChange('nacimiento', text)}
            />
        </View>
        </View>
    
        <View style={styles.input}>
        <Text style= {styles.label}>Género</Text>
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
          placeholder="Código de invitación "
          value={form.invitacion}
          onChangeText={text => handleChange('invitacion', text)}
        />
        <BotonRojo titulo="CREAR CUENTA" onPress={handleSubmit}  />
        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <Text>¿Ya tienes cuenta? <Text style={{ color: '#b71c1c', textDecorationLine: 'underline' }}>Inicia Sesión</Text></Text>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};


export default CrearCuenta;

// ================== ESTILOS ==================
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff', // O el color de fondo de tu app
        // En Android, SafeAreaView a veces necesita un padding manual
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
    },
    input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 14 : 10,
    marginBottom: 8,
    fontSize: 16,
    },
    generoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    },
    generoBtn: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
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
});
