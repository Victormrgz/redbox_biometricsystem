import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// Importar las vistas de la app
import Inicio from "../usuario/Inicio";
import Clases from "../training/Clases";
import CrearPlanificacion from "../training/CrearPlanificacion";
import VerPlanificacion from "../training/VerPlanificacion";
import MisReservas from "../usuario/MisReservas";
import MisResultados from "../usuario/MisResultados";
import Perfil from "../usuario/Perfil";
import GestionarRoles from "../admin/GestionarRoles";
import RegistrarPago from "../admin/RegistrarPago";
import HistoricoPagos from "../admin/HistoricoPagos";
import Suscripciones from "../admin/Suscripciones";
import CrearCuenta from "../login/CrearCuenta";
import IniciarSesion from "../login/IniciarSesion";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MyTabs() {
    return (
        <Tab.Navigator
            initialRouteName="Inicio"
            screenOptions={{
                tabBarActiveTintColor: 'white',
                tabBarInactiveTintColor: '#757575',
                tabBarStyle: { backgroundColor: '#262626' },
            }}
        >
            <Tab.Screen 
                name="Inicio" 
                component={Inicio} 
                options={{
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name="home" size={24} color={color} />
                    ),
                    headerShown: false,
                }}
            />
            <Tab.Screen 
                name="Clases" 
                component={Clases} 
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="edit-note" size={24} color={color} />
                    ),
                    headerShown: false,
                }}
            />
            <Tab.Screen 
                name="Mis Reservas" 
                component={MisReservas} 
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="event-note" size={24} color={color}/>
                    ),
                    headerShown: false,
                }}
            />
            <Tab.Screen 
                name="Mis Resultados" 
                component={MisResultados} 
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="launch" size={24} color={color} />
                    ),
                    headerShown: false,
                }}
            />
            
            
            
        </Tab.Navigator>
    );
}

export default function AppNavegar() {
    // Aquí puedes manejar el estado de autenticación real
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    <>
                        <Stack.Screen 
                            name="IniciarSesion" 
                            component={IniciarSesion} 
                            initialParams={{ setIsAuthenticated }} 
                        />
                        <Stack.Screen name="CrearCuenta" 
                            component={CrearCuenta}
                            initialParams={{ setIsAuthenticated }} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Main" component={MyTabs} />
                        <Stack.Screen name="CrearPlanificacion" component={CrearPlanificacion} />
                        <Stack.Screen name="VerPlanificacion" component={VerPlanificacion} />
                        <Stack.Screen 
                            name="Perfil" 
                            component={Perfil} 
                            initialParams={{ setIsAuthenticated }} 
                        />
                        <Stack.Screen name="GestionarRoles" component={GestionarRoles} />
                        <Stack.Screen name="RegistrarPago" component={RegistrarPago} />
                        <Stack.Screen name="HistoricoPagos" component={HistoricoPagos} />
                        <Stack.Screen name="Suscripciones" component={Suscripciones} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}