# Changelog

## [Sin versionar] - 2026-06-14

### Agregado (AV - Agregar Validación)

**Validación de `precio` y `capacidad` en el modelo `Ruta`**

- **Qué cambió:**
  - `Ruta.precio` ahora debe ser mayor o igual a 0.
  - `Ruta.capacidad` ahora debe ser mayor o igual a 1.
  - Se agregó la migración `20260614000001-add-validation-ruta-precio-capacidad.js`,
    que añade `CHECK` constraints a nivel de base de datos
    (`chk_rutas_precio_no_negativo`, `chk_rutas_capacidad_minima`).
  - Se agregaron las mismas validaciones en `src/models/ruta.js` mediante
    `validate: { min: ... }` de Sequelize.

- **Por qué:**
  Antes de este cambio, la base de datos permitía crear rutas con
  `precio` negativo o `capacidad = 0`, lo cual no tiene sentido en el
  dominio del sistema: un pasaje no puede costar un monto negativo, y
  un bus no puede tener cero asientos disponibles. Esto podía generar
  inconsistencias en el cálculo de devoluciones (`busquedarutas.vue`)
  y en el mapa de asientos (`getAsientosOcupados`), por ejemplo
  divisiones o porcentajes sobre valores inválidos.

- **Impacto:**
  - Cualquier intento de `POST /rutas` o `PUT /rutas/:id` con
    `precio < 0` o `capacidad < 1` ahora es rechazado:
    - A nivel de aplicación, Sequelize lanza un `ValidationError`,
      que el `errorHandler` convierte en `422 VALIDATION_ERROR`.
    - A nivel de base de datos, si el dato llegara a insertarse por
      fuera de Sequelize, el `CHECK` constraint lo rechaza con error
      de MySQL.
  - No afecta datos existentes que ya cumplan la regla (precio ≥ 0,
    capacidad ≥ 1). Si existieran filas inválidas previas, la
    migración fallará al crear el `CHECK` constraint y deben
    corregirse manualmente antes de aplicarla.

- **Migración:**
  ```bash
  npm run db:migrate       # aplicar
  npm run db:migrate:undo  # revertir (elimina los CHECK constraints)
  ```