<!-- pages/reset-password.vue -->
<template>
  <div class="container">
    <form @submit.prevent="handleSubmit">
      <h2>Nueva contraseña</h2>
      <p class="subtitle">Ingresa tu nueva contraseña.</p>

      <div v-if="tokenInvalido" class="alert alert--error">
        ✕ El link es inválido o ya expiró.
        <NuxtLink to="/forgot-password">Solicitar uno nuevo</NuxtLink>
      </div>

      <div v-else-if="exito" class="alert alert--success">
        ✓ Contraseña actualizada correctamente.
        <NuxtLink to="/login">Ir al login</NuxtLink>
      </div>

      <template v-else>
        <div class="field">
          <label>Nueva contraseña</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            :disabled="loading"
            required
          />
          <span v-if="errors.password" class="error">{{ errors.password }}</span>
        </div>

        <div class="field">
          <label>Confirmar contraseña</label>
          <input
            v-model="form.confirmar"
            type="password"
            placeholder="••••••••"
            :disabled="loading"
            required
          />
          <span v-if="errors.confirmar" class="error">{{ errors.confirmar }}</span>
        </div>

        <span v-if="errors.general" class="error">{{ errors.general }}</span>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Guardando...' : 'Guardar contraseña' }}
        </button>
      </template>

      <div class="links">
        <NuxtLink to="/login">← Volver al login</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const token = computed(() => route.query.token || '')

const form = reactive({ password: '', confirmar: '' })
const errors = reactive({})
const loading = ref(false)
const exito = ref(false)
const tokenInvalido = ref(false)

// Si no hay token en la URL, marcar como inválido inmediatamente
onMounted(() => {
  if (!token.value) tokenInvalido.value = true
})

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

  loading.value = true
  Object.keys(errors).forEach(k => delete errors[k])

  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        password: form.password,
      },
    })
    exito.value = true
    setTimeout(() => router.push('/login'), 2500)
  } catch (err) {
    const msg = err?.data?.message || ''
    if (msg.includes('inválido') || msg.includes('expirado')) {
      tokenInvalido.value = true
    } else {
      errors.general = msg || 'Ocurrió un error. Intenta de nuevo.'
    }
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
  line-height: 1.6;
}
.alert--success { background: #dcfce7; color: #166534; }
.alert--error   { background: #fee2e2; color: #991b1b; }
.alert a { color: inherit; font-weight: 600; margin-left: 0.25rem; }

.error { color: #dc2626; font-size: 0.82rem; margin-top: 0.25rem; display: block; }

.links {
  margin-top: 1.25rem;
  text-align: center;
  font-size: 0.85rem;
}
.links a { color: #3b82f6; text-decoration: none; }
.links a:hover { text-decoration: underline; }
</style>