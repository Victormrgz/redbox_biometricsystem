import React from 'react';
// ✅ IMPORTANTE: Todo lo de react-native va en una sola línea
import { StyleSheet, View, Platform, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'; 
import { StatusBar } from 'expo-status-bar';
import HeaderColor from '../componentes/HeaderColor';
import Constants from 'expo-constants';

const Inicio = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}> 
            <HeaderColor /> {/*Logo de la app*/}
            
            {/* Vista Inicio */}
            <View style={styles.content}>
                <Text style={styles.titulo_principal}>Hola, Victor!</Text>
                <Text style={styles.titulo_secundario}>Bienvenido al panel de control</Text>
                <Text style={styles.titulo_secundario}>07/04/2026</Text>

                <View style={styles.IMC}>
                    <Text style={styles.titulo_IMC}>Tu IMC actual: <Text style={styles.numero}>20.23</Text> <Text style={styles.normal}>(Normal)</Text> </Text>
                </View>

                <Text style={styles.titulo_reservas}>Tus últimas reservas</Text>

                <View style={styles.reservas}>
                    <View style={styles.card}>
                        <Text style={styles.titulo_cards}>12/11/2025</Text>
                        <Text style={styles.titulo_cards}>06:00</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.titulo_cards}>07/11/2025</Text>
                        <Text style={styles.titulo_cards}>06:00</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.titulo_cancelar}>Cancelar</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.titulo_cards}>12/11/2025</Text>
                        <Text style={styles.titulo_cards}>06:00</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.titulo_cards}>07/11/2025</Text>
                        <Text style={styles.titulo_cards}>06:00</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.titulo_cancelar}>Cancelar</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.titulo_cards}>12/11/2025</Text>
                        <Text style={styles.titulo_cards}>06:00</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.titulo_cards}>07/11/2025</Text>
                        <Text style={styles.titulo_cards}>06:00</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.titulo_cancelar}>Cancelar</Text>
                    </View>
                </View>

                <View style={styles.containerMenu}>
  {/* Fila 1: Planificación */}
                <View style={styles.row}>
                    <TouchableOpacity style={[styles.button, styles.btnRed]}>
                        <Text style={styles.textWhite}>Crear planificación</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.btnRed]}>
                        <Text style={styles.textWhite}>Ver planificación</Text>
                    </TouchableOpacity>
                </View>

  {/* Fila 2: Perfil y Roles */}
                <View style={styles.row}>
                    <TouchableOpacity style={[styles.button, styles.btnGray]}>
                        <Text style={styles.textWhite}>Editar perfil</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.btnGray]}>
                        <Text style={styles.textWhite}>Gestionar roles</Text>
                    </TouchableOpacity>
                </View>

  {/* Botones de ancho completo */}
                <TouchableOpacity style={styles.buttonFull}>
                    <Text style={styles.textDark}>Registrar pago</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonFull}>
                    <Text style={styles.textDark}>Historial de pagos</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonFull}>
                    <Text style={styles.textDark}>Suscripciones</Text>
                </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff', // O el color de fondo de tu app
        // En Android, SafeAreaView a veces necesita un padding manual
        paddingTop: Constants.statusBarHeight,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        
    },
    content: {
        flex: 1,
        padding: 20,
    },
    titulo_principal: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    titulo_secundario: {
        fontSize: 18,
        color: '#666',
        marginBottom: 5,
    },
    IMC: {
        marginVertical: 20,
        padding: 15,
        backgroundColor: '#D2EBD6',
        borderRadius: 10,
    },
    titulo_IMC: {
        fontSize: 16,
    },
    numero: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    normal: {
        fontSize: 16,
        color: '#2D733C',
    },
    titulo_reservas: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
    },
    reservas: {
        flexDirection: 'row',       // Alinea en fila
        flexWrap: 'wrap',          // Permite que los elementos bajen a la siguiente línea
        justifyContent: 'flex-start', // Alinea al inicio
        padding: 5,
    },  
    card: {
        backgroundColor: '#fff',
        width: '30%', 
        aspectRatio: 1,            
        margin: '1.5%',            
        padding: 5,
        borderRadius: 10,
        justifyContent: 'center',  
        alignItems: 'center',      
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
    },
    titulo_cards: {
        fontSize: 10,             
        textAlign: 'center',
        fontWeight: 'bold',
    },
    titulo_cancelar: {  
        fontSize: 10,             
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#FF4D4D',
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#DDDDDD',
        padding: 10,
        marginTop: -60,
    },
    containerMenu: {
    padding: 15,
    marginTop: -70,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    flex: 0.48, // Para que queden dos por fila con un pequeño espacio
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra suave
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
  },
  buttonFull: {
    backgroundColor: '#fff',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    marginBottom: 10,
  },
  // Colores específicos
  btnRed: {
    backgroundColor: '#e60000', // Rojo vibrante
  },
  btnGray: {
    backgroundColor: '#555e65', // Gris oscuro azulado
  },
  // Textos
  textWhite: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  textDark: {
    color: '#333',
    fontWeight: '500',
    fontSize: 14,
  }
    
});

export default Inicio;