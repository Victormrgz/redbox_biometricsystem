import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import BotonRojo from '../componentes/BotonRojo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Perfil = ({ route }) => {
    // Usamos el encadenamiento opcional ?. para evitar el ReferenceError
    const setIsAuthenticated = route.params?.setIsAuthenticated;

    const handleCerrarSesion = async () => { 
        // Verificamos si la función llegó antes de usarla
        if (!setIsAuthenticated) {
            console.error("ERROR: setIsAuthenticated es undefined en Perfil");
            // Plan B para que puedas seguir probando:
            await AsyncStorage.clear();
            console.log("Storage limpiado, pero debes reiniciar la app manualmente.");
            return;
        }

        try {
            await AsyncStorage.clear(); 
            console.log("Sesión cerrada correctamente");
            setIsAuthenticated(false); // Esto activará el cambio de pantalla
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <View style={styles.container}> 
            <BotonRojo titulo="CERRAR SESIÓN" onPress={handleCerrarSesion} />       
            <StatusBar style="auto" />
        </View>
    );
};

export default Perfil;

    const styles = StyleSheet.create({  
    container: {
        flex: 1,
        backgroundColor: '#fff',        
        alignItems: 'center',
        justifyContent: 'center',
    },
});