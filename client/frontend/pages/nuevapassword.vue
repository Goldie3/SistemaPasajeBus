<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <NuxtLink to="/" class="auth-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#18cfd7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><polygon points="6 17 18 17 21 21 3 21"/></svg>
          BusExpress
        </NuxtLink>
        <h2>Restablecer contraseña</h2>
        <p>Ingresa tu email y te enviaremos instrucciones</p>
      </div>

      <div v-if="exito" class="alert alert--success">
        ✓ Si el email está registrado, recibirás un correo en breve.
      </div>

      <template v-if="!exito">
        <form @submit.prevent="handleSubmit">
          <div class="field">
            <label>Email</label>
            <input v-model="email" type="email" placeholder="tu@email.com" :disabled="loading" required />
            <span v-if="error" class="error">{{ error }}</span>
          </div>
          <button type="submit" class="btn btn--primary btn--block" :disabled="loading" style="height:44px;">
            {{ loading ? 'Enviando...' : 'Enviar instrucciones' }}
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

const email = ref('')
const loading = ref(false)
const exito = ref(false)
const error = ref('')

const handleSubmit = async () => {
  error.value = ''; loading.value = true
  try {
    await $fetch('/api/auth/forgot-password', { method: 'POST', body: { email: email.value } })
    exito.value = true
  } catch (err) { error.value = err?.data?.message || 'Ocurrió un error.' }
  finally { loading.value = false }
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
