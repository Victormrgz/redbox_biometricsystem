import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const RegistrarPago = () => {
    return (
    <View style={styles.container}> 
        <Text>RegistrarPago</Text>         
        <StatusBar style="auto" />
    </View>

    ); }     

export default RegistrarPago;

    const styles = StyleSheet.create({  
    container: {
        flex: 1,
        backgroundColor: '#fff',        
        alignItems: 'center',
        justifyContent: 'center',
    },
});