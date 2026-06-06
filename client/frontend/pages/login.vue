<!-- pages/login.vue -->
<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin">
      <h2>Iniciar Sesión</h2>

      <div class="field">
        <label>Email</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="tu@email.com"
          :disabled="loading"
        />
        <span v-if="errors.email" class="error">{{ errors.email }}</span>
      </div>

      <div class="field">
        <label>Contraseña</label>
        <input
          v-model="form.password"
          type="password"
          placeholder="••••••••"
          :disabled="loading"
        />
        <span v-if="errors.password" class="error">{{ errors.password }}</span>
      </div>

      <span v-if="errors.general" class="error">{{ errors.general }}</span>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Cargando...' : 'Entrar' }}
      </button>
    </form>
    <p>¿No tienes cuenta? <NuxtLink to="/register">Regístrate</NuxtLink></p>
  </div>
</template>

<script setup>
const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({})
const loading = ref(false)
const router = useRouter()

const validate = () => {
  Object.keys(errors).forEach(k => delete errors[k])

  if (!form.email) errors.email = 'El email es requerido'
  else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Email inválido'

  if (!form.password) errors.password = 'La contraseña es requerida'
  else if (form.password.length < 6) errors.password = 'Mínimo 6 caracteres'

  return Object.keys(errors).length === 0
}

const handleLogin = async () => {
  if (!validate()) return

  loading.value = true

  try {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: form,
    })

    // Guardar token (ejemplo con cookie o localStorage)
    const token = useCookie('auth_token')
    token.value = data.data.accessToken

    router.push('/principal')
  } catch (err) {
    errors.general = err.data?.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>