<template>
  <div class="busqueda-page">
    <div class="container" style="padding-top: 100px; padding-bottom: 40px;">

      <div class="search-bar-card">
        <form class="search-bar" @submit.prevent="buscar">
          <div class="sb-field">
            <label>Origen</label>
            <input v-model="filtros.origen" type="text" placeholder="Ciudad de origen" />
          </div>
          <div class="sb-field">
            <label>Destino</label>
            <input v-model="filtros.destino" type="text" placeholder="Ciudad de destino" />
          </div>
          <div class="sb-field sb-field--sm">
            <label>Fecha</label>
            <input v-model="filtros.fecha" type="date" />
          </div>
          <button type="submit" class="btn btn--primary" :disabled="cargando">
            {{ cargando ? 'Buscando...' : 'Buscar' }}
          </button>
        </form>
      </div>

      <div v-if="estado === 'inicial'" class="estado-box">
        <div class="estado-icon">🗺️</div>
        <h3>¿A dónde quieres viajar?</h3>
        <p>Ingresa origen, destino o fecha para buscar rutas disponibles</p>
      </div>

      <div v-else-if="estado === 'cargando'" class="estado-box">
        <div class="estado-icon">⏳</div>
        <h3>Buscando rutas...</h3>
      </div>

      <div v-else-if="estado === 'error'" class="estado-box">
        <div class="estado-icon">⚠️</div>
        <h3 style="color:#ef4444;">Ocurrió un error</h3>
        <p>{{ mensajeError }}</p>
      </div>

      <div v-else-if="estado === 'vacio'" class="estado-box">
        <div class="estado-icon">🔎</div>
        <h3>Sin resultados</h3>
        <p>No hay rutas que coincidan con tu búsqueda.</p>
      </div>

      <div v-else-if="estado === 'resultados'">
        <div class="resultados-top">
          <span class="resultados-count">{{ rutasFiltradas.length }} resultado{{ rutasFiltradas.length !== 1 ? 's' : '' }}</span>
          <button v-if="hayFiltros" class="btn btn--secondary" @click="limpiar" style="font-size:12px;padding:6px 14px;">Limpiar filtros</button>
        </div>

        <div class="rutas-list">
          <div v-for="ruta in rutasFiltradas" :key="ruta.id" class="ruta-card-h">
            <div class="ruta-card-body">
              <div class="ruta-route">
                <div class="ruta-points">
                  <div class="ruta-point">
                    <span class="ruta-city">{{ ruta.origen }}</span>
                    <span class="ruta-time">{{ formatearHora(ruta.fecha) }}</span>
                  </div>
                  <div class="ruta-line">
                    <span class="ruta-dot"></span>
                    <span class="ruta-bar"></span>
                    <span class="ruta-dot"></span>
                  </div>
                  <div class="ruta-point ruta-point--end">
                    <span class="ruta-city">{{ ruta.destino }}</span>
                    <span class="ruta-time">—</span>
                  </div>
                </div>
                <div class="ruta-date">{{ formatearFecha(ruta.fecha) }}</div>
              </div>

              <div v-if="ruta.parada" class="ruta-parada-badge">🚏 Parada: {{ ruta.parada }}</div>

              <div class="ruta-meta">
                <span>{{ ruta.capacidad }} asientos</span>
                <span v-if="misReservas[ruta.id]" class="badge-reserva">✓ Tu asiento: {{ misReservas[ruta.id].asiento }}</span>
              </div>
            </div>

            <div class="ruta-card-side">
              <div class="ruta-precio">${{ Number(ruta.precio).toLocaleString('es-CL') }}</div>
              <div class="ruta-precio-label">por persona</div>

              <button
                v-if="!misReservas[ruta.id]"
                class="btn btn--primary btn--block"
                :disabled="rutaPasada(ruta.fecha)"
                @click="abrirModalReserva(ruta)"
              >
                {{ rutaPasada(ruta.fecha) ? 'Finalizada' : 'Reservar' }}
              </button>
              <button
                v-else
                class="btn btn--danger btn--block"
                :disabled="rutaPasada(ruta.fecha)"
                @click="abrirModalCancelacion(ruta)"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL RESERVA -->
    <div v-if="modalReserva" class="modal-overlay" @click.self="cerrarModalReserva">
      <div class="modal">
        <button class="modal-close" @click="cerrarModalReserva">✕</button>
        <h3>Reservar pasaje</h3>
        <p style="margin:4px 0 16px;font-size:13px;color:#9ca3af;">
          {{ rutaSeleccionada?.origen }} → {{ rutaSeleccionada?.destino }}
          · {{ formatearFechaCompleta(rutaSeleccionada?.fecha) }}
        </p>

        <div v-if="exitoReserva" class="alert alert--success">
          ✓ Pasaje reservado. Asiento {{ asientoConfirmado }}.
        </div>
        <div v-if="errorReserva" class="alert alert--error">{{ errorReserva }}</div>

        <template v-if="!exitoReserva">
          <div class="field">
            <label>Nombre</label>
            <input v-model="formReserva.nombre" type="text" placeholder="Tu nombre" />
          </div>
          <div class="field">
            <label>Apellido</label>
            <input v-model="formReserva.apellido" type="text" placeholder="Tu apellido" />
          </div>

          <div class="field">
            <label>
              Asiento
              <span v-if="cargandoAsientos" class="asientos-loading">Cargando...</span>
              <span v-else class="asientos-disp">{{ asientosDisponibles }} disponibles</span>
            </label>

            <div v-if="!cargandoAsientos" class="asientos-grid">
              <button v-for="n in rutaSeleccionada?.capacidad" :key="n" type="button"
                class="asiento"
                :class="{
                  'asiento--ocupado': asientosOcupados.includes(n) && n !== miAsientoEnRuta,
                  'asiento--mio': n === miAsientoEnRuta,
                  'asiento--sel': formReserva.asiento === n,
                }"
                :disabled="asientosOcupados.includes(n)"
                @click="formReserva.asiento = n"
              >{{ n }}</button>
            </div>

            <div class="leyenda">
              <span class="leyenda-item"><span class="leyenda-c leyenda-c--disp"></span> Disponible</span>
              <span class="leyenda-item"><span class="leyenda-c leyenda-c--occ"></span> Ocupado</span>
              <span class="leyenda-item"><span class="leyenda-c leyenda-c--sel"></span> Seleccionado</span>
            </div>

            <p v-if="formReserva.asiento" class="asiento-txt">Asiento <strong>{{ formReserva.asiento }}</strong></p>
          </div>

          <div class="modal-actions">
            <button class="btn btn--secondary" @click="cerrarModalReserva">Cancelar</button>
            <button class="btn btn--primary" :disabled="enviandoReserva || !formReserva.asiento || !formReserva.nombre || !formReserva.apellido" @click="confirmarReserva">
              {{ enviandoReserva ? 'Reservando...' : 'Confirmar' }}
            </button>
          </div>
        </template>

        <div v-else class="modal-actions">
          <button class="btn btn--secondary" @click="cerrarModalReserva">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- MODAL CANCELACIÓN -->
    <div v-if="modalCancelacion" class="modal-overlay" @click.self="cerrarModalCancelacion">
      <div class="modal">
        <button class="modal-close" @click="cerrarModalCancelacion">✕</button>
        <h3>Cancelar reserva</h3>

        <div v-if="exitoCancelacion" class="alert alert--success">
          ✓ Reserva cancelada. Devolución: <strong>${{ devolucionMonto.toLocaleString('es-CL') }} CLP</strong>.
        </div>

        <template v-else>
          <div v-if="cancelacion.bloqueada" class="alert alert--error">
            ⛔ No es posible cancelar: el bus ya salió o está próximo a salir.
          </div>

          <template v-else>
            <div class="cancel-resumen">
              <div class="cancel-row"><span>Asiento</span><strong>#{{ misReservas[rutaSeleccionada?.id]?.asiento }}</strong></div>
              <div class="cancel-row"><span>Precio</span><span>${{ Number(rutaSeleccionada?.precio).toLocaleString('es-CL') }} CLP</span></div>
              <div class="cancel-row"><span>Política</span><span class="pol-badge" :class="`pol-badge--${cancelacion.badgeColor}`">{{ cancelacion.politica }}</span></div>
              <div class="cancel-row"><span>Devolución</span><span>{{ cancelacion.porcentaje }}%</span></div>
              <div class="cancel-row cancel-row--total"><span>Total a devolver</span><span class="monto-dev">${{ cancelacion.montoDevolucion.toLocaleString('es-CL') }} CLP</span></div>
            </div>

            <div v-if="cancelacion.porcentaje < 100" class="alert alert--warning">⚠️ {{ cancelacion.advertencia }}</div>
            <div v-if="errorCancelacion" class="alert alert--error">{{ errorCancelacion }}</div>

            <div class="modal-actions">
              <button class="btn btn--secondary" @click="cerrarModalCancelacion">Volver</button>
              <button class="btn btn--danger" :disabled="enviandoCancelacion" @click="confirmarCancelacion">
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
definePageMeta({ middleware: 'auth' })

const API = '/api'
const router = useRouter()
const token = useCookie('auth_token')
const headers = computed(() => ({ Authorization: `Bearer ${token.value}` }))

const filtros = reactive({ origen: '', destino: '', fecha: '' })
const hayFiltros = computed(() => filtros.origen.trim() || filtros.destino.trim() || filtros.fecha)

const estado = ref('inicial')
const mensajeError = ref('')
const cargando = ref(false)
const todasLasRutas = ref([])

const rutasFiltradas = computed(() => {
  let r = todasLasRutas.value
  const o = filtros.origen.trim().toLowerCase()
  const d = filtros.destino.trim().toLowerCase()
  const f = filtros.fecha
  if (o) r = r.filter(x => x.origen?.toLowerCase().includes(o))
  if (d) r = r.filter(x => x.destino?.toLowerCase().includes(d))
  if (f) r = r.filter(x => x.fecha?.startsWith(f))
  return r
})

const misReservas = ref({})

const cargarMisReservas = async (rutas) => {
  if (!rutas.length) return
  try {
    const p = await $fetch(`${API}/pasajes`, { headers: headers.value })
    const m = {}
    for (const x of (Array.isArray(p) ? p : p.data ?? [])) m[x.rutaId] = x
    misReservas.value = m
  } catch {}
}

const buscar = async () => {
  if (!hayFiltros.value) return
  cargando.value = true; estado.value = 'cargando'; mensajeError.value = ''
  try {
    const data = await $fetch(`${API}/rutas`, { headers: headers.value })
    todasLasRutas.value = Array.isArray(data) ? data : (data.data ?? [])
    await cargarMisReservas(todasLasRutas.value)
    estado.value = rutasFiltradas.value.length > 0 ? 'resultados' : 'vacio'
  } catch (err) {
    mensajeError.value = err?.data?.message || 'No se pudo conectar con el servidor.'
    estado.value = 'error'
  } finally { cargando.value = false }
}

const limpiar = () => {
  filtros.origen = ''; filtros.destino = ''; filtros.fecha = ''
  todasLasRutas.value = []; misReservas.value = {}; estado.value = 'inicial'
}

const formatearFecha = (f) => f ? new Date(f).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'
const formatearHora = (f) => f ? new Date(f).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '—'
const formatearFechaCompleta = (f) => f ? `${formatearFecha(f)}, ${formatearHora(f)}` : '—'
const rutaPasada = (f) => f ? new Date(f) < new Date() : false

const calcularDevolucion = (fechaRuta, precio) => {
  const diffHoras = (new Date(fechaRuta) - new Date()) / (1000 * 60 * 60)
  if (diffHoras <= 0 || diffHoras < 2) return { bloqueada: true, porcentaje: 0, politica: 'Sin devolución', advertencia: '', badgeColor: 'rojo', montoDevolucion: 0 }
  let pct, pol, adv, color
  if (diffHoras >= 48) { pct = 100; pol = 'Devolución total'; adv = ''; color = 'verde' }
  else if (diffHoras >= 24) { pct = 75; pol = 'Devolución parcial 75%'; adv = 'Cancelas con menos de 48 h; se retiene el 25%.'; color = 'verde' }
  else if (diffHoras >= 6) { pct = 50; pol = 'Devolución parcial 50%'; adv = 'Cancelas con menos de 24 h; se retiene el 50%.'; color = 'amarillo' }
  else { pct = 20; pol = 'Devolución mínima 20%'; adv = 'Cancelas con menos de 6 h; se retiene el 80%.'; color = 'rojo' }
  return { bloqueada: false, porcentaje: pct, politica: pol, advertencia: adv, badgeColor: color, montoDevolucion: Math.round(precio * pct / 100) }
}

const modalReserva = ref(false)
const rutaSeleccionada = ref(null)
const formReserva = reactive({ nombre: '', apellido: '', asiento: null })
const asientosOcupados = ref([])
const miAsientoEnRuta = ref(null)
const cargandoAsientos = ref(false)
const enviandoReserva = ref(false)
const exitoReserva = ref(false)
const errorReserva = ref('')
const asientoConfirmado = ref(null)
const asientosDisponibles = computed(() => (rutaSeleccionada.value?.capacidad ?? 0) - asientosOcupados.value.length)

const abrirModalReserva = async (ruta) => {
  rutaSeleccionada.value = ruta
  formReserva.nombre = ''; formReserva.apellido = ''; formReserva.asiento = null
  exitoReserva.value = false; errorReserva.value = ''; modalReserva.value = true
  cargandoAsientos.value = true
  try {
    const data = await $fetch(`${API}/pasajes/ruta/${ruta.id}/asientos`, { headers: headers.value })
    asientosOcupados.value = data.ocupados ?? []
    miAsientoEnRuta.value = data.miAsiento ?? null
  } catch { errorReserva.value = 'No se pudieron cargar los asientos.' }
  finally { cargandoAsientos.value = false }
}

const cerrarModalReserva = () => { modalReserva.value = false; rutaSeleccionada.value = null }

const confirmarReserva = async () => {
  if (!formReserva.nombre || !formReserva.apellido || !formReserva.asiento) return
  enviandoReserva.value = true; errorReserva.value = ''
  try {
    await $fetch(`${API}/pasajes`, {
      method: 'POST', headers: headers.value,
      body: { nombre: formReserva.nombre, apellido: formReserva.apellido, rutaId: rutaSeleccionada.value.id, asiento: formReserva.asiento },
    })
    asientoConfirmado.value = formReserva.asiento; exitoReserva.value = true
    await cargarMisReservas(todasLasRutas.value)
  } catch (err) { errorReserva.value = err?.data?.message ?? 'Error al crear el pasaje.' }
  finally { enviandoReserva.value = false }
}

const modalCancelacion = ref(false)
const enviandoCancelacion = ref(false)
const exitoCancelacion = ref(false)
const errorCancelacion = ref('')
const devolucionMonto = ref(0)
const cancelacion = ref({ bloqueada: false, porcentaje: 0, politica: '', advertencia: '', badgeColor: 'verde', montoDevolucion: 0 })

const abrirModalCancelacion = (ruta) => {
  rutaSeleccionada.value = ruta
  exitoCancelacion.value = false; errorCancelacion.value = ''; enviandoCancelacion.value = false
  cancelacion.value = calcularDevolucion(ruta.fecha, ruta.precio)
  modalCancelacion.value = true
}

const cerrarModalCancelacion = () => { modalCancelacion.value = false; rutaSeleccionada.value = null }

const confirmarCancelacion = async () => {
  const pasaje = misReservas.value[rutaSeleccionada.value.id]
  if (!pasaje) return
  enviandoCancelacion.value = true; errorCancelacion.value = ''
  try {
    await $fetch(`${API}/pasajes/${pasaje.id}`, { method: 'DELETE', headers: headers.value })
    devolucionMonto.value = cancelacion.value.montoDevolucion
    exitoCancelacion.value = true
    const n = { ...misReservas.value }; delete n[rutaSeleccionada.value.id]; misReservas.value = n
  } catch (err) { errorCancelacion.value = err?.data?.message ?? 'No se pudo cancelar la reserva.' }
  finally { enviandoCancelacion.value = false }
}

onMounted(async () => {
  const q = useRoute().query
  if (q.origen) filtros.origen = q.origen
  if (q.destino) filtros.destino = q.destino
  if (q.fecha) filtros.fecha = q.fecha
  if (hayFiltros.value) await buscar()
})
</script>

<style scoped>
.busqueda-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.search-bar-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.search-bar {
  display: flex;
  gap: 12px;
  align-items: end;
}
@media (max-width: 768px) { .search-bar { flex-direction: column; } }

.sb-field { flex: 1; }
.sb-field label {
  display: block; font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.04em;
  color: #374151; margin-bottom: 4px;
}
.sb-field input {
  width: 100%; padding: 10px 12px;
  border: 1.5px solid #d1d5db; border-radius: 8px;
  font-size: 14px; font-family: 'Open Sans', sans-serif;
  color: #1f2937; outline: none; transition: border-color 0.2s;
}
.sb-field input:focus { border-color: #18cfd7; }
.sb-field--sm { flex: 0 0 160px; }
@media (max-width: 768px) { .sb-field--sm { flex: 1; } }

.estado-box {
  text-align: center; padding: 60px 20px;
}
.estado-icon { font-size: 48px; margin-bottom: 16px; }
.estado-box h3 { font-size: 20px; color: #1f2937; margin-bottom: 8px; }
.estado-box p { color: #9ca3af; margin: 0; }

.resultados-top {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
}
.resultados-count {
  background: #e0fafb; color: #18cfd7;
  padding: 4px 14px; border-radius: 999px; font-size: 13px; font-weight: 600;
}

.rutas-list { display: flex; flex-direction: column; gap: 14px; }

.ruta-card-h {
  background: #fff; border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  border: 1px solid #e5e7eb;
  display: flex;
  transition: box-shadow 0.2s;
}
.ruta-card-h:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.1); }

.ruta-card-body { flex: 1; padding: 20px 24px; }
.ruta-card-side {
  width: 200px; padding: 20px 24px;
  border-left: 1px solid #e5e7eb;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px;
}
@media (max-width: 600px) { .ruta-card-h { flex-direction: column; } .ruta-card-side { width: 100%; border-left: none; border-top: 1px solid #e5e7eb; } }

.ruta-route { display: flex; justify-content: space-between; align-items: start; gap: 16px; }

.ruta-points { display: flex; gap: 12px; align-items: center; }
.ruta-point { display: flex; flex-direction: column; gap: 2px; }
.ruta-point--end { align-items: end; text-align: right; }
.ruta-city { font-size: 16px; font-weight: 700; color: #1f2937; }
.ruta-time { font-size: 12px; color: #9ca3af; }

.ruta-line { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.ruta-dot { width: 8px; height: 8px; border-radius: 50%; background: #18cfd7; flex-shrink: 0; }
.ruta-bar { width: 2px; flex: 1; min-height: 24px; background: #d1d5db; }

.ruta-date { font-size: 12px; color: #9ca3af; white-space: nowrap; }

.ruta-parada-badge {
  margin-top: 8px; display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; color: #6b7280; background: #f3f4f6;
  padding: 3px 10px; border-radius: 6px;
}

.ruta-meta { margin-top: 10px; display: flex; gap: 12px; font-size: 12px; color: #9ca3af; align-items: center; }
.badge-reserva { background: #dcfce7; color: #166534; padding: 2px 10px; border-radius: 999px; font-weight: 600; }

.ruta-precio { font-size: 24px; font-weight: 800; color: #18cfd7; }
.ruta-precio-label { font-size: 11px; color: #9ca3af; margin-top: -8px; }

.asientos-grid { display: grid; grid-template-columns: repeat(8,1fr); gap: 6px; margin-top: 8px; }
.asiento { aspect-ratio: 1; border: 1.5px solid #d1d5db; border-radius: 6px; background: #f9fafb; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.12s; color: #374151; padding: 0; }
.asiento:hover:not(:disabled) { background: #dbeafe; border-color: #18cfd7; transform: scale(1.08); }
.asiento--sel { background: #18cfd7 !important; border-color: #14b8c0 !important; color: #fff !important; }
.asiento--ocupado { background: #fee2e2 !important; border-color: #fca5a5 !important; color: #ef4444 !important; cursor: not-allowed; text-decoration: line-through; }
.asiento--mio { background: #dcfce7 !important; border-color: #4ade80 !important; color: #166534 !important; cursor: default; }
.asiento-txt { margin: 8px 0 0; font-size: 13px; color: #374151; }
.asientos-loading { font-weight: 400; color: #9ca3af; font-size: 12px; margin-left: 6px; }
.asientos-disp { font-weight: 400; font-size: 11px; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 999px; margin-left: 6px; }

.leyenda { display: flex; gap: 14px; margin-top: 10px; font-size: 11px; color: #6b7280; flex-wrap: wrap; }
.leyenda-item { display: flex; align-items: center; gap: 4px; }
.leyenda-c { width: 12px; height: 12px; border-radius: 3px; border: 1.5px solid; }
.leyenda-c--disp { background: #f9fafb; border-color: #d1d5db; }
.leyenda-c--occ { background: #fee2e2; border-color: #fca5a5; }
.leyenda-c--sel { background: #18cfd7; border-color: #14b8c0; }

.cancel-resumen { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 18px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px; }
.cancel-row { display: flex; justify-content: space-between; font-size: 13px; color: #374151; }
.cancel-row--total { border-top: 1px solid #e5e7eb; padding-top: 8px; font-weight: 700; font-size: 15px; color: #1f2937; }
.monto-dev { color: #059669; font-weight: 700; }
.pol-badge { display: inline-flex; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
.pol-badge--verde { background: #dcfce7; color: #166534; }
.pol-badge--amarillo { background: #fef3c7; color: #92400e; }
.pol-badge--rojo { background: #fee2e2; color: #991b1b; }
</style>
