# Sistema de Pasaje de Bus

## Descripción

Este proyecto es una aplicación para la gestión de pasajes de bus, incluyendo la reserva de asientos, el control de rutas y la administración de usuarios.

## Stack

- Lenguaje: JavaScript / TypeScript (según implementación)
- Framework: Node.js
- Base de datos: MySQL / SQLite / MongoDB (según configuración)
- Herramientas: npm, Express

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone <https://github.com/Goldie3/SistemaPasajeBus.git>
   ```
2. Entrar al directorio del proyecto:
   ```bash
   cd SistemaPasajeBus
   ```
3. Instalar dependencias:
   ```bash
   npm install
   ```

## Variables

Configurar las variables de entorno en un archivo `.env` o según el método de configuración del proyecto. Ejemplos:

```env
DATABASE_URL=mysql://root:CONTRASEÑA@localhost:3306/sistemapasajebus
JWT_SECRET=CAMBIAR_por_un_secreto_largo_y_aleatorio
PORT=3000
NODE_ENV=development
```

## Ejecución local

Ejecutar la aplicación en modo local:

```bash
npm start
```

O, si se usa nodemon:

```bash
npm run dev
```
