<template>
  <div class="busqueda-container">

    <!-- Navbar -->
    <nav class="busqueda-nav">
      <h1>🚌 BusExpress</h1>
      <div class="nav-links">
        <template v-if="usuario?.rol === 'admin'">
          <NuxtLink to="/rutas">Rutas</NuxtLink>
          <NuxtLink to="/pasajes">Pasajes</NuxtLink>
        </template>
        <NuxtLink to="/principal">Inicio</NuxtLink>
        <button @click="cerrarSesion">Cerrar sesión</button>
      </div>
    </nav>

    <div class="busqueda-main">

      <!-- Encabezado -->
      <div class="busqueda-header">
        <h2>🛣️ Buscar Rutas</h2>
        <p>Filtra por origen, destino y fecha para encontrar tu viaje ideal</p>
      </div>

      <!-- Filtros -->
      <div class="filtros-card">
        <h3>Filtros de búsqueda</h3>
        <div class="filtros-grid">
          <div class="filtro-field">
            <label>Origen</label>
            <input v-model="filtros.origen" type="text" placeholder="Ej: Santiago" @keyup.enter="buscar" />
          </div>
          <div class="filtro-field">
            <label>Destino</label>
            <input v-model="filtros.destino" type="text" placeholder="Ej: Valparaíso" @keyup.enter="buscar" />
          </div>
          <div class="filtro-field">
            <label>Fecha</label>
            <input v-model="filtros.fecha" type="date" @keyup.enter="buscar" />
          </div>
          <button class="btn-buscar" :disabled="cargando" @click="buscar">
            {{ cargando ? 'Buscando...' : '🔍 Buscar' }}
          </button>
        </div>
        <button v-if="hayFiltros" class="btn-limpiar" @click="limpiar">Limpiar filtros</button>
      </div>

      <!-- Estados -->
      <div v-if="estado === 'inicial'" class="estado-wrapper">
        <div class="estado-icono">🗺️</div>
        <h3>¿A dónde quieres viajar?</h3>
        <p>Ingresa origen, destino o fecha para buscar rutas disponibles</p>
      </div>

      <div v-else-if="estado === 'cargando'" class="estado-wrapper">
        <div class="estado-icono">⏳</div>
        <h3>Buscando rutas...</h3>
      </div>

      <div v-else-if="estado === 'error'" class="estado-wrapper estado-error">
        <div class="estado-icono">⚠️</div>
        <h3>Ocurrió un error</h3>
        <p>{{ mensajeError }}</p>
      </div>

      <div v-else-if="estado === 'vacio'" class="estado-wrapper">
        <div class="estado-icono">🔎</div>
        <h3>Sin resultados</h3>
        <p>No hay rutas que coincidan con tu búsqueda. Intenta con otros datos.</p>
      </div>

      <!-- Resultados -->
      <div v-else-if="estado === 'resultados'">
        <div class="resultados-header">
          <span class="resultados-titulo">Rutas encontradas</span>
          <span class="badge-resultados">
            {{ rutasFiltradas.length }} resultado{{ rutasFiltradas.length !== 1 ? 's' : '' }}
          </span>
        </div>

        <div class="rutas-grid">
          <div v-for="ruta in rutasFiltradas" :key="ruta.id" class="ruta-card">

            <div class="ruta-ruta">
              <span class="ruta-lugar">{{ ruta.origen }}</span>
              <span class="ruta-flecha">→</span>
              <span class="ruta-lugar">{{ ruta.destino }}</span>
            </div>

            <!-- Parada intermedia (si existe) -->
            <div v-if="ruta.parada" class="ruta-parada">
              🚏 Parada: {{ ruta.parada }}
            </div>

            <div v-if="misReservas[ruta.id]">
              <span class="badge-reserva">✓ Tienes el asiento {{ misReservas[ruta.id].asiento }}</span>
            </div>

            <div class="ruta-info">
              <div class="info-item">
                <span class="info-label">Fecha</span>
                <span class="info-valor">{{ formatearFecha(ruta.fecha) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Hora</span>
                <span class="info-valor">{{ formatearHora(ruta.fecha) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Capacidad</span>
                <span class="info-valor">{{ ruta.capacidad }} asientos</span>
              </div>
              <div class="info-item">
                <span class="info-label">Precio</span>
                <span class="info-valor">${{ Number(ruta.precio).toLocaleString('es-CL') }}</span>
              </div>
            </div>

            <div class="ruta-footer">
              <div class="ruta-precio">
                ${{ Number(ruta.precio).toLocaleString('es-CL') }}
                <span>CLP</span>
              </div>
            </div>

            <div class="card-acciones">
              <button
                v-if="!misReservas[ruta.id]"
                class="btn-reservar"
                :disabled="rutaPasada(ruta.fecha)"
                @click="abrirModalReserva(ruta)"
              >
                {{ rutaPasada(ruta.fecha) ? 'Ruta finalizada' : 'Reservar pasaje' }}
              </button>

              <button
                v-else
                class="btn-cancelar-reserva"
                :disabled="rutaPasada(ruta.fecha)"
                @click="abrirModalCancelacion(ruta)"
              >
                {{ rutaPasada(ruta.fecha) ? 'No cancelable' : 'Cancelar reserva' }}
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>

    <!-- ===================== MODAL RESERVA ===================== -->
    <div v-if="modalReserva" class="modal-overlay" @click.self="cerrarModalReserva">
      <div class="modal">
        <button class="modal-close" @click="cerrarModalReserva">✕</button>
        <h3>✈ Reservar Viaje</h3>

        <p style="margin: 0 0 1rem; color: #6b7280; font-size: 0.9rem;">
          <strong style="color: #0d47a1;">{{ rutaSeleccionada?.origen }}</strong>
          → <strong style="color: #0d47a1;">{{ rutaSeleccionada?.destino }}</strong>
          &nbsp;·&nbsp; {{ formatearFecha(rutaSeleccionada?.fecha) }}, {{ formatearHora(rutaSeleccionada?.fecha) }}
          <br v-if="rutaSeleccionada?.parada" />
          <span v-if="rutaSeleccionada?.parada">🚏 Parada: {{ rutaSeleccionada.parada }}</span>
        </p>

        <div v-if="exitoReserva" class="alert alert--success">
          ✓ Pasaje reservado correctamente. Asiento {{ asientoConfirmado }}.
        </div>
        <div v-if="errorReserva" class="alert alert--error">{{ errorReserva }}</div>

        <template v-if="!exitoReserva">
          <div class="field">
            <label>Nombre *</label>
            <input v-model="formReserva.nombre" type="text" placeholder="Tu nombre" />
          </div>

          <div class="field">
            <label>Apellido <span class="opcional">(opcional)</span></label>
            <input v-model="formReserva.apellido" type="text" placeholder="Tu apellido" />
          </div>

          <div class="field">
            <label>
              Asiento *
              <span v-if="cargandoAsientos" class="cargando-asientos">Cargando...</span>
              <span v-else class="disponibles-badge">{{ asientosDisponibles }} disponibles</span>
            </label>

            <div v-if="!cargandoAsientos" class="asientos-grid">
              <button
                v-for="n in rutaSeleccionada?.capacidad"
                :key="n"
                type="button"
                class="asiento"
                :class="{
                  'asiento--ocupado':      asientosOcupados.includes(n) && n !== miAsientoEnRuta,
                  'asiento--mio':          n === miAsientoEnRuta,
                  'asiento--seleccionado': formReserva.asiento === n,
                }"
                :disabled="asientosOcupados.includes(n)"
                @click="formReserva.asiento = n"
              >
                {{ n }}
              </button>
            </div>

            <div class="leyenda">
              <div class="leyenda-item">
                <div class="leyenda-color leyenda-color--disponible"></div> Disponible
              </div>
              <div class="leyenda-item">
                <div class="leyenda-color leyenda-color--ocupado"></div> Ocupado
              </div>
              <div class="leyenda-item">
                <div class="leyenda-color leyenda-color--seleccionado"></div> Seleccionado
              </div>
              <div v-if="miAsientoEnRuta" class="leyenda-item">
                <div class="leyenda-color leyenda-color--mio"></div> Tu asiento
              </div>
            </div>

            <p v-if="formReserva.asiento" class="asiento-seleccionado-txt">
              Asiento seleccionado: <strong>{{ formReserva.asiento }}</strong>
            </p>
          </div>

          <div class="modal-actions">
            <button class="btn btn--secondary" @click="cerrarModalReserva">Cancelar</button>
            <button
              class="btn btn--primary"
              :disabled="enviandoReserva || !formReserva.asiento || !formReserva.nombre"
              @click="confirmarReserva"
            >
              {{ enviandoReserva ? 'Reservando...' : 'Confirmar reserva' }}
            </button>
          </div>
        </template>

        <div v-else class="modal-actions">
          <button class="btn btn--secondary" @click="cerrarModalReserva">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- ===================== MODAL CANCELACIÓN ===================== -->
    <div v-if="modalCancelacion" class="modal-overlay" @click.self="cerrarModalCancelacion">
      <div class="modal">
        <button class="modal-close" @click="cerrarModalCancelacion">✕</button>
        <h3>🚫 Cancelar Reserva</h3>

        <p style="margin: 0 0 1rem; color: #6b7280; font-size: 0.9rem;">
          <strong style="color: #0d47a1;">{{ rutaSeleccionada?.origen }}</strong>
          → <strong style="color: #0d47a1;">{{ rutaSeleccionada?.destino }}</strong>
          &nbsp;·&nbsp; {{ formatearFecha(rutaSeleccionada?.fecha) }}, {{ formatearHora(rutaSeleccionada?.fecha) }}
        </p>

        <div v-if="exitoCancelacion" class="alert alert--success">
          ✓ Reserva cancelada. Se te devolverá
          <strong>${{ devolucionMonto.toLocaleString('es-CL') }} CLP</strong>.
        </div>

        <template v-else>
          <div v-if="cancelacion.bloqueada" class="alert alert--error">
            ⛔ No es posible cancelar: el bus ya salió o está a punto de hacerlo.
          </div>

          <template v-else>
            <div class="cancelacion-resumen">
              <div class="cancelacion-fila">
                <span>Asiento reservado</span>
                <strong>#{{ misReservas[rutaSeleccionada?.id]?.asiento }}</strong>
              </div>
              <div class="cancelacion-fila">
                <span>Precio del pasaje</span>
                <span>${{ Number(rutaSeleccionada?.precio).toLocaleString('es-CL') }} CLP</span>
              </div>
              <div class="cancelacion-fila">
                <span>Política de devolución</span>
                <span :class="['politica-badge', `politica-badge--${cancelacion.badgeColor}`]">
                  {{ cancelacion.politica }}
                </span>
              </div>
              <div class="cancelacion-fila">
                <span>Porcentaje a devolver</span>
                <span>{{ cancelacion.porcentaje }}%</span>
              </div>
              <div class="cancelacion-fila total">
                <span>Devolución estimada</span>
                <span class="monto-devolucion">
                  ${{ cancelacion.montoDevolucion.toLocaleString('es-CL') }} CLP
                </span>
              </div>
            </div>

            <div v-if="cancelacion.porcentaje < 100" class="alert alert--warning">
              ⚠️ {{ cancelacion.advertencia }}
            </div>

            <div v-if="errorCancelacion" class="alert alert--error">{{ errorCancelacion }}</div>

            <div class="modal-actions">
              <button class="btn btn--secondary" @click="cerrarModalCancelacion">Volver</button>
              <button
                class="btn btn--danger"
                :disabled="enviandoCancelacion"
                @click="confirmarCancelacion"
              >
                {{ enviandoCancelacion ? 'Cancelando...' : 'Confirmar cancelación' }}
              </button>
            </div>
          </template>

          <div v-if="cancelacion.bloqueada" class="modal-actions">
            <button class="btn btn--secondary" @click="cerrarModalCancelacion">Cerrar</button>
          </div>
        </template>
      </div>
    </div>

  </div>
</template>

<script setup>
import '~/assets/busquedarutas.css'

definePageMeta({ middleware: 'auth' })

const API     = '/api'
const router  = useRouter()
const token   = useCookie('auth_token')
const headers = computed(() => ({ Authorization: `Bearer ${token.value}` }))
const usuario = ref(null)

// Cargar usuario para mostrar links de admin
onMounted(async () => {
  try {
    const data = await $fetch(`${API}/auth/me`, { headers: headers.value })
    usuario.value = data.data
  } catch {
    router.push('/login')
  }
})

// ── FILTROS ───────────────────────────────────────────────────────────────────

const filtros    = reactive({ origen: '', destino: '', fecha: '' })
const hayFiltros = computed(() =>
  filtros.origen.trim() || filtros.destino.trim() || filtros.fecha
)

// ── ESTADO ────────────────────────────────────────────────────────────────────

const estado        = ref('inicial')
const mensajeError  = ref('')
const cargando      = ref(false)
const todasLasRutas = ref([])

const rutasFiltradas = computed(() => {
  let resultado = todasLasRutas.value
  const origen  = filtros.origen.trim().toLowerCase()
  const destino = filtros.destino.trim().toLowerCase()
  const fecha   = filtros.fecha

  if (origen)  resultado = resultado.filter(r => r.origen?.toLowerCase().includes(origen))
  if (destino) resultado = resultado.filter(r => r.destino?.toLowerCase().includes(destino))
  if (fecha)   resultado = resultado.filter(r => r.fecha?.startsWith(fecha))

  return resultado
})

// ── MIS RESERVAS ──────────────────────────────────────────────────────────────

const misReservas = ref({})

const cargarMisReservas = async (rutas) => {
  if (!rutas.length) return
  try {
    const pasajes = await $fetch(`${API}/pasajes`, { headers: headers.value })
    const mapa = {}
    for (const p of (Array.isArray(pasajes) ? pasajes : pasajes.data ?? [])) {
      mapa[p.rutaId] = p
    }
    misReservas.value = mapa
  } catch {}
}

// ── BUSCAR ────────────────────────────────────────────────────────────────────

const buscar = async () => {
  if (!hayFiltros.value) return
  cargando.value     = true
  estado.value       = 'cargando'
  mensajeError.value = ''

  try {
    const data = await $fetch(`${API}/rutas`, { headers: headers.value })
    todasLasRutas.value = Array.isArray(data) ? data : (data.data ?? [])
    await cargarMisReservas(todasLasRutas.value)
    estado.value = rutasFiltradas.value.length > 0 ? 'resultados' : 'vacio'
  } catch (err) {
    mensajeError.value = err?.data?.message || 'No se pudo conectar con el servidor.'
    estado.value = 'error'
  } finally {
    cargando.value = false
  }
}

const limpiar = () => {
  filtros.origen      = ''
  filtros.destino     = ''
  filtros.fecha       = ''
  todasLasRutas.value = []
  misReservas.value   = {}
  estado.value        = 'inicial'
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

const formatearFecha = (f) => f
  ? new Date(f).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
  : '—'

const formatearHora = (f) => f
  ? new Date(f).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
  : '—'

const rutaPasada = (fecha) => fecha ? new Date(fecha) < new Date() : false

// ── POLÍTICA DE DEVOLUCIÓN ────────────────────────────────────────────────────

const calcularDevolucion = (fechaRuta, precio) => {
  const diffHoras = (new Date(fechaRuta) - new Date()) / (1000 * 60 * 60)

  if (diffHoras <= 0 || diffHoras < 2) {
    return { bloqueada: true, porcentaje: 0, politica: 'Sin devolución', advertencia: '', badgeColor: 'rojo', montoDevolucion: 0 }
  }

  let porcentaje, politica, advertencia, badgeColor

  if (diffHoras >= 48) {
    porcentaje = 100; politica = 'Devolución total'; advertencia = ''; badgeColor = 'verde'
  } else if (diffHoras >= 24) {
    porcentaje = 75; politica = 'Devolución parcial 75%'; advertencia = 'Cancelas con menos de 48 h de antelación; se retiene el 25%.'; badgeColor = 'verde'
  } else if (diffHoras >= 6) {
    porcentaje = 50; politica = 'Devolución parcial 50%'; advertencia = 'Cancelas con menos de 24 h de antelación; se retiene el 50%.'; badgeColor = 'amarillo'
  } else {
    porcentaje = 20; politica = 'Devolución mínima 20%'; advertencia = 'Cancelas con menos de 6 h de antelación; se retiene el 80%.'; badgeColor = 'rojo'
  }

  return { bloqueada: false, porcentaje, politica, advertencia, badgeColor, montoDevolucion: Math.round(precio * porcentaje / 100) }
}

// ── MODAL RESERVA ─────────────────────────────────────────────────────────────

const modalReserva      = ref(false)
const rutaSeleccionada  = ref(null)
const formReserva       = reactive({ nombre: '', apellido: '', asiento: null })
const asientosOcupados  = ref([])
const miAsientoEnRuta   = ref(null)
const cargandoAsientos  = ref(false)
const enviandoReserva   = ref(false)
const exitoReserva      = ref(false)
const errorReserva      = ref('')
const asientoConfirmado = ref(null)

const asientosDisponibles = computed(() =>
  (rutaSeleccionada.value?.capacidad ?? 0) - asientosOcupados.value.length
)

const abrirModalReserva = async (ruta) => {
  rutaSeleccionada.value = ruta
  formReserva.nombre     = ''
  formReserva.apellido   = ''
  formReserva.asiento    = null
  exitoReserva.value     = false
  errorReserva.value     = ''
  modalReserva.value     = true

  cargandoAsientos.value = true
  try {
    const data = await $fetch(`${API}/pasajes/ruta/${ruta.id}/asientos`, { headers: headers.value })
    asientosOcupados.value = data.ocupados ?? []
    miAsientoEnRuta.value  = data.miAsiento ?? null
  } catch {
    errorReserva.value = 'No se pudieron cargar los asientos.'
  } finally {
    cargandoAsientos.value = false
  }
}

const cerrarModalReserva = () => {
  modalReserva.value     = false
  rutaSeleccionada.value = null
}

const confirmarReserva = async () => {
  if (!formReserva.nombre || !formReserva.asiento) return
  enviandoReserva.value = true
  errorReserva.value    = ''
  try {
    await $fetch(`${API}/pasajes`, {
      method: 'POST',
      headers: headers.value,
      body: {
        nombre:   formReserva.nombre,
        apellido: formReserva.apellido || null,
        rutaId:   rutaSeleccionada.value.id,
        asiento:  formReserva.asiento,
      },
    })
    asientoConfirmado.value = formReserva.asiento
    exitoReserva.value      = true
    await cargarMisReservas(todasLasRutas.value)
  } catch (err) {
    errorReserva.value = err?.data?.message ?? 'Error al crear el pasaje.'
  } finally {
    enviandoReserva.value = false
  }
}

// ── MODAL CANCELACIÓN ─────────────────────────────────────────────────────────

const modalCancelacion    = ref(false)
const enviandoCancelacion = ref(false)
const exitoCancelacion    = ref(false)
const errorCancelacion    = ref('')
const devolucionMonto     = ref(0)
const cancelacion         = ref({ bloqueada: false, porcentaje: 0, politica: '', advertencia: '', badgeColor: 'verde', montoDevolucion: 0 })

const abrirModalCancelacion = (ruta) => {
  rutaSeleccionada.value    = ruta
  exitoCancelacion.value    = false
  errorCancelacion.value    = ''
  enviandoCancelacion.value = false
  cancelacion.value         = calcularDevolucion(ruta.fecha, ruta.precio)
  modalCancelacion.value    = true
}

const cerrarModalCancelacion = () => {
  modalCancelacion.value = false
  rutaSeleccionada.value = null
}

const confirmarCancelacion = async () => {
  const pasaje = misReservas.value[rutaSeleccionada.value.id]
  if (!pasaje) return
  enviandoCancelacion.value = true
  errorCancelacion.value    = ''
  try {
    await $fetch(`${API}/pasajes/${pasaje.id}`, { method: 'DELETE', headers: headers.value })
    devolucionMonto.value  = cancelacion.value.montoDevolucion
    exitoCancelacion.value = true
    const nuevas = { ...misReservas.value }
    delete nuevas[rutaSeleccionada.value.id]
    misReservas.value = nuevas
  } catch (err) {
    errorCancelacion.value = err?.data?.message ?? 'No se pudo cancelar la reserva.'
  } finally {
    enviandoCancelacion.value = false
  }
}

// ── SESIÓN ────────────────────────────────────────────────────────────────────

const cerrarSesion = () => {
  token.value = null
  router.push('/login')
}
</script>