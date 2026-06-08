import React, { useState, useEffect, useContext } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    TouchableOpacity, 
    ScrollView, 
    TextInput, 
    Alert, 
    ActivityIndicator,
    Modal,
    FlatList
} from 'react-native'; 
import HeaderColor from '../componentes/HeaderColor';
import Constants from 'expo-constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import TituloPrincipal from '../componentes/TituloPrincipal';
import TituloSecundario from '../componentes/TituloSecundario';
import TituloTerciario from '../componentes/TituloTerciario';
import BotonRojo from '../componentes/BotonRojo';
import CardRecordsPersonales from '../componentes/CardRecordsPersonales';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { redBoxApi } from '../api/conexion';
import { AuthContext } from '../auth/AuthContext';

const MisResultados = () => {
    const insets = useSafeAreaInsets();
    const { usuario } = useContext(AuthContext);
    const [showDate, setShowDate] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [cargandoRecords, setCargandoRecords] = useState(false);
    const [movimientos, setMovimientos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [unidadModalVisible, setUnidadModalVisible] = useState(false);
    const [mejoresResultados, setMejoresResultados] = useState([]);
    
    const [formData, setFormData] = useState({
        id_movimiento: '',
        nombre_movimiento: '',
        fecha_evaluacion: new Date(),
        rondas: '',
        repeticiones: '',
        peso: '',
        unidad: 'kg',
        comentarios: ''
    });

    // Cargar movimientos al iniciar
    useEffect(() => {
        cargarMovimientos();
    }, []);

    // Cargar mejores resultados cuando se selecciona un movimiento
    useEffect(() => {
        if (formData.id_movimiento && usuario?.id_usuario) {
            cargarMejoresResultados();
        }
    }, [formData.id_movimiento]);

    const cargarMovimientos = async () => {
        try {
            setCargando(true);
            console.log("Consultando movimientos...");
            const response = await redBoxApi.get('/movimientos/');
            console.log("Respuesta completa:", response);
            console.log("Movimientos recibidos:", response.data);
            console.log("Cantidad de movimientos:", response.data.length);
            setMovimientos(response.data);
        } catch (error) {
            console.error('Error cargando movimientos:', error);
            console.error('Detalles del error:', error.response);
            Alert.alert('Error', 'No se pudieron cargar los movimientos');
        } finally {
            setCargando(false);
        }
    };

    const cargarMejoresResultados = async () => {
        try {
            setCargandoRecords(true);
            const token = await AsyncStorage.getItem('userToken');  // ← Agregar token
            console.log("Consultando mejores resultados...");
            
            const response = await redBoxApi.get(
                `/mejores_resultados/${usuario.id_usuario}/${formData.id_movimiento}/`,
                {
                    headers: { Authorization: `Token ${token}` }  // ← Agregar headers
                }
            );
            
            console.log("Mejores resultados:", response.data);
            setMejoresResultados(response.data);
        } catch (error) {
            console.error('Error cargando mejores resultados:', error);
        } finally {
            setCargandoRecords(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const seleccionarMovimiento = (movimiento) => {
        setFormData({
            ...formData,
            id_movimiento: movimiento.id_movimiento,
            nombre_movimiento: movimiento.nombre_movimiento
        });
        setModalVisible(false);
    };

    const seleccionarUnidad = (unidad) => {
        setFormData({ ...formData, unidad: unidad });
        setUnidadModalVisible(false);
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDate(false);
        if (selectedDate) {
            setFormData({ ...formData, fecha_evaluacion: selectedDate });
        }
    };

    // Función para validar fecha
    const validarFecha = (fecha) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
        
        if (fecha > hoy) {
            Alert.alert('Error', 'La fecha no puede ser mayor al día actual');
            return false;
        }
        return true;
    };

    const validarFormulario = () => {
        if (!formData.id_movimiento) {
            Alert.alert('Error', 'Selecciona un movimiento');
            return false;
        }
        if (!formData.rondas || parseInt(formData.rondas) <= 0) {
            Alert.alert('Error', 'Ingresa un número válido de rondas');
            return false;
        }
        if (!formData.repeticiones || parseInt(formData.repeticiones) <= 0) {
            Alert.alert('Error', 'Ingresa un número válido de repeticiones');
            return false;
        }
        if (!formData.peso || parseFloat(formData.peso) <= 0) {
            Alert.alert('Error', 'Ingresa un peso válido');
            return false;
        }
        // Validar fecha
        if (!validarFecha(formData.fecha_evaluacion)) {
            return false;
        }
        return true;
    };

    const guardarResultado = async () => {
        if (!validarFormulario()) return;

        try {
            setCargando(true);
            const token = await AsyncStorage.getItem('userToken');
            
            const fechaFormateada = formData.fecha_evaluacion.toISOString().split('T')[0];
            
            const datosEnviar = {
                id_usuario: usuario.id_usuario,
                id_movimiento: formData.id_movimiento,
                fecha_evaluacion: fechaFormateada,
                rondas: parseInt(formData.rondas),
                repeticiones: parseInt(formData.repeticiones),
                peso: parseFloat(formData.peso),
                unidad: formData.unidad,
                comentarios_resultado: formData.comentarios || ''
            };

            await redBoxApi.post('/resultados/', datosEnviar, {
                headers: { Authorization: `Token ${token}` }
            });

            Alert.alert('Éxito', 'Resultado guardado correctamente');
            
            // Limpiar formulario
            setFormData({
                ...formData,
                rondas: '',
                repeticiones: '',
                peso: '',
                comentarios: ''
            });
            
            // Recargar mejores resultados
            if (formData.id_movimiento) {
                cargarMejoresResultados();
            }
        } catch (error) {
            console.error('Error al guardar:', error);
            Alert.alert('Error', 'No se pudo guardar el resultado');
        } finally {
            setCargando(false);
        }
    };

    // Formatear fecha para mostrar
    const formatFecha = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('es-ES');
    };

    // Preparar datos para CardRecordsPersonales
    const recordsParaCard = mejoresResultados.map(resultado => ({
        movimiento: resultado.nombre_movimiento || formData.nombre_movimiento,
        peso: `${resultado.peso}${resultado.unidad}`,
        fecha: new Date(resultado.fecha_evaluacion).toLocaleDateString('es-ES'),
        rondas: resultado.rondas,
        repeticiones: resultado.repeticiones
    }));

    return (
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
            <ScrollView style={styles.container}> 
                <HeaderColor />

                <View style={styles.content}>
                    <TituloPrincipal titulo="Mis Resultados" />
                    <TituloSecundario titulo="Registra tus levantamientos y consulta tus records personales." />

                    <View style={styles.contenedor_grid}>
                        {/* Movimiento */}
                        <View style={styles.grid_item}>
                            <TituloTerciario titulo="Movimiento:" />
                            <TouchableOpacity 
                                style={styles.dropdownBuscar} 
                                onPress={() => setModalVisible(true)}
                            >
                                <Text style={formData.nombre_movimiento ? styles.textValue : styles.textPlaceholder}>
                                    {formData.nombre_movimiento || 'Seleccionar movimiento'}
                                </Text>
                                <MaterialIcons name="keyboard-arrow-down" size={24} color="gray" style={styles.flecha} />
                            </TouchableOpacity>
                        </View>

                        {/* Fecha */}
                        <View style={styles.grid_item}>
                            <TituloTerciario titulo="Fecha:" />
                            <TouchableOpacity onPress={() => setShowDate(true)} style={styles.boton_fecha}>
                                <Text style={styles.textValue}>
                                    {formatFecha(formData.fecha_evaluacion)}
                                </Text>
                                <MaterialIcons name="date-range" size={24} color="black" />
                            </TouchableOpacity>
                            {showDate && (
                                <DateTimePicker
                                    value={formData.fecha_evaluacion}
                                    mode="date" 
                                    display='default'
                                    onChange={handleDateChange}
                                />
                            )}
                        </View>

                        {/* Rondas */}
                        <View style={styles.grid_item}>
                            <TituloTerciario titulo="Rondas:" />
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={formData.rondas.toString()}
                                onChangeText={(text) => handleInputChange('rondas', text)}
                                placeholder="Ej: 4"
                            />
                        </View>

                        {/* Repeticiones */}
                        <View style={styles.grid_item}>
                            <TituloTerciario titulo="Repeticiones:" />
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={formData.repeticiones.toString()}
                                onChangeText={(text) => handleInputChange('repeticiones', text)}
                                placeholder="Ej: 12"
                            />
                        </View>

                        {/* Peso */}
                        <View style={styles.grid_item}>
                            <TituloTerciario titulo="Peso:" />
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={formData.peso.toString()}
                                onChangeText={(text) => handleInputChange('peso', text)}
                                placeholder="Ej: 20"
                            />
                        </View>

                        {/* Unidad */}
                        <View style={styles.grid_item}>
                            <TituloTerciario titulo="Unidad:" />
                            <TouchableOpacity 
                                style={styles.dropdownBuscar} 
                                onPress={() => setUnidadModalVisible(true)}
                            >
                                <Text style={styles.textValue}>{formData.unidad}</Text>
                                <MaterialIcons name="keyboard-arrow-down" size={24} color="gray" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Comentarios (opcional) */}
                    <View style={styles.comentariosContainer}>
                        <TituloTerciario titulo="Comentarios (opcional):" />
                        <TextInput
                            style={styles.comentariosInput}
                            multiline
                            numberOfLines={3}
                            value={formData.comentarios}
                            onChangeText={(text) => handleInputChange('comentarios', text)}
                            placeholder="Agrega comentarios sobre tu levantamiento..."
                        />
                    </View>

                    <BotonRojo 
                        titulo="Guardar Resultados" 
                        onPress={guardarResultado}
                        style={styles.botonMargen}
                        loading={cargando}
                        disabled={cargando}
                    />

                    <TituloTerciario titulo="Tus records personales:" />
                    
                    {cargandoRecords ? (
                        <ActivityIndicator color="#FF3B30" style={styles.loader} />
                    ) : mejoresResultados.length > 0 ? (
                        <CardRecordsPersonales data={recordsParaCard} />
                    ) : (
                        <Text style={styles.sinRecords}>
                            No hay registros aún. ¡Registra tu primer levantamiento!
                        </Text>
                    )}
                </View>
            </ScrollView>

            {/* Modal para seleccionar movimiento */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccionar Movimiento</Text>
                        <FlatList
                            data={movimientos}
                            keyExtractor={(item) => item.id_movimiento.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => seleccionarMovimiento(item)}
                                >
                                    <Text style={styles.modalItemText}>{item.nombre_movimiento}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <BotonRojo titulo="Cerrar" onPress={() => setModalVisible(false)} style={styles.botonGrid} />
                    </View>
                </View>
            </Modal>

            {/* Modal para seleccionar unidad */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={unidadModalVisible}
                onRequestClose={() => setUnidadModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccionar Unidad</Text>
                        <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => seleccionarUnidad('kg')}
                        >
                            <Text style={styles.modalItemText}>Kilogramos (kg)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => seleccionarUnidad('lb')}
                        >
                            <Text style={styles.modalItemText}>Libras (lb)</Text>
                        </TouchableOpacity>
                        <BotonRojo titulo="Cerrar" onPress={() => setUnidadModalVisible(false)} style={styles.botonGrid} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff', 
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    contenedor_grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    grid_item: {
        width: '48%',
        padding: 10,    
    },
    dropdownBuscar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 45,
        backgroundColor: '#fff',
    },
    flecha: {
        marginLeft: -10,
    },
    input: {
        height: 45,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    boton_fecha: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 10,
        paddingHorizontal: 10,
        borderWidth: 1,
        gap: 5,
        width: '100%',
        borderColor: '#ccc',
        height: 45,
        backgroundColor: '#fff',
    },
    textValue: {
        fontSize: 14,
        color: '#000',
    },
    textPlaceholder: {
        fontSize: 14,
        color: '#999',
    },
    botonMargen: {
        marginTop: 20,
        marginBottom: 20,
        width: '100%',
    },
    comentariosContainer: {
        marginTop: 10,
        paddingHorizontal: 10,
    },
    comentariosInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#fff',
        textAlignVertical: 'top',
        minHeight: 80,
    },
    loader: {
        marginTop: 20,
    },
    sinRecords: {
        textAlign: 'center',
        marginTop: 20,
        color: '#999',
        fontSize: 14,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '80%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalItemText: {
        fontSize: 16,
        color: '#333',
    },
    modalCloseButton: {
        marginTop: 15,
        paddingVertical: 12,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalCloseText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MisResultados;