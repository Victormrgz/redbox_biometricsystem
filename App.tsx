import React from 'react';
import AppNavegar from './src/navegacion/AppNavegar';
import { AuthProvider } from './src/auth/AuthContext'; 

export default function App() {
    return (
        <AuthProvider>
            <AppNavegar />
        </AuthProvider>
    );
}