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

## 📂 Para actualizar la rama main con los cambios en nuestra rama:

1) Cambiarnos a la rama maina git checkout main
2) Trer lo ultimo que haya en la main: git pull origin main
3) Fusionar nuestra rama con la main: git merge tu-rama
4) Si al fusioanr sale un editor de vim dentro de la consola de git con algo abajo que dice INSERT presionamos la tecla ESC y el mensaje --INSERT-- dejara de salir
   despues ponemos en la consola :wq y el merge se hara
5) Para subir los cambios a la main: git push origin main
6) Ejecutar git checkout -tu rama para cambiarnos a nuestra rama y no trabajar en la main

## 📂 Instalacion de React Navigation para navegacion de la app:

1) Ir al siguiente link: https://reactnavigation.org/docs/drawer-navigator/?config=dynamic#drawertype donde sale toda la documentacion
2) Abrir la terminal en VsCode y ejecutar el siguiente comando: npm install @react-navigation/drawer
3) Despues de ejecutar el comando anterior ejecutar el siguiente comando: npx expo install react-native-gesture-handler react-native-reanimated react-native-worklets
4) Despues ejecutar el siguiente comando  @react-navigation/bottom-tabs
5) Libreria para usar iconos en el menu de navegacion: https://icons.expo.fyi/Index

Anexo video tutorial: https://www.youtube.com/watch?v=PmILHVEWZUY&t=259s

## 📂 Usar SVG en react native:

https://www.youtube.com/watch?v=NogJOfpIWsk&t=209s
npm install -D react-native-svg-transformer




