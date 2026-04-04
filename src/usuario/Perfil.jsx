import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const Perfil = () => {
    return (
    <View style={styles.container}> 
        <Text>Perfil</Text>         
        <StatusBar style="auto" />
    </View>

    ); }     

export default Perfil;

    const styles = StyleSheet.create({  
    container: {
        flex: 1,
        backgroundColor: '#fff',        
        alignItems: 'center',
        justifyContent: 'center',
    },
});