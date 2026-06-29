<template>
  <div class="dashboard-page">
    <div class="container" style="padding-top:32px;padding-bottom:40px;">
      <div class="dashboard-welcome">
        <div>
          <h1>Bienvenido, {{ usuario?.nombre }}</h1>
          <p class="text-muted">¿Qué deseas hacer hoy?</p>
        </div>
        <span class="rol-badge">{{ usuario?.rol === 'admin' ? 'Administrador' : 'Pasajero' }}</span>
      </div>

      <div class="dashboard-grid">
        <NuxtLink to="/busquedarutas" class="dash-card dash-card--primary">
          <div class="dash-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <h3>Buscar viajes</h3>
          <p>Encuentra rutas disponibles y reserva tu pasaje</p>
        </NuxtLink>

        <template v-if="usuario?.rol === 'admin'">
          <NuxtLink to="/rutas" class="dash-card">
            <div class="dash-icon" style="background:#e0fafb;color:#18cfd7;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <h3>Gestión de Rutas</h3>
            <p>Administra las rutas disponibles del sistema</p>
          </NuxtLink>

          <NuxtLink to="/pasajes" class="dash-card">
            <div class="dash-icon" style="background:#e0fafb;color:#18cfd7;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <h3>Gestión de Pasajes</h3>
            <p>Administra los pasajes de todos los pasajeros</p>
          </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const token = useCookie('auth_token')
const router = useRouter()
const usuario = ref(null)

onMounted(async () => {
  if (!token.value) { router.push('/login'); return }
  try {
    const data = await $fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    usuario.value = data.data
  } catch { router.push('/login') }
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.dashboard-welcome {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.dashboard-welcome h1 {
  font-family: 'Dosis', sans-serif;
  font-size: 28px;
  color: #1f2937;
}

.rol-badge {
  background: #e0fafb;
  color: #18cfd7;
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.dash-card {
  background: #fff;
  border-radius: 14px;
  padding: 28px 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #e5e7eb;
}

.dash-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border-color: #18cfd7;
}

.dash-card--primary {
  background: linear-gradient(135deg, #18cfd7 0%, #0ea5b0 100%);
  color: #fff;
}

.dash-card--primary h3 { color: #fff; }
.dash-card--primary p { color: rgba(255,255,255,0.85); }
.dash-card--primary .dash-icon { background: rgba(255,255,255,0.2); color: #fff; }

.dash-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  margin-bottom: 16px;
}

.dash-card h3 {
  font-family: 'Dosis', sans-serif;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #1f2937;
}

.dash-card p {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}
</style>
