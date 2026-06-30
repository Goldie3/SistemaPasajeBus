<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <NuxtLink to="/" class="auth-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#18cfd7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><polygon points="6 17 18 17 21 21 3 21"/></svg>
          BusExpress
        </NuxtLink>
        <h2>Iniciar sesión</h2>
        <p>Ingresa tus credenciales para continuar</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="field">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="tu@email.com" :disabled="loading" />
          <span v-if="errors.email" class="error">{{ errors.email }}</span>
        </div>

        <div class="field">
          <label>Contraseña</label>
          <input v-model="form.password" type="password" placeholder="••••••••" :disabled="loading" />
          <span v-if="errors.password" class="error">{{ errors.password }}</span>
        </div>

        <span v-if="errors.general" class="error" style="margin-bottom:12px;display:block;">{{ errors.general }}</span>

        <button type="submit" class="btn btn--primary btn--block" :disabled="loading" style="height:44px;">
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>

      <div class="auth-footer">
        <NuxtLink to="/nuevapassword">¿Olvidaste tu contraseña?</NuxtLink>
        <p>¿No tienes cuenta? <NuxtLink to="/register">Regístrate aquí</NuxtLink></p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const form = reactive({ email: '', password: '' })
const errors = reactive({})
const loading = ref(false)
const router = useRouter()

const validate = () => {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.email) errors.email = 'El email es requerido'
  else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Email inválido'
  if (!form.password) errors.password = 'La contraseña es requerida'
  return Object.keys(errors).length === 0
}

const handleLogin = async () => {
  if (!validate()) return
  loading.value = true
  try {
    const data = await $fetch('/auth/login', { method: 'POST', body: form })
    const token = useCookie('auth_token')
    token.value = data.data.accessToken
    router.push('/principal')
  } catch (err) {
    errors.general = err.data?.message || 'Error al iniciar sesión'
  } finally { loading.value = false }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f0 100%);
  padding: 20px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  padding: 36px 32px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
}

.auth-header { text-align: center; margin-bottom: 28px; }

.auth-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Dosis', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #18cfd7;
  text-decoration: none;
  margin-bottom: 16px;
}

.auth-header h2 {
  font-family: 'Dosis', sans-serif;
  font-size: 24px;
  color: #1f2937;
  margin-bottom: 4px;
}

.auth-header p {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

.auth-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  color: #6b7280;
}

.auth-footer p { margin: 8px 0 0; }
</style>
