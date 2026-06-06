<!-- pages/dashboard.vue -->
<template>
  <div class="dashboard">
    <nav>
      <h1>Sistema de Pasajes</h1>
      <div class="links">
        <NuxtLink to="/rutas">Rutas</NuxtLink>
        <NuxtLink to="/pasajes">Pasajes</NuxtLink>
        <button @click="cerrarSesion">Cerrar sesión</button>
      </div>
    </nav>

    <main>
      <h2>Bienvenido, {{ usuario?.nombre }}</h2>
      <p>Selecciona una opción del menú para comenzar.</p>

      <div class="cards">
        <NuxtLink to="/rutas" class="card">
          <h3>Rutas</h3>
          <p>Gestiona las rutas disponibles</p>
        </NuxtLink>

        <NuxtLink to="/pasajes" class="card">
          <h3>Pasajes</h3>
          <p>Gestiona los pasajes de los pasajeros</p>
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
const token = useCookie('auth_token')
const router = useRouter()
const usuario = ref(null)

onMounted(async () => {
  if (!token.value) {
    router.push('/login')
    return
  }

  try {
    const data = await $fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    usuario.value = data.data
  } catch {
    router.push('/login')
  }
})

const cerrarSesion = async () => {
  token.value = null
  router.push('/login')
}
</script>

<style scoped>
.dashboard { font-family: sans-serif; }

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid #eee;
}

nav h1 { margin: 0; font-size: 1.2rem; }

.links { display: flex; gap: 1rem; align-items: center; }
.links a { text-decoration: none; color: #333; }
.links a:hover { text-decoration: underline; }

main { padding: 2rem; }

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.card {
  display: block;
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s;
}

.card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.card span { font-size: 2rem; }
.card h3 { margin: 0.5rem 0 0.25rem; }
.card p { margin: 0; color: #666; font-size: 0.9rem; }
</style>