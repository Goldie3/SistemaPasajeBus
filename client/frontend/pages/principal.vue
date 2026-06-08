<template>
  <div class="dashboard">
    <nav>
      <h1>Sistema de Pasajes</h1>
      <div class="links">
        <NuxtLink to="/rutas">Rutas</NuxtLink>
        <NuxtLink to="/pasajes">Pasajes</NuxtLink>
        <button @click="cerrarSesion">Cerrar sesión</button>
      </div>
    </nav>

    <main>
      <h2>Bienvenido, {{ usuario?.nombre }}</h2>
      <p>Selecciona una opción del menú para comenzar.</p>

      <div class="cards">
        <NuxtLink to="/rutas" class="card">
          <h3>Rutas</h3>
          <p>Gestiona las rutas disponibles</p>
        </NuxtLink>

        <NuxtLink to="/pasajes" class="card">
          <h3>Pasajes</h3>
          <p>Gestiona los pasajes de los pasajeros</p>
        </NuxtLink>

        <div class="card card--action" @click="abrirModal">
          <h3>✈ Nuevo Viaje</h3>
          <p>Reserva un pasaje eligiendo una ruta</p>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <div v-if="modalAbierto" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal">
        <button class="modal-close" @click="cerrarModal">✕</button>
        <h3>Reservar Viaje</h3>

        <div v-if="exito" class="alert alert--success">
          ✓ Pasaje creado correctamente.
        </div>
        <div v-if="error" class="alert alert--error">
          {{ error }}
        </div>

        <form @submit.prevent="crearPasaje">
          <div class="field">
            <label>Nombre *</label>
            <input v-model="form.nombre" type="text" placeholder="Tu nombre" required />
          </div>

          <div class="field">
            <label>Apellido <span class="opcional">(opcional)</span></label>
            <input v-model="form.apellido" type="text" placeholder="Tu apellido" />
          </div>

          <div class="field">
            <label>Ruta *</label>
            <select v-model="form.rutaId" required :disabled="cargandoRutas">
              <option value="" disabled>
                {{ cargandoRutas ? 'Cargando rutas...' : 'Selecciona una ruta' }}
              </option>
              <option v-for="ruta in rutas" :key="ruta.id" :value="ruta.id">
                {{ ruta.Nombre }}
              </option>
            </select>
          </div>

          <div class="field">
            <label>Fecha *</label>
            <input v-model="form.fecha" type="date" :min="hoy" required />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn--secondary" @click="cerrarModal">Cancelar</button>
            <button type="submit" class="btn btn--primary" :disabled="enviando">
              {{ enviando ? 'Creando...' : 'Reservar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import '~/assets/principal.css'
definePageMeta({ middleware: 'auth' })

const token = useCookie('auth_token')
const router = useRouter()
const usuario = ref(null)

// Modal
const modalAbierto = ref(false)
const rutas = ref([])
const cargandoRutas = ref(false)
const enviando = ref(false)
const exito = ref(false)
const error = ref('')

const hoy = new Date().toISOString().split('T')[0]

const form = reactive({
  nombre: '',
  apellido: '',
  rutaId: '',
  fecha: hoy
})

onMounted(async () => {
  if (!token.value) {
    router.push('/login')
    return
  }
  try {
    const data = await $fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    usuario.value = data.data
  } catch {
    router.push('/login')
  }
})

const abrirModal = async () => {
  exito.value = false
  error.value = ''
  modalAbierto.value = true

  if (rutas.value.length === 0) {
    cargandoRutas.value = true
    try {
      const data = await $fetch('/api/rutas', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      rutas.value = data.data ?? data
    } catch {
      error.value = 'No se pudieron cargar las rutas.'
    } finally {
      cargandoRutas.value = false
    }
  }
}

const cerrarModal = () => {
  modalAbierto.value = false
  exito.value = false
  error.value = ''
  Object.assign(form, { nombre: '', apellido: '', rutaId: '', fecha: hoy })
}

const crearPasaje = async () => {
  enviando.value = true
  error.value = ''
  exito.value = false
  try {
    await $fetch('/api/pasajes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        nombre: form.nombre,
        apellido: form.apellido || null,
        rutaId: form.rutaId,
        fecha: form.fecha
      }
    })
    exito.value = true
    Object.assign(form, { nombre: '', apellido: '', rutaId: '', fecha: hoy })
  } catch (e) {
    error.value = e?.data?.message ?? 'Ocurrió un error al crear el pasaje.'
  } finally {
    enviando.value = false
  }
}

const cerrarSesion = () => {
  token.value = null
  router.push('/login')
}
</script>
