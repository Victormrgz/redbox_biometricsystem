import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const Clases = () => {
    return (
    <View style={styles.container}> 
        <Text>Clases</Text>         
        <StatusBar style="auto" />
    </View>

    ); }     

export default Clases;

    const styles = StyleSheet.create({  
    container: {
        flex: 1,
        backgroundColor: '#fff',        
        alignItems: 'center',
        justifyContent: 'center',
    },
});