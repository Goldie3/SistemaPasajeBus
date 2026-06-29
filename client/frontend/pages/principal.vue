<template>
  <div class="inicio-page">
    <div class="container" style="padding-top:24px;padding-bottom:40px;">
      <div class="inicio-welcome">
        <div>
          <h1>Bienvenido, {{ usuario?.nombre }}</h1>
          <p class="text-muted">Panel de control — ¿qué deseas hacer hoy?</p>
        </div>
        <span class="rol-badge">{{ usuario?.rol === 'admin' ? 'Administrador' : 'Pasajero' }}</span>
      </div>

      <div class="inicio-stats">
        <div class="stat-card">
          <span class="stat-num">{{ stats.rutas }}</span>
          <span class="stat-label">Rutas disponibles</span>
        </div>
        <div class="stat-card">
          <span class="stat-num" style="color:var(--primary);">{{ usuario?.rol === 'admin' ? stats.pasajesHoy : stats.misPasajes }}</span>
          <span class="stat-label">{{ usuario?.rol === 'admin' ? 'Pasajes hoy' : 'Mis pasajes' }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-num" style="color:#f59e0b;">{{ stats.totalPasajes }}</span>
          <span class="stat-label">{{ usuario?.rol === 'admin' ? 'Total pasajes' : 'Pasajes próximos' }}</span>
        </div>
      </div>

      <h2 style="font-size:20px;margin-bottom:16px;">Acceso rápido</h2>
      <div class="inicio-grid">
        <NuxtLink to="/busquedarutas" class="acceso-card acceso-card--primary">
          <div class="acceso-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <div>
            <h3>Buscar viajes</h3>
            <p>Encuentra rutas y reserva tu pasaje</p>
          </div>
        </NuxtLink>

        <!-- Mis Pasajes (visible para todos los usuarios) -->
        <div class="acceso-card acceso-card--expandible" :class="{ 'acceso-card--open': misPasajesOpen }">
          <div class="acceso-card-head" @click="misPasajesOpen = !misPasajesOpen">
            <div class="acceso-icon" style="background:var(--primary-light);color:var(--primary);">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
            </div>
            <div style="flex:1;">
              <h3>Mis Pasajes</h3>
              <p>Consulta y descarga tus comprobantes</p>
            </div>
            <svg class="acceso-chevron" :class="{ 'acceso-chevron--open': misPasajesOpen }" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          <div v-if="misPasajesOpen" class="mispasajes-body">
            <div v-if="cargandoPasajes" class="mispasajes-estado">Cargando...</div>
            <div v-else-if="!misPasajesList.length" class="mispasajes-estado">No tienes pasajes aún. ¡Busca un viaje!</div>
            <div v-else class="mispasajes-lista">
              <NuxtLink
                v-for="p in misPasajesList"
                :key="p.id"
                :to="`/comprobante/${p.id}`"
                class="mispasajes-item"
              >
                <div class="mispasajes-ruta">
                  <span class="mispasajes-origen">{{ p.ruta?.origen ?? '—' }}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  <span class="mispasajes-destino">{{ p.ruta?.destino ?? '—' }}</span>
                </div>
                <div class="mispasajes-meta">
                  <span>{{ p.ruta ? formatearFecha(p.ruta.fecha) : '—' }}</span>
                  <span class="mispasajes-asiento">Asiento {{ p.asiento }}</span>
                </div>
                <span class="mispasajes-link">Ver comprobante →</span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <template v-if="usuario?.rol === 'admin'">
          <NuxtLink to="/rutas" class="acceso-card">
            <div class="acceso-icon" style="background:var(--primary-light);color:var(--primary);">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div>
              <h3>Gestión de Rutas</h3>
              <p>Administra las rutas del sistema</p>
            </div>
          </NuxtLink>

          <NuxtLink to="/pasajes" class="acceso-card">
            <div class="acceso-icon" style="background:var(--primary-light);color:var(--primary);">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <div>
              <h3>Gestión de Pasajes</h3>
              <p>Administra los pasajes de todos los pasajeros</p>
            </div>
          </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth', layout: 'auth' })


const token = useCookie('auth_token')
const router = useRouter()
const usuario = ref(null)
const stats = reactive({ rutas: 0, pasajesHoy: 0, totalPasajes: 0, misPasajes: 0 })

const misPasajesOpen = ref(false)
const misPasajesList = ref([])
const cargandoPasajes = ref(false)

const formatearFecha = (f) =>
  f ? new Date(f).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'

const cargarMisPasajes = async () => {
  cargandoPasajes.value = true
  try {
    const p = await $fetch('/api/pasajes', { headers: { Authorization: `Bearer ${token.value}` } })
    const lista = Array.isArray(p) ? p : (p.data ?? [])
    misPasajesList.value = lista
    const ahora = new Date()
    stats.misPasajes = lista.length
    stats.totalPasajes = lista.filter(x => x.ruta && new Date(x.ruta.fecha) >= ahora).length
  } catch {}
  finally { cargandoPasajes.value = false }
}

watch(misPasajesOpen, (open) => {
  if (open && !misPasajesList.value.length) cargarMisPasajes()
})

onMounted(async () => {
  //if (!token.value) { router.push('/login'); return }//
  try {
    const data = await $fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    usuario.value = data.data
  } catch { //router.push('/login'); return// 
  }

  try {
    const rutas = await $fetch('/api/rutas')
    stats.rutas = (Array.isArray(rutas) ? rutas : rutas.data ?? []).length
  } catch {}

  if (usuario.value?.rol === 'admin') {
    try {
      const pjs = await $fetch('/api/pasajes/admin', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      const lista = Array.isArray(pjs) ? pjs : pjs.data ?? []
      stats.totalPasajes = lista.length
      const hoy = new Date().toDateString()
      stats.pasajesHoy = lista.filter(p => new Date(p.createdAt).toDateString() === hoy).length
    } catch {}
  } else {
    await cargarMisPasajes()
  }
})
</script>

<style scoped>
.inicio-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.inicio-welcome {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.inicio-welcome h1 {
  font-family: 'Dosis', sans-serif;
  font-size: 26px;
  color: #1f2937;
  margin-bottom: 2px;
}

.rol-badge {
  background: var(--primary-light);
  color: var(--primary);
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.inicio-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

@media (max-width: 600px) { .inicio-stats { grid-template-columns: 1fr; } }

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-num {
  font-family: 'Dosis', sans-serif;
  font-size: 32px;
  font-weight: 800;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #9ca3af;
}

.inicio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.acceso-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.acceso-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  border-color: var(--primary);
}

.acceso-card--primary {
  background: linear-gradient(135deg, var(--primary) 0%, #0ea5b0 100%);
  color: #fff;
  border-color: transparent;
}

.acceso-card--primary h3 { color: #fff; }
.acceso-card--primary p { color: rgba(255,255,255,0.85); }
.acceso-card--primary .acceso-icon { background: rgba(255,255,255,0.2); color: #fff; }

.acceso-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex-shrink: 0;
}

.acceso-card h3 {
  font-family: 'Dosis', sans-serif;
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 2px;
  color: #1f2937;
}

.acceso-card p {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

/* ─── Acceso card expandible (Mis Pasajes) ─── */
.acceso-card--expandible {
  flex-direction: column;
  align-items: stretch;
  cursor: default;
  padding: 0;
  overflow: hidden;
}

.acceso-card-head {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  cursor: pointer;
  transition: background 0.15s;
}

.acceso-card-head:hover {
  background: #f9fafb;
}

.acceso-chevron {
  color: #9ca3af;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.acceso-chevron--open {
  transform: rotate(180deg);
}

.mispasajes-body {
  border-top: 1px solid #e5e7eb;
  padding: 12px 16px;
}

.mispasajes-estado {
  text-align: center;
  padding: 16px;
  color: #9ca3af;
  font-size: 13px;
}

.mispasajes-lista {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mispasajes-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s, background 0.15s;
}

.mispasajes-item:hover {
  border-color: var(--primary);
  background: var(--primary-light);
}

.mispasajes-ruta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 14px;
  color: #1f2937;
}

.mispasajes-ruta svg {
  color: var(--primary);
  flex-shrink: 0;
}

.mispasajes-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}

.mispasajes-asiento {
  background: #e0fafb;
  color: var(--primary);
  padding: 1px 8px;
  border-radius: 5px;
  font-weight: 600;
}

.mispasajes-link {
  font-size: 12px;
  color: var(--primary);
  font-weight: 600;
  margin-top: 2px;
}
</style>
