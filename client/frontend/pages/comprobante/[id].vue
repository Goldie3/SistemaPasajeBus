<template>
  <div class="comprobante-page">
    <div class="container comp-container">
      <NuxtLink to="/principal" class="volver-link">← Volver al inicio</NuxtLink>

      <!-- Cargando -->
      <div v-if="cargando" class="estado-box">
        <div class="estado-icon">⏳</div>
        <h3>Cargando comprobante...</h3>
      </div>

      <!-- Error -->
      <div v-else-if="errorMsg" class="estado-box">
        <div class="estado-icon">⚠️</div>
        <h3 style="color:#ef4444;">No se pudo cargar el comprobante</h3>
        <p>{{ errorMsg }}</p>
        <NuxtLink to="/principal" class="btn btn--primary" style="margin-top:16px;">Volver al inicio</NuxtLink>
      </div>

      <!-- Comprobante -->
      <div v-else-if="pasaje" class="comp-card" id="comprobante-imprimir">

        <!-- Encabezado -->
        <div class="comp-header">
          <div class="comp-logo-wrap">
            <span class="comp-logo">🚌</span>
          </div>
          <div class="comp-header-info">
            <h2>Comprobante de Pasaje</h2>
            <p class="comp-codigo">Código de reserva: <strong>#{{ String(pasaje.id).padStart(6, '0') }}</strong></p>
          </div>
          <div class="comp-status-badge">
            <span>✓ Confirmado</span>
          </div>
        </div>

        <div class="comp-divider comp-divider--dashed"></div>

        <!-- Ruta -->
        <div class="comp-ruta">
          <div class="comp-ciudad">
            <span class="comp-ciudad-label">Origen</span>
            <span class="comp-ciudad-nombre">{{ pasaje.ruta.origen }}</span>
            <span class="comp-ciudad-hora">{{ formatearHora(pasaje.ruta.fecha) }}</span>
          </div>

          <div class="comp-ruta-linea">
            <span class="comp-ruta-dot"></span>
            <span class="comp-ruta-bar"></span>
            <svg class="comp-bus-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="11" rx="2"/><path d="M7 18v2M17 18v2M2 12h20M7 7V4h10v3"/>
            </svg>
            <span class="comp-ruta-bar"></span>
            <span class="comp-ruta-dot"></span>
          </div>

          <div class="comp-ciudad comp-ciudad--end">
            <span class="comp-ciudad-label">Destino</span>
            <span class="comp-ciudad-nombre">{{ pasaje.ruta.destino }}</span>
            <span class="comp-ciudad-hora">—</span>
          </div>
        </div>

        <div class="comp-divider"></div>

        <!-- Detalle del pasaje -->
        <div class="comp-detalles">
          <div class="comp-fila">
            <span class="comp-fila-label">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Pasajero
            </span>
            <strong>{{ pasaje.nombre }} {{ pasaje.apellido ?? '' }}</strong>
          </div>

          <div class="comp-fila">
            <span class="comp-fila-label">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Fecha de viaje
            </span>
            <strong>{{ formatearFechaCompleta(pasaje.ruta.fecha) }}</strong>
          </div>

          <div class="comp-fila">
            <span class="comp-fila-label">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Origen → Destino
            </span>
            <strong>{{ pasaje.ruta.origen }} → {{ pasaje.ruta.destino }}</strong>
          </div>

          <div class="comp-fila">
            <span class="comp-fila-label">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              Número de asiento
            </span>
            <span class="comp-asiento-badge">Asiento {{ pasaje.asiento }}</span>
          </div>

          <div class="comp-divider"></div>

          <div class="comp-fila comp-fila--precio">
            <span class="comp-fila-label" style="font-size:15px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Precio pagado
            </span>
            <span class="comp-precio">${{ Number(pasaje.ruta.precio).toLocaleString('es-CL') }} <span style="font-size:14px;font-weight:500;">CLP</span></span>
          </div>
        </div>

        <div class="comp-divider comp-divider--dashed"></div>

        <!-- Pie -->
        <div class="comp-footer">
          <p>Presenta este comprobante al conductor al momento de abordar el bus.</p>
        </div>

        <!-- Acciones (ocultas al imprimir) -->
        <div class="comp-actions no-print">
          <button class="btn btn--secondary" @click="imprimir">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Imprimir
          </button>
          <NuxtLink to="/busquedarutas" class="btn btn--primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Buscar otro viaje
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth', layout: 'auth' })

const route = useRoute()
const token = useCookie('auth_token')
const headers = computed(() => ({ Authorization: `Bearer ${token.value}` }))

const pasaje = ref(null)
const cargando = ref(true)
const errorMsg = ref('')

const formatearFecha = (f) =>
  f ? new Date(f).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'

const formatearHora = (f) =>
  f ? new Date(f).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '—'

const formatearFechaCompleta = (f) =>
  f ? `${formatearFecha(f)}, ${formatearHora(f)}` : '—'

const imprimir = () => window.print()

onMounted(async () => {
  const id = route.params.id
  try {
    const data = await $fetch(`/api/pasajes/${id}`, { headers: headers.value })
    pasaje.value = data
  } catch (err) {
    errorMsg.value = err?.data?.message ?? 'No se encontró el pasaje o no tienes permiso para verlo.'
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.comprobante-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.comp-container {
  padding-top: 24px;
  padding-bottom: 40px;
  max-width: 640px;
}

/* ─── Card principal ─── */
.comp-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-top: 20px;
}

/* ─── Header ─── */
.comp-header {
  background: linear-gradient(135deg, #18cfd7 0%, #0ea5b0 100%);
  padding: 24px 28px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: #fff;
}

.comp-logo-wrap {
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
}

.comp-header-info {
  flex: 1;
}

.comp-header-info h2 {
  color: #fff;
  font-size: 20px;
  margin-bottom: 2px;
}

.comp-codigo {
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  margin: 0;
}

.comp-status-badge {
  background: rgba(255, 255, 255, 0.2);
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  color: #fff;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

/* ─── Ruta ─── */
.comp-ruta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  gap: 12px;
}

.comp-ciudad {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.comp-ciudad--end {
  align-items: flex-end;
  text-align: right;
}

.comp-ciudad-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9ca3af;
}

.comp-ciudad-nombre {
  font-family: 'Dosis', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #1f2937;
}

.comp-ciudad-hora {
  font-size: 14px;
  color: #18cfd7;
  font-weight: 600;
}

.comp-ruta-linea {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.comp-ruta-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #18cfd7;
  flex-shrink: 0;
}

.comp-ruta-bar {
  width: 2px;
  height: 18px;
  background: #d1d5db;
}

.comp-bus-icon {
  color: #18cfd7;
}

/* ─── Divisores ─── */
.comp-divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 0 28px;
}

.comp-divider--dashed {
  border-top-style: dashed;
  border-color: #d1d5db;
}

/* ─── Detalle ─── */
.comp-detalles {
  padding: 20px 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.comp-fila {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #374151;
}

.comp-fila-label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #6b7280;
  font-size: 13px;
}

.comp-fila-label svg {
  color: #9ca3af;
  flex-shrink: 0;
}

.comp-fila strong {
  color: #1f2937;
  font-size: 14px;
}

.comp-asiento-badge {
  background: #e0fafb;
  color: #18cfd7;
  font-weight: 700;
  font-size: 15px;
  padding: 4px 16px;
  border-radius: 8px;
  border: 1.5px solid #18cfd7;
}

.comp-fila--precio {
  align-items: center;
}

.comp-precio {
  font-family: 'Dosis', sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #18cfd7;
}

/* ─── Pie ─── */
.comp-footer {
  padding: 14px 28px;
  text-align: center;
}

.comp-footer p {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

/* ─── Acciones ─── */
.comp-actions {
  padding: 20px 28px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid #e5e7eb;
}

/* ─── Estados ─── */
.estado-box {
  text-align: center;
  padding: 60px 20px;
}

.estado-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.estado-box h3 {
  font-size: 20px;
  color: #1f2937;
  margin-bottom: 8px;
}

.estado-box p {
  color: #9ca3af;
  margin: 0;
}

/* ─── Print ─── */
@media print {
  .no-print { display: none !important; }
  .comprobante-page { background: #fff; }
  .comp-card { box-shadow: none; border: 1px solid #ccc; }
  .comp-container { padding-top: 10px; }
  .volver-link { display: none; }
}

@media (max-width: 480px) {
  .comp-header { flex-wrap: wrap; }
  .comp-status-badge { width: 100%; text-align: center; }
  .comp-ruta { flex-direction: column; align-items: flex-start; }
  .comp-ruta-linea { flex-direction: row; width: 100%; }
  .comp-ruta-bar { height: 2px; width: 18px; }
  .comp-ciudad--end { align-items: flex-start; text-align: left; }
  .comp-actions { flex-direction: column; }
  .comp-actions .btn { width: 100%; }
}
</style>
