import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

/**Importar las vistas de la app*/

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

const Tab = createBottomTabNavigator();

function MyTabs() {
    return (
            <Tab.Navigator
            initialRouteName="Inicio" /**Al abrir la app es la pantalla que se muestra por defecto */
            screenOptions={{
                tabBarActiveTintColor: 'white', /**Color del icono activo */
                tabBarInactiveTintColor: '#757575', /**Color del icono inactivo */
                tabBarStyle: { backgroundColor: '#262626' }, /**Color de fondo de la barra de navegación */
            }}
            >
                <Tab.Screen 
                    name="Inicio" 
                    component={Inicio} 
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <FontAwesome name="home" size={24} color={color} />
                        ),
                        headerShown: false, /**Oculta el encabezado de cada pantalla */
                    }}

                />
                <Tab.Screen 
                    name="Clases" 
                    component={Clases} 
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialIcons name="edit-note" size={24} color={color} />
                        ),
                        headerShown: false, /**Oculta el encabezado de cada pantalla */
                    }}
                />
                <Tab.Screen 
                    name="Mis Reservas" 
                    component={MisReservas} 
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialIcons name="event-note" size={24} color={color}/>
                        ),
                        headerShown: false, /**Oculta el encabezado de cada pantalla */
                    }}
                />
                <Tab.Screen 
                    name="Mis Resultados" 
                    component={MisResultados} 
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialIcons name="launch" size={24} color={color} />
                        ),
                        headerShown: false, /**Oculta el encabezado de cada pantalla */
                    }}
                />
                <Tab.Screen
                    name="CrearPlanificacion"
                    component={CrearPlanificacion}
                    options={{
                        headerShown: false,
                        tabBarButton: () => null,
                        tabBarLabel: () => null,
                        tabBarIcon: () => null,
                        tabBarItemStyle: { display: 'none' },
                    }}
                />
                <Tab.Screen
                    name="VerPlanificacion"
                    component={VerPlanificacion}
                    options={{
                        headerShown: false,
                        tabBarButton: () => null,
                        tabBarLabel: () => null,
                        tabBarIcon: () => null,
                        tabBarItemStyle: { display: 'none' },
                    }}
                />
                <Tab.Screen
                    name="Perfil"
                    component={Perfil}
                    options={{
                        headerShown: false,
                        tabBarButton: () => null,
                        tabBarLabel: () => null,
                        tabBarIcon: () => null,
                        tabBarItemStyle: { display: 'none' },
                    }}
                />
                <Tab.Screen
                    name="GestionarRoles"
                    component={GestionarRoles}
                    options={{
                        headerShown: false,
                        tabBarButton: () => null,
                        tabBarLabel: () => null,
                        tabBarIcon: () => null,
                        tabBarItemStyle: { display: 'none' },
                    }}
                />
                <Tab.Screen
                    name="RegistrarPago"
                    component={RegistrarPago}
                    options={{
                        headerShown: false,
                        tabBarButton: () => null,
                        tabBarLabel: () => null,
                        tabBarIcon: () => null,
                        tabBarItemStyle: { display: 'none' },
                    }}
                />
                <Tab.Screen
                    name="HistoricoPagos"
                    component={HistoricoPagos}
                    options={{
                        headerShown: false,
                        tabBarButton: () => null,
                        tabBarLabel: () => null,
                        tabBarIcon: () => null,
                        tabBarItemStyle: { display: 'none' },
                    }}
                />
                <Tab.Screen
                    name="Suscripciones"
                    component={Suscripciones}
                    options={{
                        headerShown: false,
                        tabBarButton: () => null,
                        tabBarLabel: () => null,
                        tabBarIcon: () => null,
                        tabBarItemStyle: { display: 'none' },
                    }}
                />
            </Tab.Navigator>
    );
}

export default function AppNavegar() {
    return(
        <NavigationContainer>
            <MyTabs />
        </NavigationContainer>
    )
}