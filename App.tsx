import React from 'react';
import AppNavegar from './src/navegacion/AppNavegar';
import { AuthProvider } from './src/auth/AuthContext'; 
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
    return (
        <SafeAreaProvider> 
            <AuthProvider>
                <AppNavegar />
            </AuthProvider>
        </SafeAreaProvider>
    );
}