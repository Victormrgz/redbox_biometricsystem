import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const Invitaciones = () => {
    return (
    <View style={styles.container}> 
        <Text>Invitaciones</Text>         
        <StatusBar style="auto" />
    </View>

    ); }     

export default Invitaciones;

    const styles = StyleSheet.create({  
    container: {
        flex: 1,
        backgroundColor: '#fff',        
        alignItems: 'center',
        justifyContent: 'center',
    },
});