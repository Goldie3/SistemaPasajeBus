<template>
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
</template>

<script setup>
definePageMeta({ layout: false })
const router = useRouter()
const filtros = reactive({ origen: '', destino: '', fecha: '' })

const buscar = () => {
  const params = new URLSearchParams()
  if (filtros.origen) params.set('origen', filtros.origen)
  if (filtros.destino) params.set('destino', filtros.destino)
  if (filtros.fecha) params.set('fecha', filtros.fecha)
  router.push(`/busquedarutas?${params.toString()}`)
}
</script>

<style scoped>
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

@media (max-width: 768px) {
  .search-row { flex-direction: column; }
}

.search-field {
  flex: 1;
  text-align: left;
}

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

.search-field input:focus {
  border-color: #18cfd7;
}

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
</style>
