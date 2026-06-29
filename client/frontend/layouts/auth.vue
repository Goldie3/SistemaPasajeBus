<template>
  <div>
    <nav class="navbar navbar--solid">
      <NuxtLink to="/" class="navbar-brand">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><polygon points="6 17 18 17 21 21 3 21"/></svg>
        BusExpress
      </NuxtLink>

      <div class="navbar-links">
        <template v-if="!usuario">
          <NuxtLink to="/login" class="nav-link">Ingresar</NuxtLink>
          <NuxtLink to="/register" class="btn btn--primary">Registrarse</NuxtLink>
        </template>
        <template v-else>
          <span class="nav-user">{{ usuario.nombre }}</span>
          <span class="rol-badge-sm">{{ usuario.rol === 'admin' ? 'Admin' : 'User' }}</span>
          <button class="btn btn--danger" @click="cerrarSesion" style="padding:6px 14px;font-size:12px;">Salir</button>
        </template>
      </div>
    </nav>

    <AppTabs :usuario="usuario" v-if="usuario" />

    <main :style="{ paddingTop: usuario ? 'calc(var(--nav-height) + var(--tabs-height))' : 'var(--nav-height)', minHeight: '100vh' }">
      <slot />
    </main>
  </div>
</template>

<script setup>
const token = useCookie('auth_token')
const router = useRouter()
const usuario = ref(null)

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

<style>
:root { --tabs-height: 46px; }
</style>

<style scoped>
.nav-user {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-dark);
}

.rol-badge-sm {
  background: var(--primary-light);
  color: var(--primary);
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>