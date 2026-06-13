<template>
  <div class="dashboard">
    <nav>
      <h1>Sistema de Pasajes</h1>
      <div class="links">
        <template v-if="usuario?.rol === 'admin'">
          <NuxtLink to="/rutas">Rutas</NuxtLink>
          <NuxtLink to="/pasajes">Pasajes</NuxtLink>
        </template>
        <button @click="cerrarSesion">Cerrar sesión</button>
      </div>
    </nav>

    <main>
      <h2>Bienvenido, {{ usuario?.nombre }}</h2>
      <p>Selecciona una opción del menú para comenzar.</p>

      <div class="cards">
        <template v-if="usuario?.rol === 'admin'">
          <NuxtLink to="/rutas" class="card">
            <h3>Rutas</h3>
            <p>Gestiona las rutas disponibles</p>
          </NuxtLink>
          <NuxtLink to="/pasajes" class="card">
            <h3>Pasajes</h3>
            <p>Gestiona los pasajes de los pasajeros</p>
          </NuxtLink>
        </template>

        <NuxtLink to="/busquedarutas" class="card">
          <h3>🛣️ Buscar Rutas</h3>
          <p>Encuentra rutas disponibles para viajar</p>
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup>
import '~/assets/principal.css'
definePageMeta({ middleware: 'auth' })

const API = 'http://localhost:4000'
const token = useCookie('auth_token')
const router = useRouter()
const usuario = ref(null)
const auth = computed(() => ({ Authorization: `Bearer ${token.value}` }))

onMounted(async () => {
  if (!token.value) {
    router.push('/login')
    return
  }
  try {
    const data = await $fetch(`${API}/auth/me`, { headers: auth.value })
    usuario.value = data.data
  } catch {
    router.push('/login')
  }
})

const cerrarSesion = () => {
  token.value = null
  router.push('/login')
}
</script>