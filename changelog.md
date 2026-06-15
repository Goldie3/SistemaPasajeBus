# Changelog

## [Sin versionar] - 2026-06-14

### Corregido (CB - Corrección de Backend)

**Configuración de CORS con origen hardcodeado a `localhost`**

- **Qué cambió:**
  - En `src/app.js`, la configuración de `cors` tenía `origin: 'http://localhost:3000'`
    fijo, lo cual bloqueaba cualquier petición proveniente del frontend desplegado
    en producción.
  - Se reemplazó por una función de validación de origen con una lista
    `allowedOrigins` que incluye tanto `http://localhost:3000` (desarrollo) como
    `https://proactive-amazement-production-c6df.up.railway.app` (frontend en
    producción).

- **Por qué:**
  El navegador bloqueaba las peticiones desde el frontend en producción con un
  error de CORS, lo que se manifestaba como `Failed to fetch` / `<no response>`
  al intentar registrarse o iniciar sesión.

- **Impacto:**
  - Las peticiones desde el dominio de producción del frontend ahora son
    aceptadas por el backend.
  - Cualquier origen no incluido en `allowedOrigins` sigue siendo rechazado.

---

**Prefijo de rutas `/api` agregado al backend**

- **Qué cambió:**
  - `src/app.js` montaba todas las rutas en la raíz (`app.use('/', routes)`),
    por lo que los endpoints reales eran `/auth/...`, `/rutas/...`, `/pasajes/...`
    (sin `/api`).
  - Se cambió a `app.use('/api', routes)` para que coincida con lo que el
    frontend espera llamar a través del proxy de Nuxt (`/api/**`).

- **Por qué:**
  El frontend hacía peticiones a `/api/auth/register`, pero el backend solo
  respondía en `/auth/register`, lo que generaba `404 Page not found`.

- **Impacto:**
  - Todas las rutas del backend ahora son accesibles bajo el prefijo `/api`
    (`/api/auth/register`, `/api/rutas`, `/api/pasajes`, etc.), consistente
    con el proxy configurado en el frontend.

---

**Variables de entorno de base de datos apuntando a valores de ejemplo**

- **Qué cambió:**
  - Las variables `DATABASE_URL`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`,
    `DB_NAME`, `DB_PORT` en Railway estaban configuradas con valores literales
    de ejemplo (`localhost`, `usuario`, `password`, etc.) en lugar de apuntar
    a la base de datos MySQL real provisionada por Railway.
  - `src/models/index.js` inicializa Sequelize directamente con
    `process.env.DATABASE_URL`, por lo que ese valor de ejemplo causaba un
    `SequelizeConnectionRefusedError (ECONNREFUSED)` al intentar conectar.
  - Se actualizó `DATABASE_URL` en Railway para referenciar la variable real
    generada por el servicio MySQL: `DATABASE_URL="${{MySQL.MYSQL_URL}}"`.
  - También se corrigió `FRONTEND_URL` para incluir el esquema `https://` y
    se cambió `NODE_ENV` de `development` a `production`.

- **Por qué:**
  El backend no lograba conectarse a la base de datos, lo que provocaba que
  el proceso se quedara colgado antes de llegar a `app.listen()` (sin logs de
  "Servidor corriendo...") o, una vez resuelto el arranque, fallara con
  `ECONNREFUSED` al intentar cualquier consulta (por ejemplo, en
  `authController.register` al buscar un usuario existente).

- **Impacto:**
  - El backend ahora arranca correctamente y se conecta a la base de datos
    MySQL provisionada por Railway.
  - El registro, login y demás endpoints que dependen de la base de datos
    funcionan correctamente.

---

### Corregido (CF - Corrección de Frontend)

**Proxy de Nuxt apuntando a `localhost` en producción**

- **Qué cambió:**
  - En `nuxt.config.ts`, la `routeRule` `/api/**` tenía un `proxy` hardcodeado
    a `http://localhost:4000/**`, válido solo en entorno local.
  - Se actualizó para construir la URL del proxy dinámicamente a partir de
    `process.env.NUXT_PUBLIC_API_URL`, con `localhost:4000` como fallback
    para desarrollo:
    ```ts
    routeRules: {
      '/api/**': {
        proxy: `${process.env.NUXT_PUBLIC_API_URL || 'http://localhost:4000'}/**`,
      },
    },
    ```
  - También se agregó `runtimeConfig.public.apiUrl` usando la misma variable.

- **Por qué:**
  En producción, `http://localhost:4000` no existe, por lo que cualquier
  petición a `/api/**` desde el frontend devolvía `502 Bad Gateway` (el proxy
  no podía conectarse a ningún destino).

- **Impacto:**
  - En producción, `/api/**` se reenvía correctamente a
    `https://sistemapasajebus-production.up.railway.app/**` (valor de
    `NUXT_PUBLIC_API_URL` configurado en Railway).
  - En desarrollo local, sigue funcionando contra `localhost:4000` sin
    necesidad de configuración adicional.

---

**URLs de backend hardcodeadas a `http://localhost:4000` en vistas**

- **Qué cambió:**
  - `pages/principal.vue` y `pages/busquedarutas.vue` definían
    `const API = 'http://localhost:4000'` y hacían `$fetch` directamente
    contra esa URL (por ejemplo, `${API}/auth/me`, `${API}/rutas`,
    `${API}/pasajes`), saltándose el proxy `/api` de Nuxt.
  - Se cambió a `const API = '/api'` en ambos archivos, de forma que todas
    las llamadas pasen por el proxy configurado en `nuxt.config.ts`.

- **Por qué:**
  Estas llamadas se ejecutan en el navegador del usuario, donde
  `http://localhost:4000` no existe, generando errores
  `net::ERR_CONNECTION_REFUSED` al cargar `/auth/me` (por ejemplo, en la
  pantalla "Principal" y en "Buscar Rutas").

- **Impacto:**
  - Las vistas `principal.vue` y `busquedarutas.vue` ahora obtienen los
    datos del usuario autenticado y de rutas/pasajes correctamente en
    producción, a través de `/api/...`.

---

### Agregado (AV - Agregar Validación)

**Campo `apellido` obligatorio al reservar un pasaje (`busquedarutas.vue`)**

- **Qué cambió:**
  - En el modal "Reservar Viaje" de `pages/busquedarutas.vue`, el campo
    "Apellido" pasó de ser opcional a obligatorio:
    - Se quitó la etiqueta `(opcional)` y se agregó `*` al label.
    - El botón "Confirmar reserva" ahora se deshabilita también si
      `formReserva.apellido` está vacío
      (`:disabled="enviandoReserva || !formReserva.asiento || !formReserva.nombre || !formReserva.apellido"`).
    - `confirmarReserva()` valida `formReserva.apellido` antes de continuar
      y ya no envía `apellido: null` cuando está vacío, sino el valor
      ingresado por el usuario.

- **Por qué:**
  El apellido es un dato relevante para identificar al pasajero en el pasaje
  emitido, por lo que se decidió requerirlo siempre al reservar desde la
  vista pública de búsqueda de rutas.

- **Impacto:**
  - Los usuarios no pueden confirmar una reserva desde "Buscar Rutas" sin
    ingresar un apellido.
  - No afecta pasajes ya creados con `apellido: null`.

---

**Campo `apellido` obligatorio en el CRUD de pasajes (`pasajes.vue`)**

- **Qué cambió:**
  - En `pages/pasajes.vue` (gestión administrativa de pasajes), los campos
    "Nombre", "Apellido", "Ruta" y "Asiento" se marcaron como obligatorios
    (`*` en el label y atributo `required` en el input/select).
  - `guardar()` valida al inicio que `form.nombre`, `form.apellido`,
    `form.rutaId` y `form.asiento` tengan valor antes de continuar; si falta
    alguno, no realiza la petición.
  - El botón "Agregar"/"Actualizar" se deshabilita mientras falten esos
    campos (`:disabled="loading || !form.nombre || !form.apellido || !form.rutaId || !form.asiento"`).
  - Se quitó el `|| null` de `apellido` en el body enviado a
    `POST /api/pasajes` y `PUT /api/pasajes/:id`, enviando siempre el valor
    ingresado.

- **Por qué:**
  Mantener consistencia con la validación agregada en `busquedarutas.vue`:
  todo pasaje creado o editado desde el panel de administración debe incluir
  apellido, nombre, ruta y asiento.

- **Impacto:**
  - El formulario de creación/edición de pasajes no permite guardar sin
    completar nombre, apellido, ruta y asiento.
  - No afecta pasajes ya existentes que tengan `apellido: null`; estos
    seguirán mostrando `—` en la tabla hasta que sean editados.

