import React, { useState, useMemo, lazy, Suspense } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, View } from 'react-native';

//Lazy loading para pantallas que no se usan siempre
const CrearPlanificacion = lazy(() => import("../training/CrearPlanificacion"));
const VerPlanificacion = lazy(() => import("../training/VerPlanificacion"));
const GestionarRoles = lazy(() => import("../admin/GestionarRoles"));
const RegistrarPago = lazy(() => import("../admin/RegistrarPago"));
const HistoricoPagos = lazy(() => import("../admin/HistoricoPagos"));
const Suscripciones = lazy(() => import("../admin/Suscripciones"));
const Invitaciones = lazy(() => import("../admin/Invitaciones"));
const MisAlumnos = lazy(() => import("../entrenador/MisAlumnos"));
const GestionarClases = lazy(() => import("../entrenador/GestionarClases"));
const ResultadosAlumnos = lazy(() => import("../entrenador/ResultadosAlumnos"));
const GestionarHorarioEntrenador = lazy(() => import('../admin/GestionarHorarioEntrenador'));
const VerHorarioEntrenador = lazy(() => import('../entrenador/VerHorarioEntrenador'));
const RecuperarContrasena = lazy(() => import("../login/RecuperarContrasena"));
const CrearCuenta = lazy(() => import("../login/CrearCuenta"));
const IniciarSesion = lazy(() => import("../login/IniciarSesion"));

//Pantallas principales (sin lazy para mejor experiencia en tabs)
import Inicio from "../usuario/Inicio";
import Clases from "../training/Clases";
import MisReservas from "../usuario/MisReservas";
import MisResultados from "../usuario/MisResultados";
import Perfil from "../usuario/Perfil";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

//Componente de carga para lazy loading
const LoadingScreen = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#FF3B30" />
    </View>
);

function MyTabs() {
    return (
        <Tab.Navigator
            initialRouteName="Inicio"
            screenOptions={{
                tabBarActiveTintColor: 'white',
                tabBarInactiveTintColor: '#757575',
                tabBarStyle: { backgroundColor: '#262626' },
                //Evita re-renderizados innecesarios
                lazy: true,
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    //Memoizar el valor de autenticación para evitar re-renderizados
    const authValue = useMemo(() => ({
        isAuthenticated,
        setIsAuthenticated
    }), [isAuthenticated]);

    return (
        <NavigationContainer>
            <Stack.Navigator 
                screenOptions={{ 
                    headerShown: false,
                    detachPreviousScreen: false,
                }}
            >
                {!isAuthenticated ? (
                    <>
                        <Stack.Screen 
                            name="IniciarSesion" 
                            component={IniciarSesion} 
                            initialParams={{ setIsAuthenticated }} 
                        />
                        <Stack.Screen 
                            name="CrearCuenta" 
                            component={CrearCuenta}
                            initialParams={{ setIsAuthenticated }} 
                        />
                        <Stack.Screen 
                            name="RecuperarContrasena" 
                            component={RecuperarContrasena} 
                        />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Main" component={MyTabs} />
                        
                        {/* Pantallas con lazy loading */}
                        <Stack.Screen name="CrearPlanificacion">
                            {() => (
                                <Suspense fallback={<LoadingScreen />}>
                                    <CrearPlanificacion />
                                </Suspense>
                            )}
                        </Stack.Screen>
                        
                        <Stack.Screen name="VerPlanificacion">
                            {() => (
                                <Suspense fallback={<LoadingScreen />}>
                                    <VerPlanificacion />
                                </Suspense>
                            )}
                        </Stack.Screen>
                        
                        <Stack.Screen name="Perfil" component={Perfil} initialParams={{ setIsAuthenticated }} />
                        
                        <Stack.Screen name="GestionarRoles">
                            {() => (
                                <Suspense fallback={<LoadingScreen />}>
                                    <GestionarRoles />
                                </Suspense>
                            )}
                        </Stack.Screen>
                        
                        <Stack.Screen name="RegistrarPago">
                            {() => (
                                <Suspense fallback={<LoadingScreen />}>
                                    <RegistrarPago />
                                </Suspense>
                            )}
                        </Stack.Screen>
                        
                        <Stack.Screen name="HistoricoPagos">
                            {() => (
                                <Suspense fallback={<LoadingScreen />}>
                                    <HistoricoPagos />
                                </Suspense>
                            )}
                        </Stack.Screen>
                        
                        <Stack.Screen name="Suscripciones">
                            {() => (
                                <Suspense fallback={<LoadingScreen />}>
                                    <Suscripciones />
                                </Suspense>
                            )}
                        </Stack.Screen>
                        
                        <Stack.Screen name="MisAlumnos">
                            {() => (
                                <Suspense fallback={<LoadingScreen />}>
                                    <MisAlumnos />
                                </Suspense>
                            )}
                        </Stack.Screen>
                        
                        <Stack.Screen name="GestionarClases">
                            {() => (
                                <Suspense fallback={<LoadingScreen />}>
                                    <GestionarClases />
                                </Suspense>
                            )}
                        </Stack.Screen>
                        
                        <Stack.Screen name="ResultadosAlumnos">
                            {() => (
                                <Suspense fallback={<LoadingScreen />}>
                                    <ResultadosAlumnos />
                                </Suspense>
                            )}
                        </Stack.Screen>
                        
                        <Stack.Screen name="GestionarHorarioEntrenador">
                            {() => (
                                <Suspense fallback={<LoadingScreen />}>
                                    <GestionarHorarioEntrenador />
                                </Suspense>
                            )}
                        </Stack.Screen>
                        
                        <Stack.Screen name="VerHorarioEntrenador">
                            {() => (
                                <Suspense fallback={<LoadingScreen />}>
                                    <VerHorarioEntrenador />
                                </Suspense>
                            )}
                        </Stack.Screen>
                        
                        <Stack.Screen name="Invitaciones">
                            {() => (
                                <Suspense fallback={<LoadingScreen />}>
                                    <Invitaciones />
                                </Suspense>
                            )}
                        </Stack.Screen>
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}