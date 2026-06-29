<template>
  <div>
    <nav class="navbar navbar--solid">
      <NuxtLink to="/" class="navbar-brand">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><polygon points="6 17 18 17 21 21 3 21"/></svg>
        BusExpress
      </NuxtLink>

      <div class="navbar-links" v-if="!ocultarLinks">
        <template v-if="!usuario">
          <NuxtLink to="/login" class="nav-link">Ingresar</NuxtLink>
          <NuxtLink to="/register" class="btn btn--primary">Registrarse</NuxtLink>
        </template>
        <template v-else>
          <template v-if="usuario.rol === 'admin'">
            <NuxtLink to="/rutas" class="nav-link">Rutas</NuxtLink>
            <NuxtLink to="/pasajes" class="nav-link">Pasajes</NuxtLink>
          </template>
          <NuxtLink to="/busquedarutas" class="nav-link">Buscar viajes</NuxtLink>
          <NuxtLink to="/principal" class="nav-link">Mi cuenta</NuxtLink>
          <button class="btn btn--danger" @click="cerrarSesion" style="padding:6px 14px;font-size:12px;">Salir</button>
        </template>
      </div>
    </nav>

    <main style="padding-top: var(--nav-height); min-height: 100vh;">
      <slot />
    </main>
  </div>
</template>

<script setup>
const token = useCookie('auth_token')
const router = useRouter()
const route = useRoute()
const usuario = ref(null)

const ocultarLinks = computed(() =>
  ['/login', '/register', '/nuevapassword', '/reset-password'].includes(route.path)
)

onMounted(async () => {
  if (token.value) {
    try {
      const data = await $fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      usuario.value = data.data
    } catch { usuario.value = null }
  }
})

const cerrarSesion = () => {
  token.value = null
  usuario.value = null
  router.push('/login')
}
</script>
