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
import BotonRojo from '../componentes/BotonRojo';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { redBoxApi } from '../api/conexion';

const HistorialPagos = () => {
    const insets = useSafeAreaInsets();
    const { usuario } = useContext(AuthContext);
    const esAdmin = usuario?.rol === 'Administrador';

    const [pagos, setPagos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioFiltro, setUsuarioFiltro] = useState('');
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerMode, setPickerMode] = useState('inicio');
    const [cargando, setCargando] = useState(true);
    const [filtrando, setFiltrando] = useState(false);
    const [descargandoPDF, setDescargandoPDF] = useState(false);

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
            
            const params = {};
            
            if (fechaInicio) {
                params.fecha_inicio = fechaInicio.toISOString().split('T')[0];
            }
            if (fechaFin) {
                params.fecha_fin = fechaFin.toISOString().split('T')[0];
            }
            
            // ✅ Validar que la fecha fin no sea mayor al día actual
            if (fechaFin) {
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                const fechaFinComparar = new Date(fechaFin);
                fechaFinComparar.setHours(0, 0, 0, 0);
                
                if (fechaFinComparar > hoy) {
                    Alert.alert('Error', 'La fecha fin no puede ser mayor al día actual');
                    setFiltrando(false);
                    return;
                }
            }
            
            if (esAdmin && usuarioFiltro) {
                params.id_usuario = usuarioFiltro;
            }
            
            console.log('📤 Filtros:', params);
            
            const resultado = await getHistorialPagos(token, params);
            setPagos(resultado);
        } catch (error) {
            console.error('Error filtrando:', error);
            Alert.alert('Error', 'No se pudo filtrar el historial.');
        } finally {
            setFiltrando(false);
        }
    };

    const limpiarFiltros = async () => {
        setUsuarioFiltro('');
        setFechaInicio(null);
        setFechaFin(null);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const resultado = await getHistorialPagos(token);
            setPagos(resultado);
        } catch (error) {
            Alert.alert('Error', 'No se pudo limpiar los filtros.');
        }
    };

    const formatFecha = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const descargarPDFHistorial = async () => {
        console.log('🟢 Iniciando descarga de PDF...');
        console.log('📊 Pagos disponibles:', pagos.length);
        console.log('📅 Fecha Inicio:', fechaInicio);
        console.log('📅 Fecha Fin:', fechaFin);

        try {
            // ✅ Validar que haya pagos
            if (!pagos || pagos.length === 0) {
                Alert.alert('Sin datos', 'No hay pagos para generar el PDF.');
                console.log('❌ Sin pagos');
                return;
            }

            // ✅ Validar que se haya seleccionado un rango de fechas
            if (!fechaInicio || !fechaFin) {
                Alert.alert('Error', 'Debes seleccionar un rango de fechas para descargar el PDF.');
                console.log('❌ Fechas no seleccionadas');
                return;
            }

            // ✅ Validar que la fecha fin no sea mayor al día actual
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const fechaFinComparar = new Date(fechaFin);
            fechaFinComparar.setHours(0, 0, 0, 0);
            
            if (fechaFinComparar > hoy) {
                Alert.alert('Error', 'La fecha fin no puede ser mayor al día actual');
                console.log('❌ Fecha fin futura');
                return;
            }

            setDescargandoPDF(true);
            const token = await AsyncStorage.getItem('userToken');
            console.log('✅ Token obtenido');

            // ✅ Preparar parámetros
            const params = {
                fecha_inicio: fechaInicio.toISOString().split('T')[0],
                fecha_fin: fechaFin.toISOString().split('T')[0],
            };
            
            // Si es admin y hay filtro de usuario, agregarlo
            if (esAdmin && usuarioFiltro) {
                params.id_usuario = usuarioFiltro;
            }

            console.log('📤 Enviando params:', params);

            // ✅ Recibir JSON con base64 en lugar de blob
            const response = await redBoxApi.post('/descargar_pdf_historial_pagos/', params, {
                headers: { Authorization: `Token ${token}` },
            });

            console.log('📥 Respuesta recibida:', response.status);

            // ✅ Verificar que la respuesta fue exitosa
            if (response.data.success && response.data.pdf_base64) {
                console.log('📄 PDF recibido en base64, tamaño:', response.data.pdf_base64.length);
                
                // ✅ Crear el archivo usando la nueva API de expo-file-system
                const fechaActual = new Date().toISOString().split('T')[0];
                const fileName = response.data.filename || `historial_pagos_${fechaActual}.pdf`;
                const pdfFile = new File(Paths.cache, fileName);

                // ✅ Escribir el contenido base64
                await pdfFile.write(response.data.pdf_base64, { encoding: 'base64' });

                console.log('✅ Archivo guardado en:', pdfFile.uri);
                console.log('📄 Tamaño del archivo:', pdfFile.size, 'bytes');

                // ✅ Compartir el archivo
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(pdfFile.uri);
                    console.log('✅ Archivo compartido');
                } else {
                    Alert.alert('Descarga completa', `El PDF se ha guardado en tu dispositivo.\n\nArchivo: ${fileName}`);
                }
            } else {
                // ✅ Mostrar mensaje de error del backend
                const mensajeError = response.data?.error || 'No se pudo generar el PDF';
                Alert.alert('Error', mensajeError);
                console.log('❌ Error del backend:', mensajeError);
            }

        } catch (error) {
            console.error('❌ Error descargando PDF:', error);
            
            // ✅ Manejo específico de errores
            if (error.response?.status === 404) {
                Alert.alert('Error', 'El endpoint de PDF no está disponible. Contacta al administrador.');
            } else if (error.response?.status === 400) {
                Alert.alert('Error', error.response?.data?.error || 'Error en la solicitud');
            } else if (error.message?.includes('permission')) {
                Alert.alert('Error', 'No tienes permisos para guardar archivos en el dispositivo');
            } else {
                Alert.alert('Error', 'No se pudo descargar el PDF del historial');
            }
        } finally {
            setDescargandoPDF(false);
        }
    };

    const colorEstado = (estado) => {
        if (estado === 'Completado') return '#27ae60';
        if (estado === 'Pendiente') return '#f39c12';
        return '#e60000';
    };

    return (
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
            <ScrollView style={styles.container}>
                <HeaderColor />
                <View style={styles.content}>
                    <TituloPrincipal titulo="Historial de pagos" />
                    <TituloSecundario titulo="Consulta los pagos registrados y suscripciones aplicadas." />

                    <View style={styles.filtrosCard}>

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

                        <View style={styles.filtroItem}>
                            <Text style={styles.filtroLabel}>Fecha desde</Text>
                            <TouchableOpacity
                                style={styles.inputFecha}
                                onPress={() => {
                                    setPickerMode('inicio');
                                    setShowDatePicker(true);
                                }}
                            >
                                <Text style={{ color: fechaInicio ? '#1a1a1a' : '#999' }}>
                                    {fechaInicio ? formatFecha(fechaInicio) : 'Seleccionar fecha inicio'}
                                </Text>
                                <MaterialIcons name="date-range" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.filtroItem}>
                            <Text style={styles.filtroLabel}>Fecha hasta</Text>
                            <TouchableOpacity
                                style={styles.inputFecha}
                                onPress={() => {
                                    setPickerMode('fin');
                                    setShowDatePicker(true);
                                }}
                            >
                                <Text style={{ color: fechaFin ? '#1a1a1a' : '#999' }}>
                                    {fechaFin ? formatFecha(fechaFin) : 'Seleccionar fecha fin'}
                                </Text>
                                <MaterialIcons name="date-range" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {showDatePicker && (
                            <DateTimePicker
                                value={fechaInicio || fechaFin || new Date()}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, date) => {
                                    setShowDatePicker(false);
                                    if (date) {
                                        if (pickerMode === 'inicio') {
                                            setFechaInicio(date);
                                        } else {
                                            setFechaFin(date);
                                        }
                                    }
                                }}
                                maximumDate={new Date()}
                            />
                        )}

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

                    {pagos.length > 0 && (
                        <BotonRojo
                            titulo={descargandoPDF ? "Generando PDF..." : "📄 Descargar PDF del historial"}
                            onPress={descargarPDFHistorial}
                            loading={descargandoPDF}
                            disabled={descargandoPDF}
                            style={styles.botonPDF}
                        />
                    )}

                    {cargando ? (
                        <ActivityIndicator color="#e60000" size="large" style={{ marginTop: 40 }} />
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
    safeArea: { 
        flex: 1, 
        backgroundColor: '#fff' 
    },
    container: { 
        flex: 1 
    },
    content: { 
        paddingHorizontal: 16, 
        paddingBottom: 30 
    },
    filtrosCard: {
        backgroundColor: '#fafafa',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    filtroItem: { 
        marginBottom: 10 
    },
    filtroLabel: { 
        fontSize: 12, 
        fontWeight: '600', 
        color: '#555', 
        marginBottom: 4 
    },
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
    botonesRow: { 
        flexDirection: 'row', 
        gap: 8, 
        marginTop: 4 
    },
    botonFiltrar: {
        flex: 1,
        backgroundColor: '#e60000',
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
    textoBoton: { 
        color: '#fff', 
        fontWeight: 'bold' 
    },
    textoBotonLimpiar: { 
        color: '#666',
        fontWeight: 'bold' 
    },
    botonPDF: {
        marginBottom: 16,
        paddingVertical: 12,
    },
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
    nombreUsuario: { 
        fontSize: 15, 
        fontWeight: 'bold', 
        color: '#1a1a1a' 
    },
    badge: {
        paddingHorizontal: 10, 
        paddingVertical: 3, 
        borderRadius: 20 
    },
    badgeTexto: { 
        fontSize: 12, 
        fontWeight: '600' 
    },
    separador: { 
        height: 1, 
        backgroundColor: '#f0f0f0', 
        marginBottom: 10 
    },
    fila: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingVertical: 4 
    },
    filaLabel: { 
        fontSize: 13, 
        color: '#666' 
    },
    filaValor: { 
        fontSize: 13, 
        fontWeight: '600', 
        color: '#1a1a1a' 
    },
    textoVacio: { 
        color: '#999', 
        textAlign: 'center', 
        marginTop: 40 
    },
});

export default HistorialPagos;