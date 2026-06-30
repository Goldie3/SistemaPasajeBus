<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <NuxtLink to="/" class="auth-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#18cfd7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><polygon points="6 17 18 17 21 21 3 21"/></svg>
          BusExpress
        </NuxtLink>
        <h2>Nueva contraseña</h2>
        <p>Ingresa tu nueva contraseña</p>
      </div>

      <div v-if="tokenInvalido" class="alert alert--error">
        ✕ El link es inválido o ya expiró.
        <NuxtLink to="/nuevapassword" style="font-weight:600;">Solicitar uno nuevo</NuxtLink>
      </div>

      <div v-else-if="exito" class="alert alert--success">
        ✓ Contraseña actualizada correctamente.
        <NuxtLink to="/login" style="font-weight:600;">Ir al login</NuxtLink>
      </div>

      <template v-else>
        <form @submit.prevent="handleSubmit">
          <div class="field">
            <label>Nueva contraseña</label>
            <input v-model="form.password" type="password" placeholder="Mínimo 6 caracteres" :disabled="loading" required />
            <span v-if="errors.password" class="error">{{ errors.password }}</span>
          </div>
          <div class="field">
            <label>Confirmar contraseña</label>
            <input v-model="form.confirmar" type="password" placeholder="Repite la contraseña" :disabled="loading" required />
            <span v-if="errors.confirmar" class="error">{{ errors.confirmar }}</span>
          </div>
          <span v-if="errors.general" class="error" style="margin-bottom:12px;display:block;">{{ errors.general }}</span>
          <button type="submit" class="btn btn--primary btn--block" :disabled="loading" style="height:44px;">
            {{ loading ? 'Guardando...' : 'Guardar contraseña' }}
          </button>
        </form>
      </template>

      <div class="auth-footer">
        <NuxtLink to="/login">← Volver al inicio de sesión</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const route = useRoute()
const router = useRouter()
const token = computed(() => route.query.token || '')

const form = reactive({ password: '', confirmar: '' })
const errors = reactive({})
const loading = ref(false)
const exito = ref(false)
const tokenInvalido = ref(false)

onMounted(() => { if (!token.value) tokenInvalido.value = true })

const validate = () => {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.password) errors.password = 'La contraseña es requerida'
  else if (form.password.length < 6) errors.password = 'Mínimo 6 caracteres'
  if (!form.confirmar) errors.confirmar = 'Confirma tu contraseña'
  else if (form.password !== form.confirmar) errors.confirmar = 'Las contraseñas no coinciden'
  return Object.keys(errors).length === 0
}

const handleSubmit = async () => {
  if (!validate()) return
  loading.value = true; Object.keys(errors).forEach(k => delete errors[k])
  try {
    await $fetch('/auth/reset-password', { method: 'POST', body: { token: token.value, password: form.password } })
    exito.value = true; setTimeout(() => router.push('/login'), 2500)
  } catch (err) {
    const msg = err?.data?.message || ''
    if (msg.includes('inválido') || msg.includes('expirado')) { tokenInvalido.value = true }
    else { errors.general = msg || 'Ocurrió un error.' }
  } finally { loading.value = false }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh; display: flex; justify-content: center; align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f0 100%); padding: 20px;
}
.auth-card {
  width: 100%; max-width: 400px; background: #fff; border-radius: 16px;
  padding: 36px 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.08);
}
.auth-header { text-align: center; margin-bottom: 24px; }
.auth-logo {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: 'Dosis', sans-serif; font-size: 22px; font-weight: 700;
  color: #18cfd7; text-decoration: none; margin-bottom: 12px;
}
.auth-header h2 { font-family: 'Dosis', sans-serif; font-size: 24px; color: #1f2937; margin-bottom: 4px; }
.auth-header p { font-size: 13px; color: #9ca3af; margin: 0; }
.auth-footer { margin-top: 20px; text-align: center; font-size: 13px; }
</style>
