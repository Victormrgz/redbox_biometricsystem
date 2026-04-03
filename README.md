<img width="1129" height="358" alt="image" src="https://github.com/user-attachments/assets/58c5e3b1-2262-4937-a4d9-8f29f082ce82" /># 🏋️‍♂️ RedBox CrossFit App
## 📂 Estructura del Proyecto

Para mantener el código escalable y organizado, el proyecto utiliza una arquitectura **basada en módulos y funcionalidades** dentro del directorio principal `src/`.

```text
src/
├── assets/             # Recursos estáticos (Logos de RedBox, Iconos, Imágenes)
├── components/         # Componentes reutilizables (Botones, Inputs, Cards de Pago)
├── navigation/         # Lógica de navegación (Menu hamburguesa, Stacks de Admin y Usuario)
├── screens/            # Vistas de la app ( capturas de pantalla del diseño a hacer )
│   ├── auth/           # Pantallas de Login y Registro
│   ├── user/           # Dashboard del atleta, Perfil y Reservas
│   ├── training/       # Creación y visualización de WODs/Planificaciones
│   └── admin/          # Panel de gestión (Roles, Pagos, Invitaciones)
├── styles/             # Configuración global de temas (Colores RedBox, Tipografías)
└── utils/              # Funciones de ayuda (Cálculo de IMC, Formateo de moneda)```

Instalacion de React Navigator para menu hamburguesa:

1) Ir al siguiente link: https://reactnavigation.org/docs/drawer-navigator

