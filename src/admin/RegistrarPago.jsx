import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import HeaderColor from '../componentes/HeaderColor';
import BotonRojo from '../componentes/BotonRojo';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import { registrarPago, getTodosLosUsuarios } from '../api/conexion';
import { AuthContext } from '../auth/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const RegistrarPago = () => {
    const insets = useSafeAreaInsets();
    const { usuario } = useContext(AuthContext);
    const [usuarios, setUsuarios] = useState([]);
    const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [form, setForm] = useState({
        id_usuario: '',
        nombre_plan: 'Basico',
        monto: '',
        moneda: 'Dolares',
        pin: '',
    });

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const data = await getTodosLosUsuarios(token);
            setUsuarios(data);
            if (data.length > 0) setForm(f => ({ ...f, id_usuario: data[0].id_usuario }));
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar los usuarios.');
        } finally {
            setCargandoUsuarios(false);
        }
    };

    const handleRegistrar = async () => {
        if (!form.monto.trim()) {
            Alert.alert('Error', 'Ingresa el monto del pago.');
            return;
        }
        if (!form.pin.trim()) {
            Alert.alert('Error', 'Ingresa el PIN de confirmación.');
            return;
        }

        try {
            setGuardando(true);
            const token = await AsyncStorage.getItem('userToken');
            const respuesta = await registrarPago(form, token);
            Alert.alert('✅ Éxito', respuesta.mensaje);
            setForm(f => ({ ...f, monto: '', pin: '' }));
        } catch (error) {
            const msg = error.response?.data?.error || 'No se pudo registrar el pago.';
            Alert.alert('Error', msg);
        } finally {
            setGuardando(false);
        }
    };

    if (cargandoUsuarios) return <ActivityIndicator color="#FF4D4D" style={{ flex: 1, marginTop: 100 }} />;

    return (
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
            <ScrollView style={styles.container}>
                <HeaderColor />
                <View style={styles.content}>
                    <TituloPrincipal titulo="Registrar Pago" />
                    <TituloSecundario titulo="Aplica una suscripción activa al registrar el pago." />

                    <View style={styles.card}>

                        {/* USUARIO */}
                        <Text style={styles.label}>Usuario</Text>
                        <View style={styles.picker}>
                            <Picker
                                selectedValue={form.id_usuario}
                                onValueChange={(val) => setForm({ ...form, id_usuario: val })}
                            >
                                {usuarios.map((u) => (
                                    <Picker.Item
                                        key={u.id_usuario}
                                        label={`${u.pnombre_usuario} ${u.papellido_usuario}`}
                                        value={u.id_usuario}
                                    />
                                ))}
                            </Picker>
                        </View>

                        {/* PLAN */}
                        <Text style={styles.label}>Plan</Text>
                        <View style={styles.picker}>
                            <Picker
                                selectedValue={form.nombre_plan}
                                onValueChange={(val) => setForm({ ...form, nombre_plan: val })}
                            >
                                <Picker.Item label="Básico (12 clases)" value="Basico" />
                                <Picker.Item label="Premium (24 clases)" value="Premium" />
                            </Picker>
                        </View>

                        {/* MONTO */}
                        <Text style={styles.label}>Monto</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            value={form.monto}
                            onChangeText={(val) => setForm({ ...form, monto: val })}
                        />

                        {/* MONEDA */}
                        <Text style={styles.label}>Moneda</Text>
                        <View style={styles.picker}>
                            <Picker
                                selectedValue={form.moneda}
                                onValueChange={(val) => setForm({ ...form, moneda: val })}
                            >
                                <Picker.Item label="Dólares" value="Dolares" />
                                <Picker.Item label="Bolívares" value="Bolivares" />
                                <Picker.Item label="Pesos Colombianos" value="Pesos" />
                            </Picker>
                        </View>

                        {/* PIN */}
                        <Text style={styles.label}>PIN de confirmación</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••"
                            keyboardType="numeric"
                            secureTextEntry
                            value={form.pin}
                            onChangeText={(val) => setForm({ ...form, pin: val })}
                        />

                        <BotonRojo
                            titulo={guardando ? 'Registrando...' : 'Registrar Pago'}
                            onPress={handleRegistrar}
                            disabled={guardando}
                            style={{ marginTop: 16 }}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1 },
    content: { paddingHorizontal: 16, paddingBottom: 30 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    label: { fontSize: 13, fontWeight: '600', color: '#333', marginTop: 12, marginBottom: 4 },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        backgroundColor: '#fafafa',
    },
    picker: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fafafa',
        marginBottom: 4,
    },
});

export default RegistrarPago;