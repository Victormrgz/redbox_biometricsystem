import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const CrearPlanificacion = () => {
    return (
    <View style={styles.container}> 
        <Text>CrearPlanificacion</Text>         
        <StatusBar style="auto" />
    </View>

    ); }     

export default CrearPlanificacion;

    const styles = StyleSheet.create({  
    container: {
        flex: 1,
        backgroundColor: '#fff',        
        alignItems: 'center',
        justifyContent: 'center',
    },
});