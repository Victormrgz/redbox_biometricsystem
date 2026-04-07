import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import LogoColor from '../../assets/logocolor.svg'; 

const HeaderColor = () => {
    return (
    <View style={styles.header}>
        <LogoColor width={150} height={30} />
    </View>

    ); }     

export default HeaderColor;

    const styles = StyleSheet.create({  
    header: {
        width: '100%',
        flexDirection: 'row', // Para alinear a la izquierda
        justifyContent: 'flex-start', 
        paddingLeft: 15,    // Aquí estaba tu error (ahora es paddingLeft)
        paddingVertical: 10,
        backgroundColor: '#262626', 
    },
});

