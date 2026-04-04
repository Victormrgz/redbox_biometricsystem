import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const Registrarse = () => {
    return (
    <View style={styles.container}> 
        <Text>Registrarse</Text>         
        <StatusBar style="auto" />
    </View>

    ); }     

export default Registrarse;

    const styles = StyleSheet.create({  
    container: {
        flex: 1,
        backgroundColor: '#fff',        
        alignItems: 'center',
        justifyContent: 'center',
    },
});