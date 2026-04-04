import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const MisReservas = () => {
    return (
    <View style={styles.container}> 
        <Text>MisReservas</Text>         
        <StatusBar style="auto" />
    </View>

    ); }     

export default MisReservas;

    const styles = StyleSheet.create({  
    container: {
        flex: 1,
        backgroundColor: '#fff',        
        alignItems: 'center',
        justifyContent: 'center',
    },
});