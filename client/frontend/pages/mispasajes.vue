<template>
  <div class="mispasajes-page">
    <div class="container" style="padding-top: 100px; padding-bottom: 40px;">
      <NuxtLink to="/principal" class="volver-link">← Volver al inicio</NuxtLink>
      
      <div class="page-header">
        <h1>Mis Pasajes</h1>
        <p>Consulta el historial de tus viajes y asientos reservados.</p>
      </div>
      <!-- Loading State -->
      <div v-if="loading" class="empty-state">
        <p>Cargando tus pasajes...</p>
      </div>
      <!-- Error State -->
      <div v-else-if="error" class="alert alert--error" style="margin-top: 16px;">
        {{ error }}
      </div>
      <!-- Empty State -->
      <div v-else-if="!pasajes.length" class="empty-state card">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: #9ca3af; margin-bottom: 16px;">
          <path d="M4 7h16v10H4z"/>
          <path d="M4 12h16"/>
          <path d="M8 7v10"/>
          <path d="M16 7v10"/>
        </svg>
        <h3>No tienes pasajes comprados</h3>
        <p>Aún no has realizado ninguna reserva de pasaje.</p>
        <NuxtLink to="/busquedarutas" class="btn btn--primary" style="margin-top: 24px; display: inline-block;">
          Buscar Viajes
        </NuxtLink>
      </div>
      <!-- List State -->
      <div v-else class="pasajes-list">
        <div v-for="pasaje in pasajes" :key="pasaje.id" class="pasaje-card card">
          <div class="ticket-header">
            <span class="ticket-id">Reserva #{{ pasaje.id.toString().padStart(4, '0') }}</span>
            <span class="ticket-date" v-if="pasaje.ruta">{{ formatearFecha(pasaje.ruta.fecha) }}</span>
          </div>
          
          <div class="ticket-body" v-if="pasaje.ruta">
            <div class="route-info">
              <div class="location">
                <span class="label">Origen</span>
                <span class="city">{{ pasaje.ruta.origen }}</span>
              </div>
              <div class="route-divider">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
              <div class="location text-right">
                <span class="label">Destino</span>
                <span class="city">{{ pasaje.ruta.destino }}</span>
              </div>
            </div>
            
            <div class="ticket-details">
              <div class="detail">
                <span class="label">Pasajero</span>
                <strong>{{ pasaje.nombre }} {{ pasaje.apellido || '' }}</strong>
              </div>
              <div class="detail">
                <span class="label">Asiento</span>
                <span class="seat-badge">{{ pasaje.asiento }}</span>
              </div>
              <div class="detail">
                <span class="label">Precio</span>
                <strong>${{ Number(pasaje.ruta.precio).toLocaleString('es-CL') }}</strong>
              </div>
            </div>
          </div>
          
          <div class="ticket-body" v-else>
            <p style="color: #6b7280;">Información de ruta no disponible.</p>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>
<script setup>
definePageMeta({ middleware: 'auth', layout: 'auth' })
const token = useCookie('auth_token')
const headers = computed(() => ({ Authorization: `Bearer ${token.value}` }))
const router = useRouter()
const pasajes = ref([])
const loading = ref(true)
const error = ref('')
const formatearFecha = (f) => f ? new Date(f).toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' }) : '—'
onMounted(async () => {
  if (!token.value) {
    router.push('/login')
    return
  }
  
  try {
    const data = await $fetch('/api/pasajes', { headers: headers.value })
    pasajes.value = Array.isArray(data) ? data : (data.data ?? [])
    const allPasajes = Array.isArray(data) ? data : (data.data ?? [])
    pasajes.value = allPasajes.filter(p => p.ruta)
  } catch (err) {
    error.value = err.data?.message || 'Error al cargar los pasajes. Inténtalo de nuevo más tarde.'
  } finally {
    loading.value = false
  }
})
</script>
<style scoped>
.mispasajes-page {
  min-height: 100vh;
  background: #f5f7fa;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
}
.empty-state h3 {
  font-size: 20px;
  color: #1f2937;
  margin-bottom: 8px;
}
.empty-state p {
  color: #6b7280;
}
.pasajes-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.pasaje-card {
  padding: 0;
  overflow: hidden;
  position: relative;
  border-left: 6px solid var(--primary);
}
.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f9fafb;
  border-bottom: 1px dashed #e5e7eb;
}
.ticket-id {
  font-weight: 700;
  color: #4b5563;
  font-size: 14px;
}
.ticket-date {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}
.ticket-body {
  padding: 24px;
}
.route-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.location {
  display: flex;
  flex-direction: column;
}
.location.text-right {
  text-align: right;
}
.location .label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  font-weight: 600;
  margin-bottom: 4px;
}
.location .city {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}
.route-divider {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  color: #d1d5db;
  padding: 0 20px;
}
.ticket-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
}
.detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.detail .label {
  font-size: 12px;
  color: #6b7280;
}
.detail strong {
  font-size: 15px;
  color: #1f2937;
}
.seat-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  color: var(--primary);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 16px;
}
@media (max-width: 600px) {
  .ticket-details {
    grid-template-columns: 1fr;
  }
  .location .city {
    font-size: 18px;
  }
}
</style>
