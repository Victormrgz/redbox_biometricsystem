import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const Suscripciones = () => {
    return (
    <View style={styles.container}> 
        <Text>Suscripciones</Text>         
        <StatusBar style="auto" />
    </View>

    ); }     

export default Suscripciones;

    const styles = StyleSheet.create({  
    container: {
        flex: 1,
        backgroundColor: '#fff',        
        alignItems: 'center',
        justifyContent: 'center',
    },
});