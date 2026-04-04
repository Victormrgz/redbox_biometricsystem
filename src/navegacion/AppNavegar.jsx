import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";

/**Importar las vistas de la app*/

import Inicio from "../usuario/Inicio";
import Perfil from "../usuario/Perfil";
import MisReservas from "../usuario/MisReservas";
import CrearPlanificacion from "../training/CrearPlanificacion";

const Tab = createBottomTabNavigator();

function MyTabs() {
    return (
            <Tab.Navigator>
                <Tab.Screen name="Inicio" component={Inicio} />
                <Tab.Screen name="Perfil" component={Perfil} />
                <Tab.Screen name="Mis Reservas" component={MisReservas} />
                <Tab.Screen name="Crear Planificacion" component={CrearPlanificacion} />
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