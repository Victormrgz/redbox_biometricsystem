# 🏋️‍♂️ RedBox CrossFit App
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
└── utils/              # Funciones de ayuda (Cálculo de IMC, Formateo de moneda)
