# Sistema de Pasaje de Bus

Sistema web para la gestión de pasajes de bus, que permite administrar rutas, vender/reservar pasajes y gestionar usuarios mediante autenticación con tokens JWT (access + refresh) y recuperación de contraseña por correo.

El proyecto está dividido en dos partes:

- **Backend (API REST)**: ubicado en `src/`, construido con Node.js, Express y Sequelize (MySQL).
- **Frontend**: ubicado en `client/frontend/`, construido con Nuxt 4 (Vue 3).

## Stack tecnológico

- **Lenguaje**: JavaScript / TypeScript
- **Backend**: Node.js, Express 5, Sequelize 6, MySQL (mysql2)
- **Autenticación**: JWT (access token + refresh token), bcrypt para hashing de contraseñas
- **Validación**: express-validator
- **Correo**: Nodemailer (para recuperación de contraseña)
- **Frontend**: Nuxt 4, Vue 3
- **Herramientas**: npm, nodemon, sequelize-cli

## Estructura del proyecto

```
SistemaPasajeBus/
├── src/                    # Backend (API)
│   ├── app.js              # Configuración de la app Express
│   ├── server.js           # Punto de entrada del servidor
│   ├── config/             # Configuración general y de base de datos
│   ├── controllers/         # Lógica de auth, rutas y pasajes
│   ├── middleware/           # Autenticación, validación, manejo de errores
│   ├── migrations/          # Migraciones de Sequelize
│   ├── models/              # Modelos (Usuario, Ruta, Pasaje, Tokens)
│   ├── routes/              # Definición de endpoints
│   └── services/            # Servicios (auth, tokens)
├── client/frontend/         # Frontend (Nuxt)
│   ├── pages/               # Vistas (login, registro, rutas, pasajes, etc.)
│   ├── middleware/           # Middleware de autenticación del frontend
│   └── assets/              # Estilos
├── postman/                  # Colección de Postman para probar la API
├── .env.example               # Ejemplo de variables de entorno
└── package.json
```

## Requisitos previos

- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [npm](https://www.npmjs.com/)
- Servidor de base de datos **MySQL**

## Instalación

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/Goldie3/SistemaPasajeBus.git
   cd SistemaPasajeBus
   ```

2. Instalar las dependencias del backend:

   ```bash
   npm install
   ```

3. Instalar las dependencias del frontend:

   ```bash
   cd client/frontend
   npm install
   cd ../..
   ```

## Configuración de variables de entorno

Copiar el archivo de ejemplo y completarlo con tus propios valores:

```bash
cp .env.example .env
```

Variables principales a configurar (basadas en `.env.example`):

```env
# Servidor
PORT=4000
NODE_ENV=development

# Base de datos
DATABASE_URL=mysql://usuario:password@localhost:3306/nombre_base_datos

DB_USER=usuario
DB_PASSWORD=password
DB_NAME=nombre_base_datos
DB_HOST=localhost
DB_PORT=3306

# JWT
JWT_SECRET=tu_secreto_jwt
JWT_ACCESS_SECRET=tu_access_secret_de_al_menos_32_caracteres
JWT_REFRESH_SECRET=tu_refresh_secret_de_al_menos_32_caracteres

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

#conexion produccion
MYSQL_DATABASE="${{MySQL.MYSQL_DATABASE}}"
MYSQL_PUBLIC_URL="${{MySQL.MYSQL_PUBLIC_URL}}"
MYSQL_ROOT_PASSWORD="${{MySQL.MYSQL_ROOT_PASSWORD}}"
MYSQL_URL="${{MySQL.MYSQL_URL}}"
MYSQLDATABASE="${{MySQL.MYSQLDATABASE}}"
MYSQLHOST="${{MySQL.MYSQLHOST}}"
MYSQLPASSWORD="${{MySQL.MYSQLPASSWORD}}"
MYSQLPORT="${{MySQL.MYSQLPORT}}"
MYSQLUSER="${{MySQL.MYSQLUSER}}"
# Frontend
FRONTEND_URL=http://localhost:3000
```

> Las variables `MYSQL*` que aparecen en `.env.example` corresponden a la configuración de producción (por ejemplo, en Railway) y no son necesarias para el entorno local.

## Configuración de la base de datos

Asegúrate de tener un servidor MySQL corriendo y de haber creado la base de datos indicada en `DB_NAME`. Luego ejecuta las migraciones para crear las tablas:

```bash
npm run db:migrate
```

Otros comandos útiles:

```bash
# Ver el estado de las migraciones
npm run db:status

# Revertir todas las migraciones
npm run db:migrate:undo
```

## Ejecución en desarrollo

### Backend

Desde la raíz del proyecto:

```bash
npm run dev
```

Esto inicia el servidor con `nodemon`, recargando automáticamente ante cambios. Por defecto la API quedará disponible en `http://localhost:<PORT>` (según el valor de `PORT` en `.env`).

Alternativamente, para iniciar sin recarga automática:

```bash
npm start
```

### Frontend

En otra terminal:

```bash
cd client/frontend
npm run dev
```

Esto levantará el servidor de desarrollo de Nuxt, normalmente en `http://localhost:3000`.

## Endpoints principales de la API

Todas las rutas están prefijadas (por ejemplo `/api`, según configuración en `src/app.js`).

### Autenticación (`/auth`)

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| POST | `/auth/register` | Registro de usuario | Público |
| POST | `/auth/login` | Inicio de sesión | Público |
| POST | `/auth/refresh` | Renovar access token | Público |
| POST | `/auth/logout` | Cerrar sesión | Público |
| POST | `/auth/forgot-password` | Solicitar recuperación de contraseña | Público |
| POST | `/auth/reset-password` | Restablecer contraseña | Público |
| GET | `/auth/me` | Obtener perfil propio | Autenticado |
| PATCH | `/auth/me` | Actualizar perfil propio | Autenticado |
| GET | `/auth/usuarios` | Listar usuarios | Admin |
| GET | `/auth/sesiones` | Listar sesiones activas | Admin |
| DELETE | `/auth/sesiones/:id` | Revocar una sesión | Admin |
| DELETE | `/auth/sesiones` | Revocar todas las sesiones | Admin |

### Rutas (`/rutas`)

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| GET | `/rutas` | Listar rutas | Público |
| GET | `/rutas/:id` | Obtener ruta por ID | Público |
| POST | `/rutas` | Crear ruta | Admin |
| PUT | `/rutas/:id` | Actualizar ruta | Admin |
| DELETE | `/rutas/:id` | Eliminar ruta | Admin |

### Pasajes (`/pasajes`)

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| GET | `/pasajes` | Listar pasajes del usuario | Autenticado |
| GET | `/pasajes/admin` | Listar todos los pasajes | Admin |
| GET | `/pasajes/ruta/:rutaId/asientos` | Ver asientos ocupados de una ruta | Autenticado |
| GET | `/pasajes/:id` | Obtener pasaje por ID | Autenticado |
| POST | `/pasajes` | Crear/comprar pasaje | Autenticado |
| PUT | `/pasajes/:id` | Actualizar pasaje | Admin |
| DELETE | `/pasajes/:id` | Eliminar pasaje | Autenticado |

> Existe una colección de Postman incluida en `postman/API Pasaje Bus.postman_collection.json` que se puede importar para probar todos los endpoints fácilmente.

## Probar la API con Postman

1. Abrir Postman.
2. Importar el archivo `postman/API Pasaje Bus.postman_collection.json`.
3. Configurar las variables de entorno de la colección (URL base, tokens, etc.).
4. Ejecutar las solicitudes de ejemplo.

## Licencia

ISC
