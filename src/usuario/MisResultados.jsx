import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const MisResultados = () => {
    return (
    <View style={styles.container}> 
        <Text>MisResultados</Text>         
        <StatusBar style="auto" />
    </View>

    ); }     

export default MisResultados;

    const styles = StyleSheet.create({  
    container: {
        flex: 1,
        backgroundColor: '#fff',        
        alignItems: 'center',
        justifyContent: 'center',
    },
});