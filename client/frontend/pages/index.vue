<template>
  <div>
    <div class="hero">
      <nav class="navbar navbar--transparent">
        <NuxtLink to="/" class="navbar-brand" style="color:#fff;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><polygon points="6 17 18 17 21 21 3 21"/></svg>
          BusExpress
        </NuxtLink>

        <div class="navbar-links">
          <NuxtLink to="/login" class="btn btn--ghost" style="font-size:13px;">Ingresar</NuxtLink>
          <NuxtLink to="/register" class="btn btn--primary" style="font-size:13px;">Registrarse</NuxtLink>
        </div>
      </nav>

      <div class="hero-content">
        <h1 class="hero-title">Encuentra tu mejor pasaje en bus</h1>
        <p class="hero-subtitle">La forma más fácil de comprar pasajes online.</p>

        <form class="hero-search" @submit.prevent="buscar">
          <div class="search-row">
            <div class="search-field">
              <label>Origen</label>
              <input v-model="filtros.origen" type="text" placeholder="Ciudad de origen" />
            </div>
            <div class="search-field">
              <label>Destino</label>
              <input v-model="filtros.destino" type="text" placeholder="Ciudad de destino" />
            </div>
            <div class="search-field search-field--sm">
              <label>Ida</label>
              <input v-model="filtros.fecha" type="date" />
            </div>
            <button type="submit" class="btn btn--primary search-btn">Buscar pasajes</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ====== RUTAS DESTACADAS ====== -->
    <section class="destacadas-section">
      <div class="container">
        <div class="destacadas-header">
          <h2>Rutas destacadas</h2>
          <p>Algunos de los viajes más populares</p>
        </div>

        <div class="destacadas-grid">
          <div v-for="ruta in rutas" :key="ruta.id" class="destacada-card">
            <div class="destacada-top">
              <span class="destacada-origen">{{ ruta.origen }}</span>
              <svg class="destacada-flecha" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18cfd7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              <span class="destacada-destino">{{ ruta.destino }}</span>
            </div>

            <div class="destacada-info">
              <div class="destacada-info-item">
                <span class="di-label">Fecha</span>
                <span class="di-value">{{ formatearFecha(ruta.fecha) }}</span>
              </div>
              <div class="destacada-info-item">
                <span class="di-label">Hora</span>
                <span class="di-value">{{ formatearHora(ruta.fecha) }}</span>
              </div>
              <div class="destacada-info-item">
                <span class="di-label">Asientos</span>
                <span class="di-value">{{ ruta.capacidad }}</span>
              </div>
            </div>

            <div v-if="ruta.parada" class="destacada-parada">
              🚏 Parada: {{ ruta.parada }}
            </div>

            <div class="destacada-footer">
              <div class="destacada-precio">
                ${{ Number(ruta.precio).toLocaleString('es-CL') }}
                <span>CLP</span>
              </div>
              <NuxtLink :to="`/busquedarutas?origen=${ruta.origen}&destino=${ruta.destino}&fecha=${ruta.fecha?.slice(0,10)}`" class="btn btn--primary" style="padding:8px 18px;font-size:13px;">
                Reservar
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== FOOTER ====== -->
    <footer class="landing-footer">
      <div class="container">
        <div class="footer-inner">
          <div class="footer-brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#18cfd7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><polygon points="6 17 18 17 21 21 3 21"/></svg>
            BusExpress
          </div>
          <p class="footer-text">Sistema de Venta de Pasajes &copy; {{ new Date().getFullYear() }}</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })
const router = useRouter()
const filtros = reactive({ origen: '', destino: '', fecha: '' })
const rutas = ref([])

const buscar = () => {
  const params = new URLSearchParams()
  if (filtros.origen) params.set('origen', filtros.origen)
  if (filtros.destino) params.set('destino', filtros.destino)
  if (filtros.fecha) params.set('fecha', filtros.fecha)
  router.push(`/busquedarutas?${params.toString()}`)
}

const formatearFecha = (f) => f
  ? new Date(f).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
  : '—'
const formatearHora = (f) => f
  ? new Date(f).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
  : '—'

onMounted(async () => {
  try {
    const data = await $fetch('/api/rutas')
    rutas.value = (Array.isArray(data) ? data : data.data ?? []).slice(0, 3)
  } catch {}
})
</script>

<style scoped>
/* ===== HERO ===== */
.hero {
  min-height: 100vh;
  background:
    linear-gradient(rgba(0,20,40,0.7), rgba(0,20,40,0.7)),
    url('https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?w=1600');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
}

.hero-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.hero-title {
  font-family: 'Dosis', sans-serif;
  font-size: clamp(28px, 5vw, 52px);
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  margin-bottom: 12px;
}

.hero-subtitle {
  font-size: clamp(14px, 2vw, 18px);
  color: rgba(255,255,255,0.85);
  margin-bottom: 40px;
}

.hero-search {
  width: 100%;
  max-width: 860px;
  background: rgba(255,255,255,0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.3);
}

.search-row {
  display: flex;
  gap: 12px;
  align-items: end;
}

@media (max-width: 768px) { .search-row { flex-direction: column; } }

.search-field { flex: 1; text-align: left; }

.search-field label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.search-field input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  font-family: 'Open Sans', sans-serif;
  color: #1f2937;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.search-field input:focus { border-color: #18cfd7; }

.search-field--sm { flex: 0 0 180px; }
@media (max-width: 768px) { .search-field--sm { flex: 1; } }

.search-btn {
  height: 44px;
  padding: 0 32px;
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  border-radius: 8px;
  flex-shrink: 0;
}
@media (max-width: 768px) { .search-btn { width: 100%; } }

/* ===== RUTAS DESTACADAS ===== */
.destacadas-section {
  padding: 60px 0;
  background: #f5f7fa;
}

.destacadas-header {
  text-align: center;
  margin-bottom: 36px;
}

.destacadas-header h2 {
  font-family: 'Dosis', sans-serif;
  font-size: 30px;
  color: #1f2937;
  margin-bottom: 6px;
}

.destacadas-header p {
  color: #9ca3af;
  font-size: 15px;
  margin: 0;
}

.destacadas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.destacada-card {
  background: #fff;
  border-radius: 14px;
  padding: 22px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.destacada-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border-color: #18cfd7;
}

.destacada-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.destacada-origen,
.destacada-destino {
  font-family: 'Dosis', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  flex: 1;
}

.destacada-destino { text-align: right; }

.destacada-flecha { flex-shrink: 0; }

.destacada-info {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px;
}

.destacada-info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.di-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #9ca3af;
}

.di-value {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.destacada-parada {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 6px;
  padding: 4px 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
}

.destacada-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 4px;
  border-top: 1px solid #f3f4f6;
}

.destacada-precio {
  font-family: 'Dosis', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #18cfd7;
}

.destacada-precio span {
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  margin-left: 4px;
}

/* ===== FOOTER ===== */
.landing-footer {
  background: #1f2937;
  padding: 24px 0;
  color: rgba(255,255,255,0.7);
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Dosis', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #18cfd7;
}

.footer-text {
  margin: 0;
  font-size: 13px;
}
</style>
