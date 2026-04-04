# 🏋️‍♂️ RedBox CrossFit App

![Status](https://img.shields.io/badge/Status-En%20Desarrollo-orange)
![React Native](https://img.shields.io/badge/Framework-React%20Native-blue)

Sistema de gestión integral para centros de entrenamiento CrossFit. Esta aplicación permite la administración de atletas, control de pagos, planificación de entrenamientos y gestión de roles.

## 📂 Estructura del Proyecto y comandos a utilizar

Para mantener el código escalable y organizado, el proyecto utiliza una arquitectura **basada en módulos y funcionalidades** dentro del directorio principal `src/`.

```text
src/
├── assets/             # Recursos estáticos (Logos de RedBox, Iconos, Imágenes)
├── components/         # Componentes reutilizables (Botones, Inputs, Cards de Pago)
├── navigation/         # Lógica de navegación (Drawer, Stacks de Admin y Usuario)
├── screens/            # Vistas principales divididas por dominio:
│   ├── auth/           # Pantallas de Login y Registro
│   ├── user/           # Dashboard del atleta, Perfil y Reservas
│   ├── training/       # Creación y visualización de WODs/Planificaciones
│   └── admin/          # Panel de gestión (Roles, Pagos, Invitaciones)
├── styles/             # Configuración global de temas (Colores RedBox, Tipografías)
└── utils/              # Funciones de ayuda (Cálculo de IMC, Formateo de moneda)```##

## 📂 Instalacion de React Navigation para navegacion de la app:

1) Ir al siguiente link: https://reactnavigation.org/docs/drawer-navigator/?config=dynamic#drawertype donde sale toda la documentacion
2) Abrir la terminal en VsCode y ejecutar el siguiente comando: npm install @react-navigation/drawer
3) Despues de ejecutar el comando anterior ejecutar el siguiente comando: npx expo install react-native-gesture-handler react-native-reanimated react-native-worklets
4) Despues ejecutar el siguiente comando  @react-navigation/bottom-tabs

## 📂 Usar SVG en react native:

1) Abrir la terminal de VsCode y ejecutar el siguiente comando: npx expo install react-native-svg
