import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet, View, Text, ScrollView, ActivityIndicator,
    Alert, TouchableOpacity, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import HeaderColor from '../componentes/HeaderColor';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import { getHistorialPagos, getTodosLosUsuarios } from '../api/conexion';
import { AuthContext } from '../auth/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HistorialPagos = () => {
    const insets = useSafeAreaInsets();
    const { usuario } = useContext(AuthContext);
    const esAdmin = usuario?.rol === 'Administrador';

    const [pagos, setPagos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioFiltro, setUsuarioFiltro] = useState('');
    const [fechaFiltro, setFechaFiltro] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [filtrando, setFiltrando] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const token = await AsyncStorage.getItem('userToken');
            const promesas = [getHistorialPagos(token)];
            if (esAdmin) promesas.push(getTodosLosUsuarios(token));
            const [listaPagos, listaUsuarios] = await Promise.all(promesas);
            setPagos(listaPagos);
            if (esAdmin && listaUsuarios) setUsuarios(listaUsuarios);
        } catch (error) {
            Alert.alert('Error', 'No se pudo cargar el historial.');
        } finally {
            setCargando(false);
        }
    };

    const handleFiltrar = async () => {
        try {
            setFiltrando(true);
            const token = await AsyncStorage.getItem('userToken');
            const fechaStr = fechaFiltro ? fechaFiltro.toISOString().split('T')[0] : null;
            const resultado = await getHistorialPagos(token, {
                idUsuario: esAdmin ? (usuarioFiltro || null) : null,
                fecha: fechaStr,
            });
            setPagos(resultado);
        } catch (error) {
            Alert.alert('Error', 'No se pudo filtrar el historial.');
        } finally {
            setFiltrando(false);
        }
    };

    const limpiarFiltros = async () => {
        setUsuarioFiltro('');
        setFechaFiltro(null);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const resultado = await getHistorialPagos(token);
            setPagos(resultado);
        } catch (error) {
            Alert.alert('Error', 'No se pudo limpiar los filtros.');
        }
    };

    const colorEstado = (estado) => {
        if (estado === 'Completado') return '#27ae60';
        if (estado === 'Pendiente') return '#f39c12';
        return '#e74c3c';
    };

    return (
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
            <ScrollView style={styles.container}>
                <HeaderColor />
                <View style={styles.content}>
                    <TituloPrincipal titulo="Historial de pagos" />
                    <TituloSecundario titulo="Consulta los pagos registrados y suscripciones aplicadas." />

                    {/* FILTROS */}
                    <View style={styles.filtrosCard}>

                        {/* Filtro por usuario — solo admin */}
                        {esAdmin && (
                            <View style={styles.filtroItem}>
                                <Text style={styles.filtroLabel}>Usuario</Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        selectedValue={usuarioFiltro}
                                        onValueChange={(val) => setUsuarioFiltro(val)}
                                    >
                                        <Picker.Item label="Todos los usuarios" value="" />
                                        {usuarios.map((u) => (
                                            <Picker.Item
                                                key={u.id_usuario}
                                                label={`${u.pnombre_usuario} ${u.papellido_usuario}`}
                                                value={u.id_usuario}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        )}

                        {/* Filtro por fecha — ambos roles */}
                        <View style={styles.filtroItem}>
                            <Text style={styles.filtroLabel}>Fecha</Text>
                            <TouchableOpacity
                                style={styles.inputFecha}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={{ color: fechaFiltro ? '#1a1a1a' : '#999' }}>
                                    {fechaFiltro
                                        ? fechaFiltro.toLocaleDateString('es-ES')
                                        : 'Seleccionar fecha'}
                                </Text>
                                <MaterialIcons name="date-range" size={20} color="#666" />
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={fechaFiltro || new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, date) => {
                                        setShowDatePicker(false);
                                        if (date) setFechaFiltro(date);
                                    }}
                                />
                            )}
                        </View>

                        {/* Botones */}
                        <View style={styles.botonesRow}>
                            <TouchableOpacity style={styles.botonFiltrar} onPress={handleFiltrar}>
                                {filtrando
                                    ? <ActivityIndicator color="#fff" size="small" />
                                    : <Text style={styles.textoBoton}>Filtrar</Text>
                                }
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.botonLimpiar} onPress={limpiarFiltros}>
                                <Text style={styles.textoBotonLimpiar}>Limpiar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* LISTA DE PAGOS */}
                    {cargando ? (
                        <ActivityIndicator color="#FF4D4D" size="large" style={{ marginTop: 40 }} />
                    ) : pagos.length === 0 ? (
                        <Text style={styles.textoVacio}>No hay pagos registrados.</Text>
                    ) : (
                        pagos.map((pago) => (
                            <View key={pago.id_pago} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.nombreUsuario}>{pago.usuario}</Text>
                                    <View style={[styles.badge, { backgroundColor: colorEstado(pago.estado) + '20' }]}>
                                        <Text style={[styles.badgeTexto, { color: colorEstado(pago.estado) }]}>
                                            {pago.estado}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.separador} />

                                <View style={styles.fila}>
                                    <Text style={styles.filaLabel}>Fecha</Text>
                                    <Text style={styles.filaValor}>{pago.fecha}</Text>
                                </View>
                                <View style={styles.fila}>
                                    <Text style={styles.filaLabel}>Monto</Text>
                                    <Text style={styles.filaValor}>{pago.monto}</Text>
                                </View>
                                <View style={styles.fila}>
                                    <Text style={styles.filaLabel}>Moneda</Text>
                                    <Text style={styles.filaValor}>{pago.moneda}</Text>
                                </View>
                                <View style={styles.fila}>
                                    <Text style={styles.filaLabel}>Plan</Text>
                                    <Text style={styles.filaValor}>{pago.plan}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1 },
    content: { paddingHorizontal: 16, paddingBottom: 30 },
    filtrosCard: {
        backgroundColor: '#fafafa',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    filtroItem: { marginBottom: 10 },
    filtroLabel: { fontSize: 12, fontWeight: '600', color: '#555', marginBottom: 4 },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    inputFecha: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    botonesRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    botonFiltrar: {
        flex: 1,
        backgroundColor: '#FF4D4D',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    botonLimpiar: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    textoBoton: { color: '#fff', fontWeight: 'bold' },
    textoBotonLimpiar: { color: '#666', fontWeight: 'bold' },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    nombreUsuario: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a' },
    badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    badgeTexto: { fontSize: 12, fontWeight: '600' },
    separador: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 10 },
    fila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    filaLabel: { fontSize: 13, color: '#666' },
    filaValor: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
    textoVacio: { color: '#999', textAlign: 'center', marginTop: 40 },
});

export default HistorialPagos;