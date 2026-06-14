<!-- pages/register.vue -->
<template>
    <div class="register-container">
    <form class="register-card" @submit.prevent="handleRegister">

      <div class="logo">
        <h1>🚌 BusExpress</h1>
        <p>Sistema de Venta de Pasajes</p>
      </div>

      <h2>Crear cuenta</h2>

      <div class="field">
        <label>Nombre</label>
        <input
          v-model="form.nombre"
          type="text"
          placeholder="Tu nombre"
          :disabled="loading"
        />
        <span v-if="errors.nombre" class="error">
          {{ errors.nombre }}
        </span>
      </div>

      <div class="field">
        <label>Email</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="tu@email.com"
          :disabled="loading"
        />
        <span v-if="errors.email" class="error">
          {{ errors.email }}
        </span>
      </div>

      <div class="field">
        <label>Contraseña</label>
        <input
          v-model="form.password"
          type="password"
          placeholder="••••••••"
          :disabled="loading"
        />
        <span v-if="errors.password" class="error">
          {{ errors.password }}
        </span>
      </div>

      <div class="field">
        <label>Confirmar contraseña</label>
        <input
          v-model="form.confirm"
          type="password"
          placeholder="••••••••"
          :disabled="loading"
        />
        <span v-if="errors.confirm" class="error">
          {{ errors.confirm }}
        </span>
      </div>

      <span v-if="errors.general" class="error">
        {{ errors.general }}
      </span>

      <button
        class="register-btn"
        type="submit"
        :disabled="loading"
      >
        {{ loading ? 'Creando cuenta...' : 'Registrarse' }}
      </button>

      <p class="login-link">
        ¿Ya tienes cuenta?
        <NuxtLink to="/login">
          Inicia sesión
        </NuxtLink>
      </p>

    </form>
  </div>
</template>

<script setup>
import '~/assets/register.css'

const config = useRuntimeConfig()

const form = reactive({
  nombre: '',
  email: '',
  password: '',
  confirm: '',
})

const errors = reactive({})
const loading = ref(false)
const router = useRouter()

const validate = () => {
  Object.keys(errors).forEach(k => delete errors[k])

  if (!form.nombre) errors.nombre = 'El nombre es requerido'

  if (!form.email) errors.email = 'El email es requerido'
  else if (!/\S+@\S+\.\S+/.test(form.email))
    errors.email = 'Email inválido'

  if (!form.password) errors.password = 'La contraseña es requerida'
  else if (form.password.length < 6)
    errors.password = 'Mínimo 6 caracteres'

  if (form.password && form.confirm !== form.password)
    errors.confirm = 'Las contraseñas no coinciden'

  return Object.keys(errors).length === 0
}

const handleRegister = async () => {
  if (!validate()) return

  loading.value = true

  try {
    const data = await $fetch(
      `${config.public.apiUrl}/api/auth/register`,
      {
        method: 'POST',
        body: {
          nombre: form.nombre,
          email: form.email,
          password: form.password,
        },
      }
    )

    const token = useCookie('auth_token')
    token.value = data.data.accessToken

    router.push('/principal')

  } catch (err) {
    console.error(err)
    errors.general =
      err?.data?.message ||
      err?.message ||
      'Error al crear la cuenta'
  } finally {
    loading.value = false
  }
}
</script>