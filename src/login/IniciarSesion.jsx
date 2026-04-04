import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const IniciarSesion = () => {
    return (
    <View style={styles.container}> 
        <Text>IniciarSesion</Text>         
        <StatusBar style="auto" />
    </View>

    ); }     

export default IniciarSesion;

    const styles = StyleSheet.create({  
    container: {
        flex: 1,
        backgroundColor: '#fff',        
        alignItems: 'center',
        justifyContent: 'center',
    },
});