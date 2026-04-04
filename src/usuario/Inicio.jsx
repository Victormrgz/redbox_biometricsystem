import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const Inicio = () => {
    return (
    <View style={styles.container}> 
        <Text>Inicio</Text>         
        <StatusBar style="auto" />
    </View>

    ); }     

export default Inicio;

    const styles = StyleSheet.create({  
    container: {
        flex: 1,
        backgroundColor: '#fff',        
        alignItems: 'center',
        justifyContent: 'center',
    },
});