<!-- pages/forgot-password.vue -->
<template>
  <div class="container">
    <form @submit.prevent="handleSubmit">
      <h2>Restablecer contraseña</h2>
      <p class="subtitle">Ingresa tu email y te enviaremos instrucciones.</p>

      <div v-if="exito" class="alert alert--success">
        ✓ Si el email está registrado, recibirás un correo en breve.
        <br />
        <small v-if="tokenDev">
          <strong>Modo desarrollo — token:</strong> {{ tokenDev }}
        </small>
      </div>

      <template v-if="!exito">
        <div class="field">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="tu@email.com"
            :disabled="loading"
            required
          />
          <span v-if="error" class="error">{{ error }}</span>
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Enviando...' : 'Enviar instrucciones' }}
        </button>
      </template>

      <div class="links">
        <NuxtLink to="/login">← Volver al login</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>
const email = ref('')
const loading = ref(false)
const exito = ref(false)
const error = ref('')
const tokenDev = ref('') // solo en desarrollo

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    const data = await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value },
    })
    exito.value = true

    // En desarrollo el backend loguea el token; si lo devuelve en la respuesta
    // (solo para pruebas), lo mostramos acá
    if (data?.devToken) tokenDev.value = data.devToken
  } catch (err) {
    error.value = err?.data?.message || 'Ocurrió un error. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: sans-serif;
  background: #f9fafb;
}

form {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 400px;
}

h2 { margin: 0 0 0.25rem; font-size: 1.4rem; }
.subtitle { margin: 0 0 1.5rem; color: #6b7280; font-size: 0.9rem; }

.field { margin-bottom: 1rem; }
.field label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
  color: #374151;
}

.field input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.field input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

button[type="submit"] {
  width: 100%;
  padding: 0.6rem;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
button[type="submit"]:hover:not(:disabled) { background: #2563eb; }
button:disabled { opacity: 0.6; cursor: not-allowed; }

.alert {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
.alert--success { background: #dcfce7; color: #166534; }

.error { color: #dc2626; font-size: 0.82rem; margin-top: 0.25rem; display: block; }

.links {
  margin-top: 1.25rem;
  text-align: center;
  font-size: 0.85rem;
}
.links a { color: #3b82f6; text-decoration: none; }
.links a:hover { text-decoration: underline; }
</style>
