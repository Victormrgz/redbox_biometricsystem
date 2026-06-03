import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import HeaderColor from '../componentes/HeaderColor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GestionarClases= () => {

    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
            <HeaderColor />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, color: '#333' }}>Gestionar Clases</Text>
            </View>
        </View>
        
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff', 
    },
});

export default GestionarClases;