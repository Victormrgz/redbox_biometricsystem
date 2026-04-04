import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

/**Importar las vistas de la app*/

import Inicio from "../usuario/Inicio";
import Clases from "../training/Clases";
import MisReservas from "../usuario/MisReservas";
import MisResultados from "../usuario/MisResultados";

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
                    }}

                />
                <Tab.Screen 
                    name="Clases" 
                    component={Clases} 
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialIcons name="edit-note" size={24} color={color} />
                        ),
                    }}
                />
                <Tab.Screen 
                    name="Mis Reservas" 
                    component={MisReservas} 
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialIcons name="event-note" size={24} color={color}/>
                        ),
                    }}
                />
                <Tab.Screen 
                    name="Mis Resultados" 
                    component={MisResultados} 
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialIcons name="launch" size={24} color={color} />
                        ),
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