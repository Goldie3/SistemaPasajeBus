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
          <span class="stat-num" style="color:var(--primary);">{{ stats.pasajesHoy }}</span>
          <span class="stat-label">Pasajes hoy</span>
        </div>
        <div class="stat-card">
          <span class="stat-num" style="color:#f59e0b;">{{ stats.totalPasajes }}</span>
          <span class="stat-label">Total pasajes</span>
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
const stats = reactive({ rutas: 0, pasajesHoy: 0, totalPasajes: 0 })

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
</style>
