import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const VerPlanificacion = () => {
    return (
    <View style={styles.container}> 
        <Text>VerPlanificacion</Text>         
        <StatusBar style="auto" />
    </View>

    ); }     

export default VerPlanificacion;

    const styles = StyleSheet.create({  
    container: {
        flex: 1,
        backgroundColor: '#fff',        
        alignItems: 'center',
        justifyContent: 'center',
    },
});