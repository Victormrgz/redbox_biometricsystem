import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const HistoricoDePagos = () => {
    return (
    <View style={styles.container}> 
        <Text>HistoricoDePagos</Text>         
        <StatusBar style="auto" />
    </View>

    ); }     

export default HistoricoDePagos;

    const styles = StyleSheet.create({  
    container: {
        flex: 1,
        backgroundColor: '#fff',        
        alignItems: 'center',
        justifyContent: 'center',
    },
});